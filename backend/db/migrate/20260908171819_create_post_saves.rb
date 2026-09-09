class CreatePostSaves < ActiveRecord::Migration[8.1]
  def change
    create_table :post_saves do |t|
      t.integer :user_id, null: false
      t.integer :post_id, null: false
      t.timestamps
    end
    add_index :post_saves, [:user_id, :post_id], unique: true
    add_index :post_saves, :post_id
    add_foreign_key :post_saves, :users
    add_foreign_key :post_saves, :posts
  end
end