class LeaderboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @users = User.order(points: :desc).limit(50)
  end
end
