class Channel < ApplicationRecord
  has_many :messages, dependent: :destroy

  validates :name, presence: true, uniqueness: true, if: -> { participant_1.nil? }
  validates :name, presence: true
  validates :participant_2, numericality: { allow_nil: true }

  # Public/community channel = no participants. DM = exactly two participants.
  scope :community, -> { where(participant_1: nil, participant_2: nil) }
  scope :for_user, ->(user) {
    where("participant_1 = ? OR participant_2 = ?", user.id, user.id)
  }

  def direct?
    participant_1.present? && participant_2.present?
  end

  def peer_of(user)
    return nil unless direct?
    participant_1 == user.id ? participant_2 : participant_1
  end
end