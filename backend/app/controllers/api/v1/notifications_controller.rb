module Api
  module V1
    class NotificationsController < BaseController
      def index
        notifications = current_user.notifications.includes(:actor).order(created_at: :desc).limit(100)
        render json: { notifications: notifications.map { |n| ApiSerializer.notification(n) } }
      end

      def create
        note = current_user.notifications.new(
          icon: params[:icon].presence || "🔔",
          body: params.require(:text).to_s.strip,
          category: params[:category].presence || "system"
        )
        if note.save
          render json: { notification: ApiSerializer.notification(note) }, status: :created
        else
          render_error(:unprocessable_entity, note.errors.full_messages.first || "Could not create notification")
        end
      end

      def mark_read
        note = current_user.notifications.find(params[:id])
        note.update!(read_at: Time.current)
        head :no_content
      end

      def read_all
        current_user.notifications.unread.update_all(read_at: Time.current)
        head :no_content
      end

      def destroy
        current_user.notifications.find(params[:id]).destroy
        head :no_content
      end
    end
  end
end