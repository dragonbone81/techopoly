const client = require("./db_connection");
const {board, chance, chest, colors} = require("./monopoly");

const shuffle = (input_array) => {
    const a = [...input_array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};


const game = (socket, io) => {
    socket.on("create_game", async (input, respond) => {
        const newBoard = board.map(tile => {
            return {
                ...tile,
                owned: false,
                player: null,
                mortgaged: false,
            }
        });
        const game = await (await client).insertOne(
            {
                game_name: input.game_name,
                player_info: [{
                    username: input.username,
                    position: 0,
                    money: 1500,
                    id: 0,
                    state: "START_TURN",
                    jail_state: false,
                    jail_turns: 0,
                    doubles_rolled: 0,
                    dice: [0, 0],
                    pay_multiplier: 1,
                    color: colors[0],
                }],
                logs: [],
                board: newBoard,
                chance: shuffle(chance),
                chest: shuffle(chest),
                last_chance_card: -1,
                last_chest_card: -1,
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
                                color: colors[game.player_info.length],
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
        socket.to(`game_${input.game_name}`).emit("player_moved", {
            player: input.player_index,
            position: input.new_position
        });
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
        socket.to(`game_${input.game_name}`).emit("tile_bought", {
            tile: {
                tile_index: input.tile_index,
                tile: input.tile_bought
            },
            player: {
                player_index: input.player_index,
                player_money: input.player_money
            }
        });
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
        socket.to(`game_${input.game_name}`).emit("player_money_updated", {
            player_index: input.player_index,
            player_money: input.player_money
        });
    });
    socket.on('end_turn', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`player_info.${input.next_player}.state`]: "START_TURN",
                    [`player_info.${input.old_player}.state`]: "NOT_TURN"
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("turn_ended", {
            next_player: input.next_player,
            old_player: input.old_player,
        });
    });
    socket.on('sync_player_jail_state', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`player_info.${input.player_index}.jail_state`]: input.jail_state,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("sync_player_jail_state_synced", {
            player_index: input.player_index,
            jail_state: input.jail_state,
        });
    });
    socket.on('update_player_jail_rolls', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`player_info.${input.player_index}.jail_turns`]: input.jail_turns,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("update_player_jail_rolls_updated", {
            player_index: input.player_index,
            jail_turns: input.jail_turns,
        });
    });
    socket.on('pay_all_players', async (input) => {
        const original = await (await client).findOne(
            {game_name: input.game_name}
        );
        const setObject = {};
        original.player_info.forEach((player, index) => {
            if (index === input.player_index) {
                setObject[`player_info.${index}.money`] = original.player_info[index].money - (input.amount * (original.player_info.length - 1));
            } else {
                setObject[`player_info.${index}.money`] = original.player_info[index].money + input.amount;
            }
        });
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: setObject,
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("pay_all_players_payed", {
            player_index: input.player_index,
            amount: input.amount,
        });
    });
    socket.on('process_transaction', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`player_info.${input.giving_player}.money`]: input.giving_player_money,
                    [`player_info.${input.giving_player}.pay_multiplier`]: 1,
                    [`player_info.${input.receiving_player}.money`]: input.receiving_player_money,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("transaction_processed", {
            giving_player: input.giving_player,
            giving_player_money: input.giving_player_money,
            receiving_player: input.receiving_player,
            receiving_player_money: input.receiving_player_money,
        });
    });
    socket.on('update_players_doubles', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`player_info.${input.player_index}.doubles_rolled`]: input.doubles_rolled,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("players_doubles_updated", {
            player_index: input.player_index,
            doubles_rolled: input.doubles_rolled,
        });
    });
    socket.on('sync_player_state', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`player_info.${input.player_index}.state`]: input.state,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("player_state_synced", {
            player_index: input.player_index,
            state: input.state,
        });
    });
    socket.on('update_dice_roll', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`player_info.${input.player_index}.dice`]: input.dice,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("dice_roll_updated", {
            player_index: input.player_index,
            dice: input.dice,
        });
    });
    socket.on('mortgage_property', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`board.${input.property_index}.mortgaged`]: input.mortgage_value,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("property_mortgaged", {
            property_index: input.property_index,
            mortgage_value: input.mortgage_value,
        });
    });
    socket.on('add_log', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $push: {
                    [`logs`]: input.log,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("log_added", {
            log: input.log,
        });
    });
    socket.on('increase_chest_card', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`last_chest_card`]: input.last_chest_card,
                    [`player_info.${input.player_index}.pay_multiplier`]: input.pay_multiplier,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("chest_card_increased", {
            last_chest_card: input.last_chest_card,
            player_index: input.player_index,
            pay_multiplier: input.pay_multiplier,
        });
    });
    socket.on('increase_chance_card', async (input) => {
        const response = await (await client).findOneAndUpdate(
            {game_name: input.game_name},
            {
                $set: {
                    [`last_chance_card`]: input.last_chance_card,
                    [`player_info.${input.player_index}.pay_multiplier`]: input.pay_multiplier,
                }
            },
            {returnOriginal: false},
        );
        const game = response.value;
        socket.to(`game_${input.game_name}`).emit("chance_card_increased", {
            last_chance_card: input.last_chance_card,
            player_index: input.player_index,
            pay_multiplier: input.pay_multiplier,
        });
    });

};
module.exports.game = game;