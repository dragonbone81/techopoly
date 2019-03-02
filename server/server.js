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


app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
// app.use(game);
app.get('/', async (req, res) => {
    res.json({asd: "asd"})
});

io.on('connection', (socket) => {
    // console.log(io.sockets.sockets);
    game.game(socket, io);
});
client.then((client) => console.log(client));