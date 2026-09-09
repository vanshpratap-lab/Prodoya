module Api
  module V1
    class SearchController < BaseController
      def index
        q = params[:q].to_s.strip
        return render(json: { people: [], posts: [] }) if q.length < 2

        like = "%#{q.gsub(/[%_\\]/, "")}%"

        people = User.where(
          "LOWER(full_name) LIKE :q OR LOWER(username) LIKE :q OR LOWER(college) LIKE :q OR LOWER(role) LIKE :q",
          q: like.downcase
        ).limit(6)

        posts = Post.joins(:user)
          .where("LOWER(posts.content) LIKE :q", q: like.downcase)
          .includes(:user)
          .order(created_at: :desc)
          .limit(6)

        render json: {
          people: people.map { |u| ApiSerializer.profile(u) },
          posts: posts.map do |p|
            ApiSerializer.post(p, viewer: current_user,
                                  like_count: p.post_likes.count,
                                  repost_count: p.post_reposts.count,
                                  comment_count: p.post_comments.count)
          end,
        }
      end
    end
  end
end