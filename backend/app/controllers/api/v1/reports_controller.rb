module Api
  module V1
    class ReportsController < BaseController
      def create
        report = current_user.content_reports.new(
          post_id: params[:post_id],
          reported_user_id: params[:reported_user_id],
          reason: params.require(:reason),
          details: params[:details].to_s.strip.presence
        )
        if report.save
          head :no_content
        else
          render_error(:unprocessable_entity, report.errors.full_messages.first || "Could not submit report")
        end
      end
    end
  end
end