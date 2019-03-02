const client = require("./db_connection");

const game = (socket, io) => {
    socket.on('game_join', async (input) => {
        console.log('join_request', input);
        try {
            // const response = checkJWT(input.token);
            socket.username = input.username;
            socket.join(`game_${input.game_id}`, () => {
                console.log(Object.keys(io.sockets.sockets));
            });
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('get_game_info', async (input) => {
        const game = await (await client).findOne(
            {game_id: input.game_id},
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
            {game_id: input.game_id},
            {$set: {current_player: input.next_player, game_info: input.game_info, player_info: input.player_info}}
        );
        const game = await (await client).findOne(
            {game_id: input.game_id},
            {}
        );
        console.log(game);
        io.in(`game_${input.game_id}`).emit("game_info", game);
    })
};
module.exports.game = game;