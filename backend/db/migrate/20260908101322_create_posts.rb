class CreatePosts < ActiveRecord::Migration[8.1]
  def change
    create_table :posts do |t|
      t.references :user, null: false, foreign_key: true
      t.text :content
      t.string :difficulty
      t.integer :points
      t.text :code_snippet
      t.string :github_url

      t.timestamps
    end
  end
end
