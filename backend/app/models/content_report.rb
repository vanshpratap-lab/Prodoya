class ContentReport < ApplicationRecord
  belongs_to :reporter, class_name: "User"
  belongs_to :post, optional: true
  belongs_to :reported_user, class_name: "User", optional: true

  VALID_REASONS = %w[spam harassment misinformation inappropriate other]

  validates :reason, inclusion: { in: VALID_REASONS }
  validate :claim_present

  private

  def claim_present
    errors.add(:base, "Report must reference a post or a user") if post_id.nil? && reported_user_id.nil?
  end
end