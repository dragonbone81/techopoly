const client = require("./db_connection");
const board = require("./monopoly");

const game = (socket, io) => {
    socket.on("create_game", async (input, respond) => {
        const newBoard = board.map(tile => {
            return {
                ...tile,
                owned: false,
                player: null,
            }
        });
        const game = await (await client).insertOne(
            {
                game_name: input.game_name,
                player_info: [{username: input.username, position: 0, money: 1500, color: 'red', id: 0}],
                board: newBoard,
                current_player: 0,
            }
        );
        respond(game.ops[0]);
    });
    socket.on('join_game', async (input) => {
        console.log('join_request', input);
        try {
            socket.username = input.username;
            socket.join(`game_${input.game_name}`, () => {
                console.log(Object.keys(io.sockets.sockets));
            });


            let game = await (await client).findOne(
                {game_name: input.game_name},
                {}
            );

            //for dev stuff
            if (game.player_info.findIndex(el => el.username === input.username) === -1) {
                game = await (await client).findOneAndUpdate(
                    {game_name: input.game_name},
                    {
                        $set: {
                            player_info: [...game.player_info, {
                                username: input.username,
                                position: 0,
                                money: 1500,
                                color: 'red',
                                id: Math.max(...game.player_info.map(el => el.id)) + 1,
                            }]
                        }
                    },
                    {returnOriginal: false},
                );
                game = game.value;
            }

            console.log(game);
            io.in(`game_${input.game_name}`).emit("game_info", game);
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('get_game_info', async (input) => {
        const game = await (await client).findOne(
            {game_name: input.game_name},
            {}
        );
        console.log(game)
        socket.emit("game_info", game);
    });
    socket.on("move", async (input) => {
        const response = await (await client).findOneAndUpdate(
            {
                game_name: input.game_name,
            },
            {$set: {[`player_info.${input.player_index}.position`]: input.new_position}},
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("player_moved", game);
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