class CreateConnections < ActiveRecord::Migration[8.1]
  def change
    create_table :connections do |t|
      t.references :requester, null: false, foreign_key: true
      t.references :addressee, null: false, foreign_key: true

      t.timestamps
    end
  end
end
