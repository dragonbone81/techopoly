import {decorate, configure, observable, action, computed, runInAction} from 'mobx'
// import tiles from '../../../server/monopoly';
import io from 'socket.io-client';

configure({enforceActions: "observed"});
const turnState = [
    "NOT_TURN",
    "ROLLING",
    "ENDED_ROLL",
    "ACTIONS",
];

class Store {
    mainView = "properties";
    socket = io("http://localhost:3001/");
    players = [];
    username = "";
    player = 0;
    currentPlayer = 0;
    turnState = "NOT_TURN";
    dice = [0, 0];
    gameTilesID = [];
    gameTiles = [];
    mousedOverTile = null;
    buyProcessStarted = false;
    game_name = "";
    game = {};
    connectedFromNewPage = false;
    connectedFromNew = () => {
        this.connectedFromNewPage = true;
    };
    connectToGame = (game_name, username) => {
        this.socket.emit('join_game', {username: username, game_name: game_name});
        this.setUsername(username);
        localStorage.setItem("username", username);
    };

    startTurn = () => {
        this.rollDice();
        this.movePlayer();
        this.checkTile();
    };
    checkTile = () => {
        const tile = this.game.board[this.getPlayer.position];
        console.log(tile.type);
        if (tile.owned) {
            // this.payOwner();
            this.turnState = "END_OF_TURN";
        } else if (!tile.owned && tile.type === "property") {
            this.turnState = "BUY_TILE";
        }
        // console.log(tile);
    };
    movePlayer = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].position = this.circularAdd(this.game.player_info[playerIndex].position, this.diceSum, 39);
        this.socket.emit("move", {
            game_name: this.game.game_name,
            username: this.username,
            new_position: this.game.player_info[playerIndex].position,
            player_index: playerIndex,
        });
    };

    constructor() {
        this.socket.on("game_info", (data) => {
            console.log("game info", data);
            if (data) {
                this.setGameInfo(data);
            }

        });
        this.socket.on("player_moved", data => {
            this.setGameInfo(data);
        })
    }

    setUsername = (username) => {
        this.username = username;
    };
    newGame = async (game_name, username, password) => {
        this.socket.emit("create_game", {
            game_name,
            username,
            password,
        }, game => {
            this.setGameInfo(game);
            this.setUsername(username);
            localStorage.setItem("username", username);
        });
    };
    setGameInfo = (data) => {
        this.game = data
    };
    setMousedOverTile = (tile) => {
        this.mousedOverTile = tile;
        console.log(this.mousedOverTile)
    };
    clearMousedOverTile = () => {
        this.mousedOverTile = null;
        console.log(this.mousedOverTile)
    };
    rollDice = () => {
        this.dice[0] = Math.floor(Math.random() * Math.floor(6)) + 1;
        this.dice[1] = Math.floor(Math.random() * Math.floor(6)) + 1;
        console.log("dice rolled", this.diceSum);
    };
    buyProperty = () => {
        const tile = this.gameTilesID[this.thisPlayer.position];
        const gamesTiles = this.gameTiles[this.thisPlayer.position]
        if (!tile.owned && gamesTiles.cost) {
            tile.owned = true;
            tile.player = this.player;
            const player = this.thisPlayer;
            player.money -= gamesTiles.cost;
            this.players[this.currentPlayer] = player;
            this.gameTilesID[this.thisPlayer.position] = tile;
        }
    };
    endTurn = () => {
        this.turnState = "NOT_TURN";
        const newCurrentPlayer = this.circularAdd(this.currentPlayer, 1, this.players.length - 1);
        this.socket.emit('end_turn', {
            game_name: this.game_name,
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
    calcCostRent = () => {
        console.log("hey", this.playerGameTile)
        if (this.playerGameTile.type === "rr") {
            let numOwns = this.gameTilesID.filter(el => el.type === "rr" && el.player === this.playerTile.player).length;
            let rent = this.playerGameTile.base_rent * Math.pow(2, numOwns);
            console.log(rent);
            return rent;
        } else if (this.playerGameTile.type === "property") {
            console.log('here')
            let ownsAll = this.gameTilesID.filter(el => el.group === this.playerGameTile.group && el.player !== this.playerTile.player).length === 0;
            if (!ownsAll) {
                return this.playerGameTile.rent[0];
            } else {
                return this.playerGameTile.rent[0] * 2;
                // if()
            }
        }
    };
    moveHere = (where) => {
        this.turnState = "BUY";
        this.rollDice();
        this.players[this.currentPlayer].position = where;
        this.clearMousedOverTile();
        console.log(this.playerTile)
        if (!this.playerTile.owned && this.playerGameTile.cost) {
            this.buyProcessStarted = true;
        } else if (this.playerGameTile.type === "income-tax") {
            const player = this.thisPlayer;
            player.money -= player.money * .10;
            this.players[this.currentPlayer] = player;
            this.endTurn();
        } else if (this.playerTile.owned && this.playerGameTile.cost && this.playerTile.player !== this.username) {
            console.log("paying the other player")
            let cost = this.calcCostRent();
            this.players[this.playerTile.player].money += cost;
            this.players[this.currentPlayer].money -= cost;
            this.endTurn();
        } else {
            this.endTurn();
        }
    }
    rollAndMove = () => {
        this.turnState = "BUY";
        this.rollDice();
        this.players[this.currentPlayer].position = this.circularAdd(this.players[this.currentPlayer].position, this.diceSum, 39);
        this.clearMousedOverTile();
        console.log(this.playerTile)
        if (!this.playerTile.owned && this.playerGameTile.cost) {
            this.buyProcessStarted = true;
        } else if (this.playerGameTile.type === "income-tax") {
            const player = this.thisPlayer;
            player.money -= player.money * .10;
            this.players[this.currentPlayer] = player;
            this.endTurn();
        } else if (this.playerTile.owned && this.playerGameTile.cost && this.playerTile.player !== this.username) {
            console.log("paying the other player")
            let cost = this.calcCostRent();
            this.players[this.playerTile.player].money += cost;
            this.players[this.currentPlayer].money -= cost;
            this.endTurn();
        } else {
            this.endTurn();
        }
    };
    mortgageProp = (property) => {
        this.gameTilesID[property].mortaged = true;
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

    get mousedOverTileIDInfo() {
        return this.gameTilesID[this.mousedOverTile] || null;
    };

    get mousedOverTileInfo() {
        return this.gameTiles[this.mousedOverTile] || null;
    };

    get playersProperties() {
        return this.gameTilesID.filter((el, i) => {
            if (el.player === this.player) {
                return {...el, ...this.gameTiles[i]}
            }
        })
            .sort((a, b) => {
                return a.group === b.group ? a.cost < b.cost ? 1 : -1 : a.type === b.type ? a.group < b.group ? -1 : 1 : a.type < b.type ? -1 : 1
            })
    }

    get getPlayer() {
        return this.game.player_info[this.game.player_info.findIndex(el => el.username === this.username)];
    }

    get inGame() {
        if (!this.game.player_info) {
            return false;
        } else if (this.game.player_info.findIndex(el => el.username === this.username) === -1) {
            return false;
        } else {
            return true
        }
    }
}

decorate(Store, {
    players: observable,
    connectedFromNewPage: observable,
    game: observable,
    player: observable,
    currentPlayer: observable,
    username: observable,
    turn: observable,
    gameTiles: observable,
    gameTilesID: observable,
    game_name: observable,
    turnState: observable,
    mousedOverTile: observable,
    buyProcessStarted: observable,
    positions: computed,
    diceSum: computed,
    thisPlayersTurn: computed,
    thisPlayer: computed,
    inGame: computed,
    getPlayer: computed,
    mousedOverTileInfo: computed,
    mousedOverTileIDInfo: computed,
    playerTile: computed,
    rollDice: action,
    takeTurn: action,
    buyProperty: action,
    moveHere: action,
    clearMousedOverTile: action,
    setMousedOverTile: action,
    rollAndMove: action,
    setUsername: action,
    buyPrompt: action,
    mortgageProp: action,
    changeCurrentPlayer: action,
    setGameInfo: action,
    joinGame: action,
    setGameName: action,
    newGame: action,
    connectedFromNew: action,
    movePlayer: action,
});

export default new Store();