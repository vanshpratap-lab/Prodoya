class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :actor, class_name: "User", optional: true

  CATEGORIES = %w[community network message ai system]

  validates :category, inclusion: { in: CATEGORIES }, allow_nil: true
  validates :body, presence: true

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc).limit(100) }

  def read?
    read_at.present?
  end
end