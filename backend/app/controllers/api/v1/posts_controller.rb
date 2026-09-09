module Api
  module V1
    class PostsController < BaseController
      before_action :set_post, only: [:destroy, :like, :repost, :save, :comments, :add_comment]

      DIFFICULTY_POINTS = { "beginner" => 10, "intermediate" => 20, "advanced" => 35 }.freeze

      def index
        blocked_ids = blocked_user_ids
        posts = Post.where.not(user_id: blocked_ids)
          .includes(:user)
          .order(created_at: :desc)
          .limit(100)

        ids = posts.map(&:id)
        like_counts = PostLike.where(post_id: ids).group(:post_id).count
        repost_counts = PostRepost.where(post_id: ids).group(:post_id).count
        comment_counts = PostComment.where(post_id: ids).group(:post_id).count

        ranks = build_ranks(posts, like_counts, repost_counts, comment_counts)
        sorted = posts.sort_by { |p| -ranks.fetch(p.id, 0.0) }

        render json: {
          posts: sorted.map do |p|
            ApiSerializer.post(p, viewer: current_user,
                                 like_count: like_counts.fetch(p.id, 0),
                                 repost_count: repost_counts.fetch(p.id, 0),
                                 comment_count: comment_counts.fetch(p.id, 0))
          end,
          reposts: repost_entries(ids),
          ranks: ranks,
        }
      end

      def create
        post = current_user.posts.new(post_params)
        points = DIFFICULTY_POINTS.fetch(post.difficulty || "beginner", 10)
        if post.save
          current_user.increment!(:points, points)
          current_user.update!(last_post_at: Time.current)
          render json: { post: ApiSerializer.post(post, viewer: current_user) }, status: :created
        else
          render_error(:unprocessable_entity, post.errors.full_messages.first || "Could not create post")
        end
      end

      def destroy
        return render_error(:forbidden, "Cannot delete this post") unless @post.user_id == current_user.id
        @post.destroy
        head :no_content
      end

      def like
        if @post.liked_by?(current_user)
          @post.post_likes.find_by(user_id: current_user.id)&.destroy
          liked = false
        else
          @post.post_likes.create!(user_id: current_user.id)
          liked = true
        end
        render json: { liked: liked, like_count: @post.post_likes.count }
      end

      def repost
        if @post.reposted_by?(current_user)
          @post.post_reposts.find_by(user_id: current_user.id)&.destroy
          reposted = false
          created_at = nil
        else
          @post.post_reposts.create!(user_id: current_user.id)
          reposted = true
          created_at = Time.current.iso8601
        end
        render json: { reposted: reposted, repost_count: @post.post_reposts.count, created_at: created_at }
      end

      def save
        if @post.saved_by?(current_user)
          @post.post_saves.find_by(user_id: current_user.id)&.destroy
          saved = false
        else
          @post.post_saves.create!(user_id: current_user.id)
          saved = true
        end
        render json: { saved: saved }
      end

      def comments
        comments = @post.post_comments.includes(:user).order(created_at: :asc)
        render json: { comments: comments.map { |c| ApiSerializer.comment(c) } }
      end

      def add_comment
        comment = @post.post_comments.new(user_id: current_user.id, body: params.require(:text))
        if comment.save
          Notification.create!(user_id: @post.user_id, actor_id: current_user.id,
                               icon: "💬", body: "#{current_user.full_name} commented on your post",
                               category: "community") unless @post.user_id == current_user.id
          render json: { comment: ApiSerializer.comment(comment) }, status: :created
        else
          render_error(:unprocessable_entity, comment.errors.full_messages.first || "Could not add comment")
        end
      end

      private

      def set_post
        @post = Post.find(params[:post_id] || params[:id])
      end

      def post_params
        params.require(:post).permit(:content, :difficulty, :code_snippet,
                                     :github_url, :video_url, tags: [], image_urls: [])
      end

      def blocked_user_ids
        ids = current_user.blocking.pluck(:blocked_id)
        ids += current_user.blocked_by.pluck(:blocker_id)
        ids.uniq
      end

      def build_ranks(posts, like_counts, repost_counts, comment_counts)
        ranks = {}
        posts.each do |p|
          age_days = [(Time.current - p.created_at) / 86_400.0, 0.01].max
          engagement = (like_counts.fetch(p.id, 0) * 1) + (comment_counts.fetch(p.id, 0) * 3) + (repost_counts.fetch(p.id, 0) * 5) + 1
          mult = case p.difficulty
                 when "intermediate" then 1.15
                 when "advanced" then 1.3
                 else 1.0
                 end
          ranks[p.id] = engagement * (1.0 / (age_days + 2)) * mult
        end
        ranks
      end

      def repost_entries(post_ids)
        return [] if post_ids.empty?
        ids = current_user.blocking.pluck(:blocked_id) + current_user.blocked_by.pluck(:blocker_id)
        PostRepost.where(post_id: post_ids)
          .where.not(user_id: ids)
          .includes(:user)
          .order(created_at: :desc)
          .map do |r|
            {
              post_id: r.post_id,
              user_id: r.user_id,
              created_at: r.created_at.iso8601,
              reposter_name: r.user&.full_name || "Someone",
            }
          end
      end
    end
  end
end