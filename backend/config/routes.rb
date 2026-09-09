Rails.application.routes.draw do
  devise_for :users, skip: :all

  namespace :api do
    namespace :v1 do
      post "auth/sign_in", to: "sessions#create"
      delete "auth/sign_out", to: "sessions#destroy"
      post "auth/sign_up", to: "registrations#create"

      get "users/me", to: "profiles#me"
      patch "users/me", to: "profiles#update"

      get "users/:id/posts", to: "profiles#posts"
      get "users/:id/activity", to: "profiles#activity"
      get "users/:id/calendar", to: "profiles#calendar"
      post "users/:id/connect", to: "profiles#connect"
      post "users/:id/block", to: "profiles#block"
      get "users/:id", to: "profiles#show"

      resources :posts, only: [:index, :create, :destroy] do
        member do
          post :like
          post :repost
          post :save
        end
      end
      get "posts/:post_id/comments", to: "posts#comments"
      post "posts/:post_id/comments", to: "posts#add_comment"

      get "peers", to: "peers#index"
      get "leaderboard", to: "leaderboard#index"

      get "search", to: "search#index"
      post "reports", to: "reports#create"

      get "chat", to: "chat#index"
      post "chat/messages", to: "chat#create_message"
      post "chat/direct", to: "chat#direct"

      resources :notifications, only: [:index, :create, :destroy] do
        collection do
          post :read_all
        end
        member do
          post :mark_read
        end
      end

      post "uploads", to: "uploads#create"
      post "ai_chat", to: "ai_chat#create"

      get "profiles/:username", to: "profiles#show_by_username"
      get "profiles/:username/posts", to: "profiles#posts_by_username"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end