class CreateUserBlocks < ActiveRecord::Migration[8.1]
  def change
    create_table :user_blocks do |t|
      t.references :blocker, null: false, foreign_key: true
      t.references :blocked, null: false, foreign_key: true

      t.timestamps
    end
  end
end
