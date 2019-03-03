const client = require("./db_connection");

const game = (socket, io) => {
    socket.on("create_game", async (input) => {
        const game = await (await client).insertOne(
            {
                game_name: input.game_name,
                player_info: input.player_info,
                game_info: input.game_info,
                password: input.password,
                current_player: 0,
            }
        );
    });
    socket.on('game_join', async (input) => {
        console.log('join_request', input);
        try {
            // const response = checkJWT(input.token);
            socket.username = input.username;
            socket.join(`game_${input.game_name}`, () => {
                console.log(Object.keys(io.sockets.sockets));
            });
            const game = await (await client).findOne(
                {game_name: input.game_name},
                {}
            );
            if (game.password !== input.password) {
                console.log('asd');
                return;
            }
            console.log(game)
            if (game.player_info.findIndex(el => el.username === input.username) === -1) {
                await (await client).updateOne(
                    {game_name: input.game_name},
                    {
                        $set: {
                            player_info: [...game.player_info, {
                                username: input.username,
                                position: 0,
                                money: 1500,
                                color: 'blue'
                            }]
                        }
                    }
                );
                let newGame = await (await client).findOne(
                    {game_name: input.game_name},
                    {}
                );
                io.in(`game_${input.game_name}`).emit("game_info", newGame);
            }
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('get_game_info', async (input) => {
        const game = await (await client).findOne(
            {game_name: input.game_name},
            {}
        );
        socket.emit("game_info", game);
    });
    socket.on('end_turn', async (input) => {
        // const game = await (await client).findOne(
        //     {game_id: input.game_id},
        //     {}
        // );
        console.log(input);
        await (await client).updateOne(
            {game_name: input.game_name},
            {$set: {current_player: input.next_player, game_info: input.game_info, player_info: input.player_info}}
        );
        const game = await (await client).findOne(
            {game_name: input.game_name},
            {}
        );
        console.log(game);
        io.in(`game_${input.game_name}`).emit("game_info", game);
    })
};
module.exports.game = game;