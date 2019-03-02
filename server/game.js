const game = (socket, io) => {
    socket.on('game_join', async (input) => {
        console.log('join_request', input);
        try {
            // const response = checkJWT(input.token);
            socket.username = input.username;
            socket.join(`chat_${input.game_id}`, () => {
                console.log(Object.keys(io.sockets.sockets));
            })
        } catch (err) {
            console.log(err);
        }
    });
};
module.exports.game = game;