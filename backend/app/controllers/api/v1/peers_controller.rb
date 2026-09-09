module Api
  module V1
    class PeersController < BaseController
      def index
        all = User.order(points: :desc)
        connected_ids = current_user.connected_user_ids

        suggestions = {}
        all.each do |peer|
          next if peer.id == current_user.id
          score = 0.0
          score += current_user.peers_in_common(peer) * 2
          score += 1 if peer.college.present? && peer.college.casecmp?(current_user.college.to_s)
          score += (peer.points.to_f / 100.0)
          suggestions[peer.id] = score.round(4)
        end

        render json: {
          peers: all.map { |u| ApiSerializer.profile(u) },
          suggestions: suggestions,
          connected_ids: connected_ids,
        }
      end
    end
  end
end