class PostLike < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :user_id, uniqueness: { scope: :post_id }

  after_create { user.increment!(:points, 2) }
  after_destroy { user.decrement!(:points, 2) }
end
