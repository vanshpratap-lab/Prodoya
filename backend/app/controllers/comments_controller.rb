class CommentsController < ApplicationController
  before_action :authenticate_user!

  def create
    @post = Post.find(params[:post_id])
    @comment = @post.post_comments.build(comment_params)
    @comment.user = current_user
    if @comment.save
      Notification.create!(
        user: @post.user,
        body: "#{current_user.full_name} commented on your post"
      ) unless @post.user_id == current_user.id
    end
    redirect_back fallback_location: root_path
  end

  def destroy
    @comment = PostComment.find(params[:id])
    @comment.destroy
    redirect_back fallback_location: root_path
  end

  private

  def comment_params
    params.require(:comment).permit(:body)
  end
end
