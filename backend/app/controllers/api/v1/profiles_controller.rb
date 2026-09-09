module Api
  module V1
    class ProfilesController < BaseController
      def me
        render json: { user: ApiSerializer.profile(current_user) }
      end

      def update
        current_user.update!(profile_params)
        render json: { user: ApiSerializer.profile(current_user) }
      end

      def show
        user = User.find(params[:id])
        render json: {
          profile: ApiSerializer.profile(user),
          connection_count: Connection.where(
            "requester_id = ? OR addressee_id = ?",
            user.id, user.id
          ).count,
          is_connected: current_user.connected_to?(user),
        }
      end

      def posts
        user = User.find(params[:id])
        viewer = current_user
        posts = user.posts.order(created_at: :desc).limit(50)
        ids = posts.map(&:id)
        like_counts = PostLike.where(post_id: ids).group(:post_id).count
        repost_counts = PostRepost.where(post_id: ids).group(:post_id).count
        comment_counts = PostComment.where(post_id: ids).group(:post_id).count
        render json: {
          posts: posts.map do |p|
            ApiSerializer.post(p, viewer: viewer,
                                 like_count: like_counts.fetch(p.id, 0),
                                 repost_count: repost_counts.fetch(p.id, 0),
                                 comment_count: comment_counts.fetch(p.id, 0))
          end,
        }
      end

      def activity
        user = User.find(params[:id])
        render json: { activity: ApiSerializer.activity(user) }
      end

      def calendar
        user = User.find(params[:id])
        days = params[:days].presence&.to_i || 371
        render json: { days: ApiSerializer.calendar(user, days: days) }
      end

      def connect
        other = User.find(params[:id])
        return render_error(:unprocessable_entity, "Cannot connect to yourself") if other.id == current_user.id

        if current_user.connected_to?(other)
          current_user.active_connections.where(addressee_id: other.id).destroy_all
          other.active_connections.where(addressee_id: current_user.id).destroy_all
          connected = false
        else
          current_user.active_connections.create!(addressee_id: other.id)
          Notification.create!(user_id: other.id, actor_id: current_user.id,
                               icon: "🤝", body: "#{current_user.full_name} sent you a connection request",
                               category: "network")
          connected = true
        end
        render json: {
          connected: connected,
          connection_count: Connection.where(
            "requester_id = ? OR addressee_id = ?",
            other.id, other.id
          ).count,
        }
      end

      def block
        other = User.find(params[:id])
        return render_error(:unprocessable_entity, "Cannot block yourself") if other.id == current_user.id
        current_user.blocking.find_or_create_by!(blocked_id: other.id)
        head :no_content
      end

      def show_by_username
        user = User.find_by!(username: params[:username])
        render json: { profile: ApiSerializer.profile(user) }
      end

      def posts_by_username
        user = User.find_by!(username: params[:username])
        viewer = current_user
        posts = user.posts.order(created_at: :desc).limit(50)
        ids = posts.map(&:id)
        like_counts = PostLike.where(post_id: ids).group(:post_id).count
        repost_counts = PostRepost.where(post_id: ids).group(:post_id).count
        comment_counts = PostComment.where(post_id: ids).group(:post_id).count
        render json: {
          posts: posts.map do |p|
            ApiSerializer.post(p, viewer: viewer,
                                 like_count: like_counts.fetch(p.id, 0),
                                 repost_count: repost_counts.fetch(p.id, 0),
                                 comment_count: comment_counts.fetch(p.id, 0))
          end,
        }
      end

      private

      def profile_params
        params.permit(:full_name, :bio, :role, :college, :github_url, :linkedin_url, :twitter_url,
                      :avatar_url, :cover_url, :username, :tech_stack)
      end
    end
  end
end