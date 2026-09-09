module Api
  module V1
    class UploadsController < BaseController
      # Accepts multipart "file" (or "image"). Returns a persistent URL.
      def create
        file = params[:file] || params[:image] || params[:avatar] || params[:cover]
        return render_error(:bad_request, "No file attached") if file.nil?

        blob = ActiveStorage::Blob.create_and_upload!(
          io: file,
          filename: file.original_filename,
          content_type: file.content_type
        )
        # Mirror the Supabase public bucket URL shape: /storage/v1/public/<bucket>/<path>
        host = request.base_url
        url = Rails.application.routes.url_helpers.rails_blob_url(blob, host: host, only_path: false)
        render json: { url: url }
      rescue StandardError => e
        render_error(:unprocessable_entity, e.message)
      end
    end
  end
end