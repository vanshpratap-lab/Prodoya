module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :authenticate_api_user!, only: :create

      def create
        email = params.require(:email).to_s.strip.downcase
        password = params.require(:password)

        user = User.find_for_database_authentication(email: email)
        if user && user.valid_password?(password)
          token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
          render json: { token: token, user: ApiSerializer.profile(user) }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def destroy
        token = request.headers.fetch("Authorization", "").split(" ").last
        payload = Warden::JWTAuth::TokenDecoder.new.call(token)
        if payload && payload["sub"]
          user = User.find(payload["sub"])
          User.revoke_jwt(payload, user)
        end
      rescue JWT::DecodeError
        Rails.logger.warn("Sign out with already-invalid token")
      ensure
        head :no_content
      end
    end
  end
end