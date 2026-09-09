class UsersController < ApplicationController
  before_action :authenticate_user!, except: [:show]

  def show
    @user = User.find(params[:id])
    @posts = @user.posts.includes(:post_likes, :post_comments, :post_reposts)
                  .order(created_at: :desc).limit(50)
    @connection_count = Connection.where("requester_id = ? OR addressee_id = ?", @user.id, @user.id).count
  end

  def connect
    @user = User.find(params[:id])
    existing = Connection.find_by(requester_id: current_user.id, addressee_id: @user.id)
    if existing
      existing.destroy
      redirect_back fallback_location: root_path, notice: "Disconnected"
    else
      Connection.create!(requester_id: current_user.id, addressee_id: @user.id)
      Notification.create!(
        user: @user,
        body: "#{current_user.full_name} connected with you"
      )
      redirect_back fallback_location: root_path, notice: "Connection request sent"
    end
  end

  def disconnect
    @user = User.find(params[:id])
    Connection.where(
      "(requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
      current_user.id, @user.id, @user.id, current_user.id
    ).destroy_all
    redirect_back fallback_location: root_path, notice: "Disconnected"
  end
end
