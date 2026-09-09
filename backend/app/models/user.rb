class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  include Devise::JWT::RevocationStrategies::JTIMatcher

  has_many :posts, dependent: :destroy
  has_many :post_likes, dependent: :destroy
  has_many :post_reposts, dependent: :destroy
  has_many :post_comments, dependent: :destroy
  has_many :post_saves, dependent: :destroy
  has_many :saved_posts, through: :post_saves, source: :post
  has_many :messages, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :authored_notifications, class_name: "Notification", foreign_key: :actor_id, dependent: :nullify
  has_many :content_reports, class_name: "ContentReport", foreign_key: :reporter_id, dependent: :destroy

  has_many :active_connections, class_name: "Connection", foreign_key: :requester_id, dependent: :destroy
  has_many :passive_connections, class_name: "Connection", foreign_key: :addressee_id, dependent: :destroy

  has_many :blocking, class_name: "UserBlock", foreign_key: :blocker_id, dependent: :destroy
  has_many :blocked_by, class_name: "UserBlock", foreign_key: :blocked_id, dependent: :destroy

  has_many :direct_dms, class_name: "Channel", foreign_key: :participant_1, dependent: :destroy

  validates :username, presence: true, uniqueness: true, length: { minimum: 3, maximum: 30 },
                       format: { with: /\A[a-zA-Z0-9_]+\z/, message: "only allows letters, numbers and underscore" }
  validates :full_name, presence: true

  before_create :set_jti

  def connected_to?(other)
    return false if other.id == id
    Connection.where(
      "(requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
      id, other.id, other.id, id
    ).exists?
  end

  def connected_users
    User.where(id: connected_user_ids)
  end

  def connected_user_ids
    active_connections.pluck(:addressee_id) + passive_connections.pluck(:requester_id)
  end

  def blocked?(other)
    blocking.exists?(blocked_id: other.id) || blocked_by.exists?(blocker_id: other.id)
  end

  def peers_in_common(other)
    (connected_user_ids & other.connected_user_ids).size
  end

  def direct_chat_with(other)
    Channel.find_by(
      "(participant_1 = ? AND participant_2 = ?) OR (participant_1 = ? AND participant_2 = ?)",
      id, other.id, other.id, id
    )
  end

  private

  def set_jti
    self.jti ||= SecureRandom.uuid
  end
end