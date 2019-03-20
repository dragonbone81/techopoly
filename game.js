const client = require("./db_connection");
const {board, chance, chest, colors} = require("./monopoly");
const ObjectId = require('mongodb').ObjectID;
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
                upgrades: 0,
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
                auction: false,
                auction_tile: 0,
                trades: [],
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
        try {
            socket.username = input.username;
            socket.join(`game_${input.game_id}`);


            let game = await (await client).findOne(
                {_id: new ObjectId(input.game_id)},
                {}
            );
            if (game.game_state === "INVITING_PLAYERS") {
                io.in(`game_${input.game_id}`).emit("game_info", game);
            } else {
                socket.emit("game_info", game);
            }
        } catch (e) {
        }
    });
    socket.on("move", async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {$set: {[`player_info.${input.player_index}.position`]: input.new_position}},
        );
        socket.to(`game_${input.game_id}`).emit("player_moved", {
            player: input.player_index,
            position: input.new_position
        });
    });
    socket.on("player_gives_up", async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.player_index}.state`]: "OUT",
                    [`player_info.${input.next_player}.state`]: "START_TURN",
                    [`board`]: input.new_board,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("player_gave_up", {
            player_index: input.player_index,
            next_player: input.next_player,
            new_board: input.new_board,
        });
    });
    socket.on("end_game", async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`game_state`]: "ENDED",
                }
            }
        );
        socket.to(`game_${input.game_id}`).emit("game_ended", {});
    });
    socket.on("move_player_animation", async (input) => {
        socket.to(`game_${input.game_id}`).emit("animated_players_moved", {
            animated_players_move: input.animated_players_move
        });
    });
    socket.on("buy_tile", async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`board.${input.tile_index}`]: input.tile_bought,
                    [`player_info.${input.player_index}.money`]: input.player_money,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("tile_bought", {
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
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.player_index}.money`]: input.player_money,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("player_money_updated", {
            player_index: input.player_index,
            player_money: input.player_money
        });
    });
    socket.on("start_game", async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`game_state`]: "STARTED",
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("game_started");
    });
    socket.on('end_turn', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.next_player}.state`]: "START_TURN",
                    [`player_info.${input.old_player}.state`]: "NOT_TURN"
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("turn_ended", {
            next_player: input.next_player,
            old_player: input.old_player,
        });
    });
    socket.on('sync_player_jail_state', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.player_index}.jail_state`]: input.jail_state,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("sync_player_jail_state_synced", {
            player_index: input.player_index,
            jail_state: input.jail_state,
        });
    });
    socket.on('update_player_jail_rolls', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.player_index}.jail_turns`]: input.jail_turns,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("update_player_jail_rolls_updated", {
            player_index: input.player_index,
            jail_turns: input.jail_turns,
        });
    });
    socket.on('pay_all_players', async (input) => {
        const original = await (await client).findOne(
            {_id: new ObjectId(input.game_id)},
        );
        const setObject = {};
        original.player_info.forEach((player, index) => {
            if (index === input.player_index) {
                setObject[`player_info.${index}.money`] = original.player_info[index].money - (input.amount * (original.player_info.length - 1));
            } else {
                setObject[`player_info.${index}.money`] = original.player_info[index].money + input.amount;
            }
        });
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: setObject,
            },
        );
        socket.to(`game_${input.game_id}`).emit("pay_all_players_payed", {
            player_index: input.player_index,
            amount: input.amount,
        });
    });
    socket.on('process_transaction', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.giving_player}.money`]: input.giving_player_money,
                    [`player_info.${input.giving_player}.pay_multiplier`]: 1,
                    [`player_info.${input.receiving_player}.money`]: input.receiving_player_money,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("transaction_processed", {
            giving_player: input.giving_player,
            giving_player_money: input.giving_player_money,
            receiving_player: input.receiving_player,
            receiving_player_money: input.receiving_player_money,
        });
    });
    socket.on('update_players_doubles', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.player_index}.doubles_rolled`]: input.doubles_rolled,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("players_doubles_updated", {
            player_index: input.player_index,
            doubles_rolled: input.doubles_rolled,
        });
    });
    socket.on('sync_player_state', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.player_index}.state`]: input.state,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("player_state_synced", {
            player_index: input.player_index,
            state: input.state,
        });
    });
    socket.on('update_dice_roll', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`player_info.${input.player_index}.dice`]: input.dice,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("dice_roll_updated", {
            player_index: input.player_index,
            dice: input.dice,
        });
    });
    socket.on('mortgage_property', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`board.${input.property_index}.mortgaged`]: input.mortgage_value,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("property_mortgaged", {
            property_index: input.property_index,
            mortgage_value: input.mortgage_value,
        });
    });
    socket.on('create_trade', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $push: {
                    [`trades`]: input.trade,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("trade_created", {
            trade: input.trade,
        });
    });
    socket.on('reject_trade', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`trades.${input.trade_index}.state`]: "REJECTED",
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("trade_rejected", {
            trade_index: input.trade_index,
        });
    });
    socket.on('cancel_trade', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`trades.${input.trade_index}.state`]: "CANCELED",
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("trade_canceled", {
            trade_index: input.trade_index,
        });
    });
    socket.on('accept_trade', async (input) => {
        const original = await (await client).findOne(
            {_id: new ObjectId(input.game_id)},
        );
        const mergeObj = {};
        mergeObj[`trades.${input.trade_index}.state`] = "ACCEPTED";
        mergeObj[`player_info.${input.trade.initiating_player}.money`] = original.player_info[input.trade.initiating_player].money - parseInt(input.trade.given_money) + parseInt(input.trade.taken_money);
        mergeObj[`player_info.${input.trade.trading_player}.money`] = original.player_info[input.trade.trading_player].money + parseInt(input.trade.given_money) - parseInt(input.trade.taken_money);
        input.trade.given_properties.forEach(propIndex => {
            mergeObj[`board.${propIndex}.player`] = input.trade.trading_player;
        });
        input.trade.taken_properties.forEach(propIndex => {
            mergeObj[`board.${propIndex}.player`] = input.trade.initiating_player;
        });
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: mergeObj,
            },
        );
        socket.to(`game_${input.game_id}`).emit("trade_accepted", {
            trade_index: input.trade_index,
        });
    });
    socket.on('tile_upgrade', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`board.${input.property_index}.upgrades`]: input.upgrades,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("tile_upgraded", {
            property_index: input.property_index,
            upgrades: input.upgrades,
        });
    });
    socket.on('add_log', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $push: {
                    [`logs`]: input.log,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("log_added", {
            log: input.log,
        });
    });
    socket.on('increase_chest_card', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`last_chest_card`]: input.last_chest_card,
                    [`player_info.${input.player_index}.pay_multiplier`]: input.pay_multiplier,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("chest_card_increased", {
            last_chest_card: input.last_chest_card,
            player_index: input.player_index,
            pay_multiplier: input.pay_multiplier,
        });
    });
    socket.on('initiate_auction', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`auction`]: true,
                    [`auction_tile`]: input.tile,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("auction_initiated", {
            tile: input.tile,
        });
    });
    socket.on('increase_chance_card', async (input) => {
        await (await client).updateOne(
            {_id: new ObjectId(input.game_id)},
            {
                $set: {
                    [`last_chance_card`]: input.last_chance_card,
                    [`player_info.${input.player_index}.pay_multiplier`]: input.pay_multiplier,
                }
            },
        );
        socket.to(`game_${input.game_id}`).emit("chance_card_increased", {
            last_chance_card: input.last_chance_card,
            player_index: input.player_index,
            pay_multiplier: input.pay_multiplier,
        });
    });

};
module.exports.game = game;