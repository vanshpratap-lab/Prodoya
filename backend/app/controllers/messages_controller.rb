class MessagesController < ApplicationController
  before_action :authenticate_user!

  def index
    @channel = Channel.find(params[:channel_id])
    @messages = @channel.messages.includes(:user).order(created_at: :asc).limit(200)
  end

  def create
    @channel = Channel.find(params[:channel_id])
    @message = @channel.messages.build(message_params)
    @message.user = current_user
    @message.save
    redirect_to channels_path(id: @channel.id)
  end

  private

  def message_params
    params.require(:message).permit(:body)
  end
end
