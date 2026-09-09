class Post < ApplicationRecord
  belongs_to :user
  has_many :post_likes, dependent: :destroy
  has_many :post_reposts, dependent: :destroy
  has_many :post_comments, dependent: :destroy
  has_many :post_saves, class_name: "PostSave", dependent: :destroy

  validates :content, presence: true
  validates :difficulty, inclusion: { in: %w[beginner intermediate advanced] }

  scope :ranked, -> {
    left_joins(:post_likes, :post_comments, :post_reposts)
      .select("posts.*,
        COALESCE(COUNT(DISTINCT post_likes.id), 0) AS like_count,
        COALESCE(COUNT(DISTINCT post_comments.id), 0) AS comment_count,
        COALESCE(COUNT(DISTINCT post_reposts.id), 0) AS repost_count,
        CASE posts.difficulty
          WHEN 'beginner' THEN 1.0
          WHEN 'intermediate' THEN 1.15
          WHEN 'advanced' THEN 1.3
          ELSE 1.0
        END AS difficulty_mult")
      .group("posts.id")
      .order(Arel.sql("(COALESCE(COUNT(DISTINCT post_likes.id), 0) * 1 +
        COALESCE(COUNT(DISTINCT post_comments.id), 0) * 3 +
        COALESCE(COUNT(DISTINCT post_reposts.id), 0) * 5 + 1) *
        (1.0 / (julianday('now') - julianday(posts.created_at) + 2)) *
        CASE posts.difficulty
          WHEN 'beginner' THEN 1.0
          WHEN 'intermediate' THEN 1.15
          WHEN 'advanced' THEN 1.3
          ELSE 1.0
        END DESC"))
  }

  def liked_by?(user)
    post_likes.exists?(user_id: user.id)
  end

  def reposted_by?(user)
    post_reposts.exists?(user_id: user.id)
  end

  def saved_by?(user)
    return false unless user
    post_saves.exists?(user_id: user.id)
  end
end
