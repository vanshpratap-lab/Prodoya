class PostRepost < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :user_id, uniqueness: { scope: :post_id }

  after_create { user.increment!(:points, 5) }
  after_destroy { user.decrement!(:points, 5) }
end
