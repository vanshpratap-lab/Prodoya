module Api
  module V1
    class RegistrationsController < BaseController
      skip_before_action :authenticate_api_user!, only: :create

      def create
        username = params[:username].to_s.strip
        username = generate_username if username.blank?
        user = User.new(user_params.merge(username: username))
        if user.save
          token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
          render json: { token: token, user: ApiSerializer.profile(user) }, status: :created
        else
          render json: { error: user.errors.full_messages.first || "Could not create account" },
                 status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.permit(
          :email, :password, :password_confirmation, :username,
          :full_name, :college, :role, :avatar_url
        ).merge(college: params[:college] || "", role: params[:role].presence || "Engineering Student")
      end

      # Fallback so signup never fails on a blank username (e.g. older
      # clients that don't send one). Sanitized + uniquified.
      def generate_username
        base = params[:email].to_s.split("@").first.to_s
          .parameterize(separator: "_").gsub(/[^a-z0-9_]/, "")[0, 20]
        if base.length < 3
          base = params[:full_name].to_s
            .parameterize(separator: "_").gsub(/[^a-z0-9_]/, "")[0, 20]
        end
        base = "user" if base.length < 3
        candidate = base
        i = 0
        while User.exists?(username: candidate)
          i += 1
          candidate = "#{base[0, 22]}_#{i}"
        end
        candidate
      end
    end
  end
end