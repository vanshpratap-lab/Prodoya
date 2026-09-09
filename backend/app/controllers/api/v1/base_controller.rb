module Api
  module V1
    class BaseController < ActionController::Base
      skip_forgery_protection
      respond_to :json

      before_action :authenticate_api_user!

      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable
      rescue_from ActionController::ParameterMissing, with: :bad_request

      private

      # Non-bang warden auth so failures render 401 JSON instead of
      # hitting Devise's redirect-based failure app.
      def authenticate_api_user!
        warden.authenticate(scope: :user) ||
          render(json: { error: "Unauthorized" }, status: :unauthorized)
      end

      def warden
        request.env["warden"]
      end

      def render_error(status, message)
        render json: { error: message }, status: status
      end

      def not_found
        render_error(:not_found, "Not found")
      end

      def bad_request
        render_error(:bad_request, "Missing required parameter")
      end

      def unprocessable(exception)
        render_error(:unprocessable_entity, exception.record&.errors&.full_messages&.first || "Invalid data")
      end
    end
  end
end