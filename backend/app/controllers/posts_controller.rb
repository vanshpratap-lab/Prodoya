class PostsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_post, only: [:destroy, :like, :repost, :block]

  def create
    @post = current_user.posts.build(post_params)
    if @post.save
      current_user.increment!(:points, difficulty_points)
      redirect_to root_path, notice: "Post created (+#{difficulty_points} pts)"
    else
      redirect_to root_path, alert: @post.errors.full_messages.join(", ")
    end
  end

  def destroy
    @post.destroy
    current_user.decrement!(:points, difficulty_points_for(@post.difficulty))
    redirect_to root_path, notice: "Post deleted"
  end

  def like
    existing = PostLike.find_by(user_id: current_user.id, post_id: @post.id)
    if existing
      existing.destroy
    else
      PostLike.create!(user_id: current_user.id, post_id: @post.id)
    end
    redirect_back fallback_location: root_path
  end

  def repost
    existing = PostRepost.find_by(user_id: current_user.id, post_id: @post.id)
    if existing
      existing.destroy
    else
      PostRepost.create!(user_id: current_user.id, post_id: @post.id)
    end
    redirect_back fallback_location: root_path
  end

  def block
    UserBlock.find_or_create_by(blocker_id: current_user.id, blocked_id: @post.user_id)
    redirect_to root_path, notice: "User blocked"
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:content, :difficulty, :code_snippet, :github_url)
  end

  def difficulty_points
    case params[:post][:difficulty]
    when "beginner" then 10
    when "intermediate" then 20
    when "advanced" then 35
    else 10
    end
  end

  def difficulty_points_for(d)
    { "beginner" => 10, "intermediate" => 20, "advanced" => 35 }[d] || 10
  end
end
