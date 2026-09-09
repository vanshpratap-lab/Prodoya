# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_08_181800) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.integer "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.integer "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "channels", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "emoji", default: "💬"
    t.string "name"
    t.integer "participant_1"
    t.integer "participant_2"
    t.datetime "updated_at", null: false
  end

  create_table "connections", force: :cascade do |t|
    t.integer "addressee_id", null: false
    t.datetime "created_at", null: false
    t.integer "requester_id", null: false
    t.datetime "updated_at", null: false
    t.index ["addressee_id"], name: "index_connections_on_addressee_id"
    t.index ["requester_id"], name: "index_connections_on_requester_id"
  end

  create_table "content_reports", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "details"
    t.integer "post_id"
    t.string "reason", null: false
    t.integer "reported_user_id"
    t.integer "reporter_id", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_content_reports_on_post_id"
    t.index ["reported_user_id"], name: "index_content_reports_on_reported_user_id"
    t.index ["reporter_id"], name: "index_content_reports_on_reporter_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body"
    t.integer "channel_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["channel_id"], name: "index_messages_on_channel_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.integer "actor_id"
    t.text "body"
    t.string "category", default: "system"
    t.datetime "created_at", null: false
    t.string "icon", default: "🔔"
    t.datetime "read_at"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "post_comments", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id"], name: "index_post_comments_on_post_id"
    t.index ["user_id"], name: "index_post_comments_on_user_id"
  end

  create_table "post_likes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id"], name: "index_post_likes_on_post_id"
    t.index ["user_id"], name: "index_post_likes_on_user_id"
  end

  create_table "post_reposts", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id"], name: "index_post_reposts_on_post_id"
    t.index ["user_id"], name: "index_post_reposts_on_user_id"
  end

  create_table "post_saves", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id"], name: "index_post_saves_on_post_id"
    t.index ["user_id", "post_id"], name: "index_post_saves_on_user_id_and_post_id", unique: true
  end

  create_table "posts", force: :cascade do |t|
    t.text "code_snippet"
    t.text "content"
    t.datetime "created_at", null: false
    t.string "difficulty"
    t.string "github_url"
    t.json "image_urls", default: []
    t.integer "points"
    t.json "tags", default: []
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.string "video_url"
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "user_blocks", force: :cascade do |t|
    t.integer "blocked_id", null: false
    t.integer "blocker_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blocked_id"], name: "index_user_blocks_on_blocked_id"
    t.index ["blocker_id"], name: "index_user_blocks_on_blocker_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.text "bio"
    t.string "college"
    t.string "cover_url"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "full_name"
    t.string "github_url"
    t.string "jti"
    t.datetime "last_post_at"
    t.string "linkedin_url"
    t.integer "points", default: 0
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "role"
    t.json "tech_stack", default: []
    t.string "twitter_url"
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "connections", "users", column: "addressee_id"
  add_foreign_key "connections", "users", column: "requester_id"
  add_foreign_key "content_reports", "posts"
  add_foreign_key "content_reports", "users", column: "reported_user_id"
  add_foreign_key "content_reports", "users", column: "reporter_id"
  add_foreign_key "messages", "channels"
  add_foreign_key "messages", "users"
  add_foreign_key "notifications", "users"
  add_foreign_key "post_comments", "posts"
  add_foreign_key "post_comments", "users"
  add_foreign_key "post_likes", "posts"
  add_foreign_key "post_likes", "users"
  add_foreign_key "post_reposts", "posts"
  add_foreign_key "post_reposts", "users"
  add_foreign_key "post_saves", "posts"
  add_foreign_key "post_saves", "users"
  add_foreign_key "posts", "users"
  add_foreign_key "user_blocks", "blockeds"
  add_foreign_key "user_blocks", "blockers"
end
