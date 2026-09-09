class ChannelsController < ApplicationController
  before_action :authenticate_user!

  def index
    @channels = Channel.order(:name)
    @selected_channel = @channels.find_by(id: params[:id]) || @channels.first
    @messages = @selected_channel&.messages&.includes(:user)&.order(created_at: :asc)&.limit(200) || []
  end
end
