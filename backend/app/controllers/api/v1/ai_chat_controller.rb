require "net/http"
require "json"

module Api
  module V1
    class AiChatController < BaseController
      # Client sends { messages: [{ role, content }, ...] }; returns { reply }.
      # Uses the Anthropic API when ANTHROPIC_API_KEY is set (matching the original
      # Supabase edge function), with a system prompt scoped to engineering proof-of-work.
      def create
        messages = params[:messages].to_a
        return render_error(:bad_request, "No messages") if messages.empty?

        api_key = ENV["ANTHROPIC_API_KEY"]
        if api_key.blank?
          return render_error(
            :service_unavailable,
            "The AI assistant is not available yet. Set ANTHROPIC_API_KEY in the backend."
          )
        end

        body = {
          model: ENV.fetch("ANTHROPIC_MODEL", "claude-3-5-haiku-latest"),
          max_tokens: 1024,
          system: "You are the assistant for Prodoya, a proof-of-work community for engineering students. " \
                  "Answer concisely and helpfully about engineering topics, projects, careers, and study.",
          messages: messages.map { |m| { role: m["role"], content: m["content"] } },
        }

        response = Net::HTTP.post(
          URI("https://api.anthropic.com/v1/messages"),
          body.to_json,
          "Content-Type" => "application/json",
          "x-api-key" => api_key,
          "anthropic-version" => "2023-06-01"
        )

        parsed = JSON.parse(response.body)
        reply = parsed.dig("content", 0, "text")
        render json: { reply: reply }
      rescue JSON::ParserError, StandardError => e
        render_error(:bad_request, e.message)
      end
    end
  end
end