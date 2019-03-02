import {decorate, configure, observable, action, computed, runInAction} from 'mobx'
import tiles from '../monopoly';
import io from 'socket.io-client';

configure({enforceActions: "observed"});
const turnState = [
    "START",
    "BUY",
    "END",
    "NOT_TURN"
];

class Store {
    socket = io("http://localhost:3001/");
    players = [
        {id: 1, position: 0, money: 1500, color: 'red'},
        {id: 2, position: 0, money: 1500, color: 'blue'},
    ];
    player = JSON.parse(localStorage.getItem("player")).id;
    currentPlayer = 0;
    turnState = "START";
    dice = [0, 0];
    gameTilesID = tiles.map((el) => {
        const simple = {name: el.name};
        if (el.cost) {
            simple.bought = false;
            simple.player = null;
        }
        return simple;
    });
    gameTiles = tiles;
    mousedOverTile = 0;
    buyProcessStarted = false;
    connectToGame = (game_id, username) => {
        console.log(game_id, username);
        this.socket.emit('game_join', {username, game_id});
        this.socket.emit('get_game_info', {game_id});
    };

    constructor() {
        this.socket.on("game_info", (data) => {
            this.setGameInfo(data.game_info, data.player_info);
            this.changeCurrentPlayer(data.current_player);
        });
        this.connectToGame(1, 'test');
    }

    setGameInfo = (gameInfo, playerInfo) => {
        this.gameTilesID = gameInfo;
        this.players = playerInfo;
    }
    changeCurrentPlayer = (player) => {
        this.currentPlayer = player;
    };
    setMousedOverTile = (tile) => {
        this.mousedOverTile = tile;
        console.log(this.mousedOverTile)
    };
    clearMousedOverTile = () => {
        this.mousedOverTile = this.thisPlayer.position;
        console.log(this.mousedOverTile)
    };
    rollDice = () => {
        this.dice[0] = Math.floor(Math.random() * Math.floor(6)) + 1;
        this.dice[1] = Math.floor(Math.random() * Math.floor(6)) + 1;
        console.log(this.diceSum)
    };
    buyProperty = () => {
        const tile = this.gameTilesID[this.thisPlayer.position];
        if (!tile.owned && this.gameTiles[this.thisPlayer.position].cost) {
            tile.owned = true;
            tile.player = this.player;
            const player = this.thisPlayer;
            player.money -= tile.cost;
            this.players[this.currentPlayer] = player;
            this.gameTilesID[this.thisPlayer.position] = tile;
        }
    };
    endTurn = () => {
        this.turnState = "NOT_TURN";
        const newCurrentPlayer = this.circularAdd(this.currentPlayer, 1, this.players.length - 1);
        this.socket.emit('end_turn', {
            game_id: 1,
            id: this.player,
            next_player: newCurrentPlayer,
            game_info: this.gameTilesID,
            player_info: this.players,
        });
    };
    buyPrompt = (playerBuys) => {
        if (playerBuys) {
            this.buyProperty();
        }
        this.buyProcessStarted = false;
        this.endTurn();
    };
    rollAndMove = () => {
        this.turnState = "BUY";
        this.rollDice();
        this.players[this.currentPlayer].position = this.circularAdd(this.players[this.currentPlayer].position, this.diceSum, 39);
        this.clearMousedOverTile();
        console.log(this.playerTile)
        if (!this.playerTile.owned && this.playerGameTile.cost) {
            this.buyProcessStarted = true;
        } else {
            this.endTurn();
        }
    };

    circularAdd = (val, num, max) => {
        if (val + num > max) {
            num = num - (max - val);
            return num - 1;
        } else {
            return val + num;
        }
    };

    get thisPlayersTurn() {
        return this.player === this.currentPlayer;
    };

    get diceSum() {
        return this.dice[0] + this.dice[1];
    }

    get thisPlayer() {
        return this.players[this.player];
    }

    get positions() {
        return this.players.map(el => el.position);
    };

    get playerTile() {
        return this.gameTilesID[this.thisPlayer.position];
    }

    get playerGameTile() {
        return this.gameTiles[this.thisPlayer.position];
    }

    get mousedOverTileInfo() {
        return this.gameTilesID[this.mousedOverTile];
    };
}

decorate(Store, {
    players: observable,
    player: observable,
    currentPlayer: observable,
    turn: observable,
    gameTiles: observable,
    gameTilesID: observable,
    turnState: observable,
    mousedOverTile: observable,
    buyProcessStarted: observable,
    positions: computed,
    diceSum: computed,
    thisPlayersTurn: computed,
    thisPlayer: computed,
    mousedOverTileInfo: computed,
    playerTile: computed,
    rollDice: action,
    takeTurn: action,
    buyProperty: action,
    clearMousedOverTile: action,
    setMousedOverTile: action,
    rollAndMove: action,
    buyPrompt: action,
    changeCurrentPlayer: action,
    setGameInfo: action,
});

export default new Store();