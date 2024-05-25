const knex = require('../database/knex')
const AppError = require('../utils/AppError')
const { hash, compare } = require("bcryptjs")

class UsersController {
    async create(request, response) {
        const { name, email, password, avatar } = request.body;

        
        const checkUsersExists = await knex('users').select('email').where('email', email);
        
        
        if (checkUsersExists.length > 0) {
            throw new AppError("Este e-mail já esta em uso");
        } 

        const hashedPassword = await hash(password, 8);

        await knex("users").insert({
            name,
            email,
            password: hashedPassword,
            avatar: null
        });

        response.json(201);

    }

    async update(request, response) {
        const { name, email, password, old_password, avatar } = request.body;
        const { id } = request.params;

        const user = await knex('users').select('*').where('id', id).first();
        console.log(user);
        
        

        if(!user) {
            throw new AppError('Usuário não encontrado!');
        }

        const verifyExistsEmail = await knex('users').select('*').where('email', email).first();
        

        if(verifyExistsEmail && verifyExistsEmail.id !== user.id) {
            throw new AppError("Este e-mail já está em uso.")
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if(password && !old_password) {
            throw new AppError("Você precisa informar a senha antiga para definir a nova senha")
        }

        if(password && old_password) {
            const checkOldPassword = await compare(old_password, user.password)
            
            if(!checkOldPassword) {
                throw new AppError("A senha antiga não confere")
            }

            user.password = await hash(password, 8)
        }

        await knex('users').where('id', id).update({
            name: user.name,
            email: user.email,
            password: user.password,
            updated_at: knex.fn.now()
        })

        return response.json();
    }
}


module.exports = UsersController;