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
const ObjectId = require('mongodb').ObjectID;

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
    res.json({asd: "asd", db: "hi"});
});
app.get('/search_for_games', async (req, res) => {
    const game_name = req.query.game_name;
    const games = await (await client).find(
        {"auth.game_name": game_name},
        {fields: {auth: 1, player_info: 1, game_state: 1}}
    ).sort([['_id', -1]]).toArray();
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
            animated_players_move: {player: -1, moves: []},
            game_state: "INVITING_PLAYERS",
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
    res.json({success: true, game_id: game.ops[0]._id});
});
app.post('/join_game', async (req, res) => {
    const game = await (await client).findOne(
        {_id: new ObjectId(req.body.game_id)},
        {fields: {player_info: 1, auth: 1, game_state: 1}},
    );
    if (req.body.game_password !== game.auth.game_password) {
        res.json({error: "incorrect_game_pw"});
        return;
    }
    const playerIndex = game.player_info.findIndex(player => player.username === req.body.username);
    if (playerIndex === -1 && game.game_state !== "INVITING_PLAYERS") { // can't join anymore
        res.json({error: "player_not_in_game"});
        return;
    }
    if (playerIndex === -1 && game.game_state === "INVITING_PLAYERS") { // can still join
        await (await client).updateOne(
            {_id: new ObjectId(req.body.game_id)},
            {
                $push: {
                    [`player_info`]: {
                        username: req.body.username,
                        password: req.body.password,
                        position: 0,
                        money: 1500,
                        id: Math.max(...game.player_info.map(el => el.id)) + 1,
                        state: "NOT_TURN",
                        jail_state: false,
                        jail_turns: 0,
                        doubles_rolled: 0,
                        dice: [0, 0],
                        pay_multiplier: 1,
                        color: colors[Math.max(...game.player_info.map(el => el.id)) + 1],
                    },
                }
            },
        );
        res.json({success: true});
        return;
    }
    if (game.player_info[playerIndex].password !== req.body.password) {
        res.json({error: "incorrect_player_pw"});
        return;
    }

    res.json({success: true});
});

io.on('connection', (socket) => {
    game.game(socket, io);
});