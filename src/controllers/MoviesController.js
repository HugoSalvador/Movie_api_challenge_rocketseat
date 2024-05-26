const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class MoviesController {
    async create(request, response) {
        const { name, title, description, rating, tags } = request.body;
        const { user_id } = request.params;


        if (!name) {
            throw new AppError("O campo nome é obrigatório.");
        }

        if (!title) {
            throw new AppError("O campo título é obrigatório.");
        }

        if (!description) {
            throw new AppError("O campo descrição é obrigatório.");
        }


        if (!rating) {
            throw new AppError("O campo de nota é obrigatório, a nota deve ser de 1 a 5.");
        }    

        const [movie_notes_id] = await knex("movies_notes").insert({
            name,
            title,
            description,
            rating,
            user_id    
        });

        const tagsInsert = tags.map(name => {
            return {
                user_id,
                movie_notes_id,
                name
            }
        })

        await knex('tags').insert(tagsInsert);
    
        response.json(201);        
    }

    async index(request, response) {
        const { title, user_id, tags} = request.query;

        if(!title && !user_id && !tags) {
            
            const allMoviesNotes = await knex('movies_notes').select('*');
            
            return response.json(allMoviesNotes);
        }


        if(tags) {
            const filterTags = tags.split(',').map(tag => tag.trim());
            console.log(filterTags);
            const movies = await knex('tags')
                .select([
                    "movies_notes.id",
                    "movies_notes.title",
                    "movies_notes.user_id"
                ])
                .where("movies_notes.user_id", user_id)
                .whereLike("movies_notes.title", `&${title}&`)
                .whereIn("tags.name", filterTags)
                .innerJoin("movies_notes", "movies_notes.id", "tags.movie_notes_id")
                .orderBy("movies_notes.title")

                console.log(movies);

                return response.json(movies)
        }

    }
    

    async show(request, response) {
        const { id } = request.params;

        const movie = await knex('movies_notes').where({ id }).first();

        return response.json({
            movie 
        })
    }


    async delete(request, response) {
        const { id } = request.params;

        await knex('movies_notes').where({ id }).delete();

        return response.json(204);
    }

}

module.exports = MoviesController;

