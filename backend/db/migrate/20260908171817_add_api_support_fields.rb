class AddApiSupportFields < ActiveRecord::Migration[8.1]
  def change
    change_table :users, bulk: true do |t|
      t.string :cover_url
      t.string :linkedin_url
      t.string :twitter_url
      t.json :tech_stack, default: []
      t.datetime :last_post_at
      t.string :jti
    end
    execute "UPDATE users SET jti = lower(hex(randomblob(16))) WHERE jti IS NULL OR jti = ''"
    add_index :users, :jti, unique: true

    change_table :posts, bulk: true do |t|
      t.json :tags, default: []
      t.json :image_urls, default: []
      t.string :video_url
    end

    change_table :channels, bulk: true do |t|
      t.string :emoji, default: "💬"
      t.integer :participant_1
      t.integer :participant_2
    end

    change_table :notifications, bulk: true do |t|
      t.string :icon, default: "🔔"
      t.string :category, default: "system"
      t.integer :actor_id
    end
  end
end