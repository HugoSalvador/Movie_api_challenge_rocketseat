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



        let movies;

        if(tags) {
            const filterTags = tags.split(',').map(tag => tag.trim());
            

            movies = await knex('tags')
                .select([
                    "movies_notes.id",
                    "movies_notes.title",
                    "movies_notes.user_id"
                ])
                .where("movies_notes.user_id", user_id)
                .whereLike("movies_notes.title", `%${title}%`)
                .whereIn("tags.name", filterTags)
                .innerJoin("movies_notes", "movies_notes.id", "tags.movie_notes_id")
                .orderBy("movies_notes.title")

                
        } else {
            movies = await("movies_notes")
                .where({ user_id })
                .whereLike("title", `%${title}`)
                .orderBy("title")
        }

        const userTags = await knex("tags").where({ user_id });
        console.log(movies);
        const moviesWithTags = movies.map(movie => {

            const movieTags = userTags.filter(tag => tag.movie_notes_id === movie.id);

            return {
                ...movie,
                tags: movieTags
            }
        })

        return response.json(moviesWithTags);

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

