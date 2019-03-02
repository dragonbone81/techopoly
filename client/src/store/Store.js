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
        {id: 2, position: 25, money: 1500, color: 'blue'},
    ];
    turn = 0;
    
    currentPlayer = 0;
    turnState = "START";
    dice = [0, 0];
    gameTiles = tiles;
    mousedOverTile = 0;
    buyProcessStarted = false;
    connectToGame = (game_id, username) => {
        console.log(game_id, username);
        this.socket.emit('game_join', {username, game_id});
    };

    constructor() {
        this.connectToGame(0, 'test');
    }

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
        const tile = this.gameTiles[this.thisPlayer.position];
        if (!tile.owned && tile.cost) {
            tile.owned = true;
            tile.player = this.currentPlayer;
            const player = this.thisPlayer;
            player.money -= tile.cost;
            this.players[this.currentPlayer] = player;
            this.gameTiles[this.thisPlayer.position] = tile;
        }
    };
    endTurn = () => {
        this.turnState = "NOT_TURN";
        this.currentPlayer = this.circularAdd(this.currentPlayer, 1, this.players.length - 1);
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
        if (!this.playerTile.owned && this.playerTile.cost) {
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
        return this.turn === this.currentPlayer;
    };

    get diceSum() {
        return this.dice[0] + this.dice[1];
    }

    get thisPlayer() {
        return this.players[this.currentPlayer];
    }

    get positions() {
        return this.players.map(el => el.position);
    };

    get playerTile() {
        return this.gameTiles[this.thisPlayer.position];
    }

    get mousedOverTileInfo() {
        return this.gameTiles[this.mousedOverTile];
    };
}

decorate(Store, {
    players: observable,
    player: observable,
    turn: observable,
    gameTiles: observable,
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
});

export default new Store();