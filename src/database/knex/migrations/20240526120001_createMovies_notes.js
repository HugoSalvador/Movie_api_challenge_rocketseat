exports.up = knex => knex.schema.createTable("movies_notes", table => {
    table.increments('id');
    table.text('name');
    table.text('title');
    table.text('description');
    table.text('rating');

    table.integer('user_id').references('id').inTable("users");

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
    
});


exports.down = knex => knex.schema.dropTable("movies_notes");