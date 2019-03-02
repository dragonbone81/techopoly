import {decorate, configure, observable, action, computed, runInAction} from 'mobx'
import tiles from '../monopoly';

configure({enforceActions: "observed"});
const turnState = [
    "START",
    "BUY",
    "END",
    "NOT_TURN"
];

class Store {
    players = [
        {id: 1, position: 0, money: 1500, color: 'red'},
        {id: 2, position: 25, money: 1500, color: 'blue'},
    ];
    turn = 0;
    player = 0;
    turnState = "START";
    dice = [0, 0];
    gameTiles = tiles;
    mousedOverTile = 0;
    buyProcessStarted = false;
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
            tile.player = this.player;
            const player = this.thisPlayer;
            player.money -= tile.cost;
            this.players[this.player] = player;
            this.gameTiles[this.thisPlayer.position] = tile;
        }
    };
    endTurn = () => {
        this.turnState = "NOT_TURN";
        this.player = this.circularAdd(this.player, 1, this.players.length - 1);
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
        this.players[this.player].position = this.circularAdd(this.players[this.player].position, this.diceSum, 39);
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
        return this.turn === this.player;
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