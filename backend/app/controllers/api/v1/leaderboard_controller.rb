module Api
  module V1
    class LeaderboardController < BaseController
      def index
        rows = User.all.map do |u|
          activity = ApiSerializer.activity(u)
          score = u.points.to_i +
                  activity[:active_days] * 2 +
                  activity[:projects_built] * 3 +
                  activity[:open_source_contributions] * 4 +
                  activity[:community_contributions] * 2 +
                  activity[:ai_impact_score] * 2
          ApiSerializer.leaderboard(u, score)
        end.sort_by { |r| -r[:rank_score] }.first(50)

        render json: { rows: rows }
      end
    end
  end
end