class FeedController < ApplicationController
  before_action :authenticate_user!

  def index
    blocked_ids = current_user.blocking.pluck(:blocked_id) +
                  current_user.blocked_by.pluck(:blocker_id)

    @posts = Post.where.not(user_id: blocked_ids)
                 .ranked
                 .includes(:user, :post_likes, :post_comments, :post_reposts)

    @post_like_counts = PostLike.where(post_id: @posts.pluck(:id)).group(:post_id).count
    @post_comment_counts = PostComment.where(post_id: @posts.pluck(:id)).group(:post_id).count
    @post_repost_counts = PostRepost.where(post_id: @posts.pluck(:id)).group(:post_id).count
    @liked_post_ids = PostLike.where(user_id: current_user.id, post_id: @posts.pluck(:id)).pluck(:post_id)
    @reposted_post_ids = PostRepost.where(user_id: current_user.id, post_id: @posts.pluck(:id)).pluck(:post_id)
  end
end
