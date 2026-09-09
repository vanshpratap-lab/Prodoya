class PeersController < ApplicationController
  before_action :authenticate_user!

  def index
    @peers = User.where.not(id: current_user.id)
                 .where.not(id: current_user.blocking.pluck(:blocked_id))
                 .where.not(id: current_user.blocked_by.pluck(:blocker_id))
                 .order(points: :desc)

    @connected_ids = current_user.connected_users.pluck(:id)
  end
end
