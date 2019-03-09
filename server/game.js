const client = require("./db_connection");
const {board, cards} = require("./monopoly");

const shuffle = (input_array) => {
    const a = [...input_array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return input_array;
    return a;
};


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
                player_info: [{
                    username: input.username,
                    position: 0,
                    money: 1500,
                    color: 'red',
                    id: 0,
                    state: "START_TURN",
                    jail_state: false,
                    jail_turns: 0,
                    doubles_rolled: 0,
                    dice: [0, 0],
                    pay_multiplier: 1,
                }],
                board: newBoard,
                chance: shuffle(cards),
                last_chance_card: -1,
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
                                state: "NOT_TURN",
                                jail_state: false,
                                jail_turns: 0,
                                doubles_rolled: 0,
                                dice: [0, 0],
                                pay_multiplier: 1,
                            }]
                        }
                    },
                    {returnOriginal: false},
                );
                game = game.value;
            }

            // console.log(game);
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
    socket.on("buy_tile", async (input) => {
        const response = await (await client).findOneAndUpdate(
            {
                game_name: input.game_name,
            },
            {
                $set: {
                    [`board.${input.tile_index}`]: input.tile_bought,
                    [`player_info.${input.player_index}.money`]: input.player_money,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("tile_bought", game);
    });
    socket.on("update_player_money", async (input) => {
        const response = await (await client).findOneAndUpdate(
            {
                game_name: input.game_name,
            },
            {
                $set: {
                    [`player_info.${input.player_index}.money`]: input.player_money,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });
    socket.on('end_turn', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`player_info.${input.next_player}.state`]: "START_TURN",
                    [`player_info.${input.old_player}.state`]: "NOT_TURN"
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("turn_ended", game);
    });
    socket.on('sync_player_jail_state', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`player_info.${input.player_index}.jail_state`]: input.jail_state,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });
    socket.on('update_player_jail_rolls', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`player_info.${input.player_index}.jail_turns`]: input.jail_turns,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });
    socket.on('process_transaction', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`player_info.${input.giving_player}.money`]: input.giving_player_money,
                    [`player_info.${input.pay_multiplier}.money`]: 1,
                    [`player_info.${input.receiving_player}.money`]: input.receiving_player_money,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });
    socket.on('update_players_doubles', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`player_info.${input.player_index}.doubles_rolled`]: input.doubles_rolled,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });
    socket.on('update_player_roll', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`player_info.${input.player_index}.previous_roll`]: input.previous_roll,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });
    socket.on('sync_player_state', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`player_info.${input.player_index}.state`]: input.state,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });
    socket.on('update_dice_roll', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`player_info.${input.player_index}.dice`]: input.dice,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });
    socket.on('increase_chance_card', async (input) => {
        console.log(input);
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            // {$set: {current_player: input.next_player}}
            {
                $set: {
                    [`last_chance_card`]: input.last_chance_card,
                    [`player_info.${input.pay_multiplier}.dice`]: input.pay_multiplier,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        console.log(response);
        socket.to(`game_${input.game_name}`).emit("game_info", game);
    });

};
module.exports.game = game;