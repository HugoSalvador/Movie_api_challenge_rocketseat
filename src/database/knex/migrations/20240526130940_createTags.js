exports.up = knex => knex.schema.createTable("tags", table => {
    table.increments('id');
    table.integer('movie_notes_id').references('id').inTable('movies_notes').onDelete('CASCADE');
    table.integer('user_id').references('id').inTable('users');
    table.text('name');
})

exports.down = knex => knex.schema.dropTable("tags");