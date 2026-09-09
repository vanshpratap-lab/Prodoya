class FixConnectionForeignKeys < ActiveRecord::Migration[8.1]
  def up
    old_fks = ActiveRecord::Base.connection.foreign_keys("connections")
    return if old_fks.all? { |fk| fk.to_table == "users" }

    create_table :connections_new, id: :integer do |t|
      t.references :requester, null: false, foreign_key: { to_table: :users }
      t.references :addressee, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end

    execute <<~SQL.squish
      INSERT INTO connections_new (id, requester_id, addressee_id, created_at, updated_at)
      SELECT id, requester_id, addressee_id, created_at, updated_at FROM connections
    SQL

    drop_table :connections
    rename_table :connections_new, :connections

    remove_foreign_key :connections, column: :requester_id
    remove_foreign_key :connections, column: :addressee_id
    add_foreign_key :connections, :users, column: :requester_id
    add_foreign_key :connections, :users, column: :addressee_id

    add_index :connections, :requester_id, if_not_exists: true
    add_index :connections, :addressee_id, if_not_exists: true
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end