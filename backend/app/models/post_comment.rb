class PostComment < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :body, presence: true

  after_create { user.increment!(:points, 3) }
  after_destroy { user.decrement!(:points, 3) }
end
