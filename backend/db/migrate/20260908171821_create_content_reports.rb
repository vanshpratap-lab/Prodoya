class CreateContentReports < ActiveRecord::Migration[8.1]
  def change
    create_table :content_reports do |t|
      t.integer :reporter_id, null: false
      t.integer :post_id
      t.integer :reported_user_id
      t.string :reason, null: false
      t.text :details
      t.timestamps
    end
    add_index :content_reports, :reporter_id
    add_index :content_reports, :post_id
    add_index :content_reports, :reported_user_id
    add_foreign_key :content_reports, :users, column: :reporter_id
    add_foreign_key :content_reports, :posts
    add_foreign_key :content_reports, :users, column: :reported_user_id
  end
end