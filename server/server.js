const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log("Server Started!"));
const io = require('socket.io')(server);
const game = require("./game");
const client = require("./db_connection");
const {board, colors, chest, chance} = require("./monopoly");


app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
const shuffle = (input_array) => {
    const a = [...input_array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
app.get('/', async (req, res) => {
    res.json({asd: "asd"})
});
app.get('/search_for_games', async (req, res) => {
    const game_name = req.query.game_name;
    const games = await (await client).find(
        {"auth.game_name": game_name},
        {fields: {auth: 1, player_info: 1}}
    ).toArray();
    res.json({games});
});
app.post('/create_game', async (req, res) => {

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
            auth: {
                game_name: req.body.game_name,
                game_password: req.body.game_password,
            },
            player_info: [{
                username: req.body.username,
                password: req.body.password,
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
    console.log(game.ops[0]);
    res.json({success: true, game_id: game.ops[0]._id});
});

io.on('connection', (socket) => {
    game.game(socket, io);
});