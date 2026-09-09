class Connection < ApplicationRecord
  belongs_to :requester, class_name: "User"
  belongs_to :addressee, class_name: "User"

  validates :requester_id, uniqueness: { scope: :addressee_id }
  validate :not_self_connection

  private

  def not_self_connection
    errors.add(:base, "Cannot connect to yourself") if requester_id == addressee_id
  end
end
