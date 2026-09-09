class ProfilesController < ApplicationController
  def show
    @user = User.find_by!(username: params[:username])
    @posts = @user.posts.includes(:post_likes, :post_comments, :post_reposts)
                  .order(created_at: :desc).limit(50)
    @connection_count = Connection.where("requester_id = ? OR addressee_id = ?", @user.id, @user.id).count
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, alert: "User not found"
  end
end
