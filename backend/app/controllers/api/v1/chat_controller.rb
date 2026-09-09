module Api
  module V1
    class ChatController < BaseController
      def index
        channels = Channel.where.not(id: nil).order(:id).select do |c|
          c.participant_1.nil? || c.participant_1 == current_user.id || c.participant_2 == current_user.id
        end
        channel_ids = channels.map(&:id)
        messages = Message.where(channel_id: channel_ids).includes(:user).order(created_at: :asc).limit(500)

        render json: {
          channels: channels.map { |c| ApiSerializer.channel(c) },
          messages: messages.map { |m| ApiSerializer.message(m) },
        }
      end

      def create_message
        channel = Channel.find(params[:chat_id])
        allowed = channel.direct? ? (channel.participant_1 == current_user.id || channel.participant_2 == current_user.id) : true
        return render_error(:forbidden, "Not a participant") unless allowed

        message = channel.messages.new(user_id: current_user.id, body: params.require(:text).to_s.strip)
        return render_error(:unprocessable_entity, "Message cannot be empty") if message.body.blank?

        message.save!
        if channel.direct?
          recipient_id = channel.peer_of(current_user)
          Notification.create!(user_id: recipient_id, actor_id: current_user.id,
                               icon: "💬", body: "New message from #{current_user.full_name}",
                               category: "message") if recipient_id
        end
        render json: { message: ApiSerializer.message(message) }, status: :created
      end

      def direct
        peer = User.find(params.require(:peer_id))
        return render_error(:forbidden, "Connect first to message this user") unless current_user.connected_to?(peer)

        channel = current_user.direct_chat_with(peer)
        unless channel
          channel = Channel.create!(
            name: peer.full_name,
            emoji: "💬",
            description: "Direct message",
            participant_1: current_user.id,
            participant_2: peer.id
          )
        end
        render json: { chat_id: channel.id }
      end
    end
  end
end