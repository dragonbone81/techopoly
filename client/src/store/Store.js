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
const JAIL_POSITION = -10;

class Store {
    mainView = "properties";
    socket = io("http://localhost:3001/");
    players = [];
    username = "";
    player = 0;
    currentPlayer = 0;
    gameState = "NOT_STARTED";
    // dice = [0, 0];
    gameTilesID = [];
    gameTiles = [];
    mousedOverTile = null;
    buyProcessStarted = false;
    game_name = "";
    game = {};
    JAIL_POSITION = -10;
    chosenCard = null;
    connectedFromNewPage = false;
    connectedFromNew = () => {
        this.connectedFromNewPage = true;
    };
    connectToGame = (game_name, username) => {
        this.socket.emit('join_game', {username: username, game_name: game_name});
        this.setUsername(username);
        this.gameState = "STARTED";
        localStorage.setItem("username", username);
    };
    updatePlayerJailRolls = (playerIndex) => {
        this.socket.emit("update_player_jail_rolls", {
            game_name: this.game.game_name,
            username: this.username,
            jail_turns: this.game.player_info[playerIndex].jail_turns,
            player_index: playerIndex,
        });
    };
    startTurn = () => {
        if (!this.playerJailState) {
            this.setPlayerState("ROLLING");
            this.rollDice();
            this.movePlayer();
            this.checkIfPlayerPassedGo();
            this.checkTile();
        } else {
            const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
            this.setPlayerState("ROLLING");
            this.rollDice();
            if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
                this.setJailState(false);
                this.syncPlayerJailState();
                this.game.player_info[playerIndex].jail_turns = 0;
            } else {
                this.game.player_info[playerIndex].jail_turns += 1;
            }
            console.log(this.getPlayer.jail_turns, "jail turns");
            this.updatePlayerJailRolls(playerIndex);
            this.setPlayerState("END_OF_TURN");
            this.syncPlayerState();
        }
    };
    updatePlayerMoney = (playerIndex) => {
        this.socket.emit("update_player_money", {
            game_name: this.game.game_name,
            username: this.username,
            player_money: this.game.player_info[playerIndex].money,
            player_index: playerIndex,
        });
    };
    payOutOfJail = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money -= 50;
        this.updatePlayerMoney(playerIndex);
        this.setJailState(false);
        this.syncPlayerJailState();
        this.game.player_info[playerIndex].jail_turns = 0;
        this.updatePlayerJailRolls(playerIndex);
        if (this.getPlayer.jail_turns === 3) {
            this.setPlayerState("START_TURN");
        } else {
            this.setPlayerState("END_OF_TURN");
        }
        this.syncPlayerState();
    };
    movePlayerDev = (position) => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].position = position;
        this.socket.emit("move", {
            game_name: this.game.game_name,
            username: this.username,
            new_position: this.game.player_info[playerIndex].position,
            player_index: playerIndex,
        });
    };
    movePlayerToTile = (position) => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].position = position;
        this.socket.emit("move", {
            game_name: this.game.game_name,
            username: this.username,
            new_position: position,
            player_index: playerIndex,
        });
    };
    devMoveHere = (tile_position) => {
        this.setPlayerState("ROLLING");
        this.rollDice();
        this.movePlayerDev(tile_position);
        this.checkTile();
    };
    payPlayer = () => {
        const rent = this.calcRentCost();
        const receivingPlayer = this.playerTile.player;
        const givingPlayer = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[receivingPlayer].money += rent * this.getPlayer.pay_multiplier;
        this.game.player_info[givingPlayer].money -= rent * this.getPlayer.pay_multiplier;
        this.game.player_info[givingPlayer].pay_multiplier = 1;
        this.socket.emit("process_transaction", {
            game_name: this.game.game_name,
            username: this.username,
            giving_player: givingPlayer,
            receiving_player: receivingPlayer,
            giving_player_money: this.game.player_info[givingPlayer].money,
            receiving_player_money: this.game.player_info[receivingPlayer].money,
        });
    };
    checkTile = () => {
        const tile = this.game.board[this.getPlayer.position];
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        console.log(tile.type);
        if (this.getPlayer.dice[0] !== this.getPlayer.dice[1]) {
            this.game.player_info[playerIndex].doubles_rolled = 0;
            this.updatePlayerDoublesRolled(playerIndex);
        }
        if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
            this.checkAndUpdateDoublesRolled(playerIndex);
        }
        if (this.getPlayer.jail_state) {
            return;
        }
        if (tile.owned && tile.player !== playerIndex) {
            this.payPlayer();
            if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
                this.setPlayerState("START_TURN");
            } else {
                this.setPlayerState("END_OF_TURN");
            }
        } else if (!tile.owned && (tile.type === "property" || tile.type === "rr" || tile.type === "utility")) {
            if (this.getPlayer.money < this.game.board[this.getPlayer.position].cost) {
                this.setPlayerState("BUY_TILE_NO_MONEY");
            } else {
                this.setPlayerState("BUY_TILE");
            }
        } else if (tile.type === "lux-tax") {
            this.payLuxuryTax();
        } else if (tile.type === "chance" || tile.type === "chest") {
            this.handleModifierCard(tile.type);
        } else if (tile.type === "income-tax") {
            this.setPlayerState("INCOME_TAX");
        } else if (tile.type === "go-to-jail") {
            this.game.player_info[playerIndex].doubles_rolled = 0;
            this.updatePlayerDoublesRolled(playerIndex);
            this.goToJail(playerIndex);
        } else {
            if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
                this.setPlayerState("START_TURN");
            } else {
                this.setPlayerState("END_OF_TURN");
            }
        }
        this.syncPlayerState();
    };
    utilityChanceCardPayment = () => {
        const roll = [
            Math.floor(Math.random() * Math.floor(6)) + 1,
            Math.floor(Math.random() * Math.floor(6)) + 1
        ];
        const rent = (roll[0] + roll[1]) * 10;
        console.log("You Rolled", roll);
        const receivingPlayer = this.playerTile.player;
        const givingPlayer = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[receivingPlayer].money += rent;
        this.game.player_info[givingPlayer].money -= rent;
        this.socket.emit("process_transaction", {
            game_name: this.game.game_name,
            username: this.username,
            giving_player: givingPlayer,
            receiving_player: receivingPlayer,
            giving_player_money: this.game.player_info[givingPlayer].money,
            receiving_player_money: this.game.player_info[receivingPlayer].money,
        });
        if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
            this.setPlayerState("START_TURN");
        } else {
            this.setPlayerState("END_OF_TURN");
        }
        this.syncPlayerState();
    };
    handleModifierCard = (type) => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        let newCardIndex = 0;
        let newCard = {};
        if (type === "chance") {
            newCardIndex = this.game.last_chance_card + 1 === this.game.chance.length ? 0 : this.game.last_chance_card + 1;
            this.game.last_chance_card = newCardIndex;
            newCard = this.game.chance[newCardIndex];
            console.log("CHANCE CARD", this.game.chance[newCardIndex].name);
        } else {
            newCardIndex = this.game.last_chest_card + 1 === this.game.chest.length ? 0 : this.game.last_chest_card + 1;
            this.game.last_chest_card = newCardIndex;
            newCard = this.game.chest[newCardIndex];
            console.log("CHANCE CARD", this.game.chest[newCardIndex].name);
        }


        if (newCard.type === "simple_move") {
            if (newCard.position === 0) {
                this.playerPassedGoMoneyIncrease();
            } else if (this.getPlayer.position > newCard.position) {
                this.playerPassedGoMoneyIncrease();
            }
            this.movePlayerToTile(newCard.position);
            this.checkTile();
        } else if (newCard.type === "nearest_utility") {
            const utility = this.findNearestType("utility");
            if (this.getPlayer.position > utility) {
                this.playerPassedGoMoneyIncrease();
            }
            this.movePlayerToTile(utility);

            if (this.game.board[utility].owned && this.game.board[utility].player !== playerIndex) {
                this.setPlayerState("UTILITY_CHANCE_CARD");
                this.syncPlayerState();
            } else {
                this.checkTile();
            }
        } else if (newCard.type === "nearest_rr") {
            this.game.player_info[playerIndex].pay_multiplier = 2;
            const rail_road = this.findNearestType("rr");
            if (this.getPlayer.position > rail_road) {
                this.playerPassedGoMoneyIncrease();
            }
            this.movePlayerToTile(rail_road);
            this.checkTile();
        } else if (newCard.type === "simple_bank_pay") {
            this.game.player_info[playerIndex].money += newCard.amount;
            this.updatePlayerMoney(playerIndex);
            if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
                this.setPlayerState("START_TURN");
            } else {
                this.setPlayerState("END_OF_TURN");
            }
            this.syncPlayerState();
        } else if (newCard.type === "move_amount") {
            this.movePlayerToTile(this.getPlayer.position + newCard.amount);
            this.checkTile();
        } else if (newCard.type === "go_to_jail") {
            this.goToJail(playerIndex);
        } else if (newCard.type === "pay_all_players") {
            console.log("payingall");
            this.payAllPlayers(newCard.amount);
            if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
                this.setPlayerState("START_TURN");
            } else {
                this.setPlayerState("END_OF_TURN");
            }
            this.syncPlayerState();
        }

        if (type === "chance") {
            this.socket.emit("increase_chance_card", {
                game_name: this.game.game_name,
                username: this.username,
                last_chance_card: newCardIndex,
                player_index: playerIndex,
                pay_multiplier: this.game.player_info[playerIndex].pay_multiplier,
            });
        } else {
            this.socket.emit("increase_chest_card", {
                game_name: this.game.game_name,
                username: this.username,
                last_chest_card: newCardIndex,
                player_index: playerIndex,
                pay_multiplier: this.game.player_info[playerIndex].pay_multiplier,
            });
        }


    };
    payAllPlayers = (amount) => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money = this.game.player_info[playerIndex].money - (amount * (this.game.player_info.length - 1));
        this.game.player_info.forEach((player, index) => {
            if (index !== playerIndex) {
                player.money += amount;
            }
        });
        this.socket.emit("pay_all_players", {
            game_name: this.game.game_name,
            username: this.username,
            player_index: playerIndex,
            amount: amount,
        });
    };
    findNearestType = (type) => {
        let nearest = this.game.board.findIndex((tile, index) => {
            if (index < this.getPlayer.position) {
                return false;
            }
            return tile.type === type;
        });
        if (nearest === -1) { // no utilities in front
            nearest = this.game.board.findIndex((tile) => {
                return tile.type === type;
            });
        }
        return nearest;
    };
    payLuxuryTax = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money -= 75;
        this.updatePlayerMoney(playerIndex);
        if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
            this.setPlayerState("START_TURN");
        } else {
            this.setPlayerState("END_OF_TURN");
        }
        this.syncPlayerState();
    };
    payPercentTax = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money -= this.game.player_info[playerIndex].money * 0.10;
        this.updatePlayerMoney(playerIndex);
        if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
            this.setPlayerState("START_TURN");
        } else {
            this.setPlayerState("END_OF_TURN");
        }
        this.syncPlayerState();
    };
    payFlatTax = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money -= 200;
        this.updatePlayerMoney(playerIndex);
        if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
            this.setPlayerState("START_TURN");
        } else {
            this.setPlayerState("END_OF_TURN");
        }
        this.syncPlayerState();
    };
    goToJail = (playerIndex) => {
        this.game.player_info[playerIndex].position = 10;
        this.socket.emit("move", {
            game_name: this.game.game_name,
            username: this.username,
            new_position: 10,
            player_index: playerIndex,
        });
        this.setJailState(true);
        this.syncPlayerJailState();
        this.setPlayerState("END_OF_TURN");
    };
    checkIfTooManyDoubles = (playerIndex) => {
        if (this.game.player_info[playerIndex].doubles_rolled === 3) {
            this.game.player_info[playerIndex].doubles_rolled = 0;
            this.goToJail(playerIndex);
        }
        this.updatePlayerDoublesRolled(playerIndex);
    }
    checkAndUpdateDoublesRolled = (playerIndex) => {
        this.game.player_info[playerIndex].doubles_rolled += 1;
        if (this.game.player_info[playerIndex].doubles_rolled === 3) {
            this.game.player_info[playerIndex].doubles_rolled = 0;
            this.goToJail(playerIndex);
        } else {
            // this.setPlayerState("START_TURN");
        }
        this.updatePlayerDoublesRolled(playerIndex);
    };
    updatePlayerDoublesRolled = (playerIndex) => {
        this.socket.emit("update_players_doubles", {
            game_name: this.game.game_name,
            username: this.username,
            player_index: playerIndex,
            doubles_rolled: this.getPlayer.doubles_rolled,
        });
    };

    playerPassedGoMoneyIncrease = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money += 200;
        console.log("passed go", this.game.player_info[playerIndex].money);
        this.socket.emit("update_player_money", {
            game_name: this.game.game_name,
            username: this.username,
            player_money: this.game.player_info[playerIndex].money,
            player_index: playerIndex,
        });
    };
    checkIfPlayerPassedGo = () => {
        if (this.getPlayer.position - this.diceSum < 0) { //passed or on go
            this.playerPassedGoMoneyIncrease();
        }
    };
    syncPlayerJailState = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.socket.emit("sync_player_jail_state", {
            game_name: this.game.game_name,
            username: this.username,
            player_index: playerIndex,
            jail_state: this.playerJailState,
        });
    };
    syncPlayerState = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.socket.emit("sync_player_state", {
            game_name: this.game.game_name,
            username: this.username,
            player_index: playerIndex,
            state: this.playerState,
        });
    };
    buyTile = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money -= this.game.board[this.getPlayer.position].cost;
        this.game.board[this.getPlayer.position].owned = true;
        this.game.board[this.getPlayer.position].player = playerIndex;
        this.socket.emit("buy_tile", {
            game_name: this.game.game_name,
            username: this.username,
            tile_index: this.getPlayer.position,
            tile_bought: this.game.board[this.getPlayer.position],
            player_money: this.game.player_info[playerIndex].money,
            player_index: playerIndex,
        });
        if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
            this.setPlayerState("START_TURN");
        } else {
            this.setPlayerState("END_OF_TURN");
        }
        this.syncPlayerState();
    };
    rejectBuyTile = () => {
        if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
            this.setPlayerState("START_TURN");
        } else {
            this.setPlayerState("END_OF_TURN");
        }
        this.syncPlayerState();
    };
    endTurn = () => {
        this.setPlayerState("NOT_TURN");
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        const newCurrentPlayer = this.circularAdd(playerIndex, 1, this.game.player_info.length - 1);
        console.log("newplayer", newCurrentPlayer);
        // this.game.current_player = newCurrentPlayer;
        this.socket.emit('end_turn', {
            game_name: this.game.game_name,
            username: this.username,
            next_player: newCurrentPlayer,
            old_player: playerIndex,
        });
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
        this.socketActions();

    }

    socketActions = () => {
        this.socket.on("player_moved", data => {
            console.log("player_moved", data);
            runInAction(() => {
                this.game.player_info[data.player].position = data.position;
            });
        });
        this.socket.on("tile_bought", data => {
            console.log("tile_bought", data);
            runInAction(() => {
                this.game.player_info[data.player.player_index].money = data.player.player_money;
                this.game.board[data.tile.tile_index] = data.tile.tile;
            });
        });
        this.socket.on("player_money_updated", data => {
            console.log("player_money_updated", data);
            runInAction(() => {
                this.game.player_info[data.player_index].money = data.player_money;
            });
        });
        this.socket.on("turn_ended", data => {
            console.log("turn_ended", data);
            runInAction(() => {
                this.game.player_info[data.next_player].state = "START_TURN";
                this.game.player_info[data.old_player].state = "NOT_TURN";
            });
        });
        this.socket.on("sync_player_jail_state_synced", data => {
            console.log("sync_player_jail_state_synced", data);
            runInAction(() => {
                this.game.player_info[data.player_index].jail_state = data.jail_state;
            });
        });
        this.socket.on("update_player_jail_rolls_updated", data => {
            console.log("update_player_jail_rolls_updated", data);
            runInAction(() => {
                this.game.player_info[data.player_index].jail_turns = data.jail_turns;
            });
        });
        this.socket.on("transaction_processed", data => {
            console.log("transaction_processed", data);
            runInAction(() => {
                this.game.player_info[data.giving_player].money = data.giving_player_money;
                this.game.player_info[data.giving_player].pay_multiplier = 1;
                this.game.player_info[data.receiving_player].money = data.receiving_player_money;
            });
        });
        this.socket.on("players_doubles_updated", data => {
            console.log("players_doubles_updated", data);
            runInAction(() => {
                this.game.player_info[data.player_index].doubles_rolled = data.doubles_rolled;
            });
        });
        this.socket.on("dice_roll_updated", data => {
            console.log("dice_roll_updated", data);
            runInAction(() => {
                this.game.player_info[data.player_index].dice = data.dice;
            });
        });
        this.socket.on("player_state_synced", data => {
            console.log("player_state_synced", data);
            runInAction(() => {
                this.game.player_info[data.player_index].state = data.state;
            });
        });
        this.socket.on("chest_card_increased", data => {
            console.log("chest_card_increased", data);
            runInAction(() => {
                this.game.player_info[data.player_index].pay_multiplier = data.pay_multiplier;
                this.game.last_chest_card = data.last_chest_card;
            });
        });
        this.socket.on("chance_card_increased", data => {
            console.log("chance_card_increased", data);
            runInAction(() => {
                this.game.player_info[data.player_index].pay_multiplier = data.pay_multiplier;
                this.game.last_chance_card = data.last_chance_card;
            });
        });
        this.socket.on("pay_all_players_payed", data => {
            console.log("pay_all_players_payed", data);
            runInAction(() => {
                this.game.player_info[data.player_index].money = this.game.player_info[data.player_index].money - (data.amount * (this.game.player_info.length - 1));
                this.game.player_info.forEach((player, index) => {
                    if (index !== data.player_index) {
                        player.money += data.amount;
                    }
                });
            });
        });
    };

    checkAndSetCurrentPlayer = () => {
        console.log("here", this.game.current_player);
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        if (this.game.current_player === playerIndex) {
            this.setPlayerState("START_TURN");
        }
    };
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
            runInAction(() => {
                this.gameState = "STARTED";
            });
            localStorage.setItem("username", username);
        });
    };
    setGameInfo = (data) => {
        this.game = data
    };
    setMousedOverTile = (tile) => {
        this.mousedOverTile = tile;
    };
    clearMousedOverTile = () => {
        this.mousedOverTile = null;
    };

    get chosenTile() {
        if (this.mousedOverTile === null) {
            return this.game.board[this.getPlayer.position];
        } else {
            return this.game.board[this.mousedOverTile];
        }
    }

    rollDice = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].dice = [
            Math.floor(Math.random() * Math.floor(6)) + 1,
            Math.floor(Math.random() * Math.floor(6)) + 1,
            // 2,
            // 2,
        ];
        this.socket.emit("update_dice_roll", {
            game_name: this.game.game_name,
            username: this.username,
            dice: this.game.player_info[playerIndex].dice,
            player_index: playerIndex,
        });

        // this.dice[0] = 2;
        // this.dice[1] = 2;
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
    buyPrompt = (playerBuys) => {
        if (playerBuys) {
            this.buyProperty();
        }
        this.buyProcessStarted = false;
        this.endTurn();
    };
    calcRentCost = () => {
        console.log("hey", this.playerTile)
        if (this.playerTile.type === "rr") {
            let numOwns = this.game.board.filter(el => el.type === "rr" && el.player === this.playerTile.player).length;
            let rent = this.playerTile.base_rent * Math.pow(2, numOwns - 1);
            console.log(rent);
            return rent;
        } else if (this.playerTile.type === "property") {
            console.log('here')
            let ownsAll = this.game.board.filter(el => el.group === this.playerTile.group && el.player !== this.playerTile.player).length === 0;
            if (!ownsAll) {
                return this.playerTile.rent[0];
            } else {
                return this.playerTile.rent[0] * 2;
                // if()
            }
        } else if (this.playerTile.type === "utility") {
            let ownsAll = this.game.board.filter(el => el.group === this.playerTile.group && el.player !== this.playerTile.player).length === 0;
            if (!ownsAll) {
                return this.diceSum * 4;
            } else {
                return this.diceSum * 10;
            }
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
        return this.getPlayer.dice[0] + this.getPlayer.dice[1];
    }

    get thisPlayer() {
        return this.players[this.player];
    }

    get positions() {
        return this.players.map(el => el.position);
    };

    get playerTile() {
        return this.game.board[this.getPlayer.position];
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

    setPlayerState = (state) => {
        this.game.player_info[this.game.player_info.findIndex(el => el.username === this.username)].state = state;
    };
    setJailState = (state) => {
        this.game.player_info[this.game.player_info.findIndex(el => el.username === this.username)].jail_state = state;
    };

    get playerState() {
        if (this.gameState === "NOT_STARTED") {
            return "NOT_TURN";
        } else {
            return this.getPlayer.state;
        }
    }

    get playerJailState() {
        if (this.gameState === "NOT_STARTED") {
            return false;
        } else {
            return this.getPlayer.jail_state;
        }
    }
}

decorate(Store, {
    players: observable,
    // dice: observable,
    connectedFromNewPage: observable,
    game: observable,
    player: observable,
    currentPlayer: observable,
    username: observable,
    turn: observable,
    gameTiles: observable,
    gameTilesID: observable,
    game_name: observable,
    gameState: observable,
    chosenCard: observable,
    mousedOverTile: observable,
    buyProcessStarted: observable,
    positions: computed,
    diceSum: computed,
    thisPlayersTurn: computed,
    playerState: computed,
    thisPlayer: computed,
    inGame: computed,
    playerJailState: computed,
    getPlayer: computed,
    chosenTile: computed,
    mousedOverTileInfo: computed,
    mousedOverTileIDInfo: computed,
    playerTile: computed,
    rollDice: action,
    takeTurn: action,
    setPlayerState: action,
    buyProperty: action,
    moveHere: action,
    movePlayerToTile: action,
    checkTile: action,
    payPercentTax: action,
    payFlatTax: action,
    goToJail: action,
    utilityChanceCardPayment: action,
    checkAndUpdateDoublesRolled: action,
    setJailState: action,
    clearMousedOverTile: action,
    setMousedOverTile: action,
    rollAndMove: action,
    setUsername: action,
    buyPrompt: action,
    mortgageProp: action,
    changeCurrentPlayer: action,
    setGameInfo: action,
    payOutOfJail: action,
    connectToGame: action,
    joinGame: action,
    setGameName: action,
    payLuxuryTax: action,
    newGame: action,
    connectedFromNew: action,
    movePlayerDev: action,
    movePlayer: action,
    payPlayer: action,
    buyTile: action,
    startTurn: action,
    payAllPlayers: action,
    endTurn: action,
    handleModifierCard: action,
    checkIfPlayerPassedGo: action,
    playerPassedGoMoneyIncrease: action,
    checkIfTooManyDoubles: action,
    socketActions: action,
    checkAndSetCurrentPlayer: action,
});

export default new Store();