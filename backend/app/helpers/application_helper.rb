module ApplicationHelper
  def active_tab?(name, current)
    "active" if current == name
  end

  def post_like_count(post)
    @post_like_counts && @post_like_counts[post.id] || post.post_likes.count
  end

  def post_repost_count(post)
    @post_repost_counts && @post_repost_counts[post.id] || post.post_reposts.count
  end

  def post_comment_count(post)
    @post_comment_counts && @post_comment_counts[post.id] || post.post_comments.count
  end

  def liked?(post)
    @liked_post_ids && @liked_post_ids.include?(post.id)
  end

  def reposted?(post)
    @reposted_post_ids && @reposted_post_ids.include?(post.id)
  end
end