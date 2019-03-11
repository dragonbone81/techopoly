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

//TODO finish net and liquid worth calcs and do all other calcs for worth and mortgages
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
    selectedTab = "my_info";
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
    mergeTradeData = (tradeIndex) => {
        const trade = this.game.trades[tradeIndex];
        this.game.player_info[trade.initiating_player].money -= parseInt(trade.given_money);
        this.game.player_info[trade.initiating_player].money += parseInt(trade.taken_money);
        this.game.player_info[trade.trading_player].money += parseInt(trade.given_money);
        this.game.player_info[trade.trading_player].money -= parseInt(trade.taken_money);
        trade.given_properties.forEach(propIndex => {
            this.game.board[propIndex].player = trade.trading_player;
        });
        trade.taken_properties.forEach(propIndex => {
            this.game.board[propIndex].player = trade.initiating_player;
        });
    };
    acceptTrade = (tradeIndex) => {
        const trade = this.game.trades[tradeIndex];
        this.mergeTradeData(tradeIndex);
        this.game.trades[tradeIndex].state = "ACCEPTED";
        this.addToLog(`${this.game.player_info[trade.trading_player].username} accepted a trade from ${this.game.player_info[trade.initiating_player].username}`);
        this.socket.emit("accept_trade", {
            game_name: this.game.game_name,
            username: this.username,
            trade_index: tradeIndex,
            trade,
        });

    };
    rejectTrade = (tradeIndex) => {
        const trade = this.game.trades[tradeIndex];
        this.game.trades[tradeIndex].state = "REJECTED";
        this.addToLog(`${this.game.player_info[trade.trading_player].username} rejected a trade from ${this.game.player_info[trade.initiating_player].username}`);
        this.socket.emit("reject_trade", {
            game_name: this.game.game_name,
            username: this.username,
            trade_index: tradeIndex,
        });
    };
    cancelTrade = (tradeIndex) => {
        const trade = this.game.trades[tradeIndex];
        this.game.trades[tradeIndex].state = "CANCELED";
        this.addToLog(`${this.game.player_info[trade.initiating_player].username} canceled a trade to ${this.game.player_info[trade.trading_player].username}`);
        this.socket.emit("cancel_trade", {
            game_name: this.game.game_name,
            username: this.username,
            trade_index: tradeIndex,
        });
    };
    createTrade = (tradingPlayer, givenProperties, takenProperties, givenMoney, takenMoney) => {
        const initiatingPlayer = this.game.player_info.findIndex(el => el.username === this.username);
        const trade = {
            initiating_player: initiatingPlayer,
            trading_player: tradingPlayer,
            given_properties: givenProperties,
            taken_properties: takenProperties,
            given_money: givenMoney,
            taken_money: takenMoney,
            state: "PROPOSED",
        };
        this.addToLog(`${this.game.player_info[initiatingPlayer].username} initiated a trade with ${this.game.player_info[tradingPlayer].username}`);
        this.game.trades.push(trade);
        this.socket.emit("create_trade", {
            game_name: this.game.game_name,
            username: this.username,
            trade
        });
    };
    payPlayer = () => {
        const receivingPlayer = this.playerTile.player;
        const givingPlayer = this.game.player_info.findIndex(el => el.username === this.username);
        const rent = this.calcRentCostTile(this.game.player_info[givingPlayer].position, false);
        this.addToLog(`${this.getPlayer.username} paid ${this.game.player_info[receivingPlayer].username} $${rent} for visiting ${this.playerTile.name}.`);
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
    addToLog = (log) => {
        const newLog = {log: log, time: new Date()};
        this.game.logs.push(newLog);
        this.socket.emit("add_log", {
            game_name: this.game.game_name,
            username: this.username,
            log: newLog,
        });
    };
    checkTile = () => {
        const tile = this.game.board[this.getPlayer.position];
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
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
        this.addToLog(`${this.getPlayer.username} rolled a ${this.diceSum} (${this.getPlayer.dice[0]} - ${this.getPlayer.dice[1]}) and is now at ${tile.name}.`);
        this.checkIfPlayerPassedGo();
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
            this.addToLog(`${this.getPlayer.username} is going to jail :(`);
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
        this.addToLog(`${this.getPlayer.username} picked a card: ${newCard.name}`);
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
        this.addToLog(`${this.getPlayer.username} paid $75 for tax evasion :O`);
        if (this.getPlayer.dice[0] === this.getPlayer.dice[1]) {
            this.setPlayerState("START_TURN");
        } else {
            this.setPlayerState("END_OF_TURN");
        }
        this.syncPlayerState();
    };
    payPercentTax = () => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money -= Math.ceil(this.netWorth * .10);
        this.updatePlayerMoney(playerIndex);
        this.addToLog(`${this.getPlayer.username} chose to pay 10% of their net worth (${Math.ceil(this.netWorth * .10)}).`);
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
        this.addToLog(`${this.getPlayer.username} chose to pay $200 dollars.`);
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
        this.addToLog(`${this.getPlayer.username} passed GO and earned $200!`);
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
        this.addToLog(`${this.getPlayer.username} bought ${this.playerTile.name} for $${this.playerTile.cost}.`);
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
        this.addToLog(`${this.getPlayer.username} refused to buy ${this.playerTile.name}.`);
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
    upgradeProperty = (index) => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money -= this.game.board[index].upgrade;
        this.updatePlayerMoney(playerIndex);
        this.game.board[index].upgrades += 1;
        this.socket.emit('tile_upgrade', {
            game_name: this.game.game_name,
            username: this.username,
            property_index: index,
            upgrades: this.game.board[index].upgrades,
        });
    };
    downgradeProperty = (index) => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        this.game.player_info[playerIndex].money += this.game.board[index].upgrade / 2;
        this.updatePlayerMoney(playerIndex);
        this.game.board[index].upgrades -= 1;
        this.socket.emit('tile_upgrade', {
            game_name: this.game.game_name,
            username: this.username,
            property_index: index,
            upgrades: this.game.board[index].upgrades,
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
        this.socket.on("property_mortgaged", data => {
            console.log("property_mortgaged", data);
            runInAction(() => {
                this.game.board[data.property_index].mortgaged = data.mortgage_value;
            });
        });
        this.socket.on("tile_upgraded", data => {
            console.log("tile_upgraded", data);
            runInAction(() => {
                this.game.board[data.property_index].upgrades = data.upgrades;
            });
        });
        this.socket.on("trade_accepted", data => {
            console.log("trade_accepted", data);
            this.mergeTradeData(data.trade_index);
            runInAction(() => {
                this.game.trades[data.trade_index].state = "ACCEPTED";
            });
        });
        this.socket.on("trade_rejected", data => {
            console.log("trade_rejected", data);
            runInAction(() => {
                this.game.trades[data.trade_index].state = "REJECTED";
            });
        });
        this.socket.on("trade_canceled", data => {
            console.log("trade_canceled", data);
            runInAction(() => {
                this.game.trades[data.trade_index].state = "CANCELED";
            });
        });
        this.socket.on("trade_created", data => {
            console.log("trade_created", data);
            runInAction(() => {
                this.game.trades.push(data.trade);
            });
        });
        this.socket.on("log_added", data => {
            console.log("log_added", data);
            runInAction(() => {
                this.game.logs.push(data.log);
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
        ];
        this.socket.emit("update_dice_roll", {
            game_name: this.game.game_name,
            username: this.username,
            dice: this.game.player_info[playerIndex].dice,
            player_index: playerIndex,
        });
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
        if (this.playerTile.type === "rr") {
            let numOwns = this.game.board.filter(el => el.type === "rr" && el.player === this.playerTile.player).length;
            let rent = this.playerTile.base_rent * Math.pow(2, numOwns - 1);
            return rent;
        } else if (this.playerTile.type === "property") {
            if (this.playerTile.mortgaged) {
                return 0;
            }
            let ownsAll = this.game.board.filter(el => el.group === this.playerTile.group && el.player !== this.playerTile.player).length === 0;
            let noneMortgaged = this.game.board.filter(el => el.group === this.playerTile.group).every(el => !el.mortgaged);
            if (ownsAll && noneMortgaged) {
                if (this.playerTile.upgrades > 0) {
                    return this.playerTile.rent[this.playerTile.upgrades];
                }
                return this.playerTile.rent[0] * 2;
            } else {
                return this.playerTile.rent[0];
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
    calcRentCostTile = (tileIndex, preDiceRoll) => {
        const tile = this.game.board[tileIndex];
        if (tile.type === "rr") {
            let numOwns = this.game.board.filter(el => el.type === "rr" && el.player === tile.player).length;
            return tile.base_rent * Math.pow(2, numOwns - 1);
        } else if (tile.type === "property") {
            if (tile.mortgaged) {
                return 0;
            }
            let ownsAll = this.game.board.filter(el => el.group === tile.group && el.player !== tile.player).length === 0;
            let noneMortgaged = this.game.board.filter(el => el.group === tile.group).every(el => !el.mortgaged);
            if (ownsAll && noneMortgaged) {
                if (tile.upgrades > 0) {
                    return tile.rent[tile.upgrades];
                }
                return tile.rent[0] * 2;
            } else {
                return tile.rent[0];
            }
        } else if (tile.type === "utility") {
            let ownsAll = this.game.board.filter(el => el.group === tile.group && el.player !== tile.player).length === 0;
            if (!ownsAll) {
                if (preDiceRoll) {
                    return "Dice×4";
                }
                return this.diceSum * 4;
            } else {
                if (preDiceRoll) {
                    return "Dice×10";
                }
                return this.diceSum * 10;
            }
        }
    };
    mortgageProperty = (property) => {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        if (this.game.board[property].mortgaged) {
            this.game.player_info[playerIndex].money -= this.game.board[property].cost / 2;
            this.updatePlayerMoney(playerIndex);
        } else {
            this.game.player_info[playerIndex].money += this.game.board[property].cost / 2;
            this.updatePlayerMoney(playerIndex);
        }
        this.game.board[property].mortgaged = !this.game.board[property].mortgaged;
        this.socket.emit("mortgage_property", {
            game_name: this.game.game_name,
            username: this.username,
            property_index: property,
            mortgage_value: this.game.board[property].mortgaged,
        });
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

    // get playersProperties() {
    //     return this.gameTilesID.filter((el, i) => {
    //         if (el.player === this.player) {
    //             return {...el, ...this.gameTiles[i]}
    //         }
    //     })
    //         .sort((a, b) => {
    //             return a.group === b.group ? a.cost < b.cost ? 1 : -1 : a.type === b.type ? a.group < b.group ? -1 : 1 : a.type < b.type ? -1 : 1
    //         })
    // }

    get getPlayer() {
        return this.game.player_info[this.game.player_info.findIndex(el => el.username === this.username)];
    }

    get inGame() {
        if (!this.game.player_info) {
            console.log("here", this.game.player_info)
            return false;
        } else if (this.game.player_info.findIndex(el => el.username === this.username) === -1) {
            console.log('this')
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

    netWorthOfPlayer = (playerIndex) => {
        if (!this.game.player_info) {
            return 0
        }
        let worth = this.game.player_info[playerIndex].money;
        this.game.board.forEach(tile => {
            if (tile.owned && tile.player === playerIndex) {
                worth += tile.cost;
                if (tile.upgrades) {
                    worth += tile.upgrades * tile.upgrade;
                }
            }
        });
        return worth;
    };
    liquidWorthofPlayer = (playerIndex) => {
        if (!this.game.player_info) {
            return 0
        }
        let worth = this.game.player_info[playerIndex].money;
        this.game.board.forEach(tile => {
            if (tile.owned && tile.player === playerIndex) {
                worth += tile.cost / 2;
                if (tile.upgrades) {
                    worth += tile.upgrades * (tile.upgrade / 2);
                }
            }
        });
        return worth;
    };

    get netWorth() {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        let worth = this.getPlayer.money;
        this.game.board.forEach(tile => {
            if (tile.owned && tile.player === playerIndex) {
                worth += tile.cost;
                if (tile.upgrades) {
                    worth += tile.upgrades * tile.upgrade;
                }
            }
        });
        return worth;
    }

    get liquidWorth() {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        let worth = this.getPlayer.money;
        this.game.board.forEach(tile => {
            if (tile.owned && tile.player === playerIndex) {
                worth += tile.cost / 2;
                if (tile.upgrades) {
                    worth += tile.upgrades * (tile.upgrade / 2);
                }
            }
        });
        return worth;
    }

    playersProperties = (playerIndex) => {
        const player = this.game.player_info[playerIndex];
        return this.game.board
            .map((tile, i) => {
                let ownsAll = this.game.board.filter(el => el.group === this.game.board[i].group && el.player !== this.game.board[i].player).length === 0;
                let noneMortgaged = this.game.board.filter(el => el.group === this.game.board[i].group).every(el => !el.mortgaged);
                let offByOneUp = this.game.board.filter(el => el.group === this.game.board[i].group).every(el => {
                    if (tile.upgrades > el.upgrades) {
                        return false;
                    }
                    return tile.upgrades < el.upgrades || tile.upgrades === el.upgrades;

                });
                let offByOneDown = this.game.board.filter(el => el.group === this.game.board[i].group).every(el => {
                    if (tile.upgrades < el.upgrades) {
                        return false;
                    }
                    return tile.upgrades > el.upgrades || tile.upgrades === el.upgrades;

                });
                const hasHousesOnAny = this.game.board.filter(el => el.group === this.game.board[i].group && el.upgrade && el.upgrades > 0).length > 0;
                const canUpgrade = offByOneUp && ownsAll && noneMortgaged && this.game.board[i].upgrades < 5 && player.money >= this.game.board[i].upgrade;
                const canDowngrade = offByOneDown && ownsAll && noneMortgaged && this.game.board[i].upgrades > 0;
                let calculatedRent = this.calcRentCostTile(i, true);
                return {...tile, index: i, canUpgrade, canDowngrade, calculatedRent, ownsAll, hasHousesOnAny}
            })
            .filter(tile => {
                return tile.owned && tile.player === playerIndex;
            })
            .sort((a, b) => {
                return a.group === b.group ? a.cost < b.cost ? 1 : -1 : a.type === b.type ? a.group < b.group ? -1 : 1 : a.type < b.type ? -1 : 1
            });
    };

    get playerProperties() {
        const playerIndex = this.game.player_info.findIndex(el => el.username === this.username);
        return this.game.board
            .map((tile, i) => {
                let ownsAll = this.game.board.filter(el => el.group === this.game.board[i].group && el.player !== this.game.board[i].player).length === 0;
                let noneMortgaged = this.game.board.filter(el => el.group === this.game.board[i].group).every(el => !el.mortgaged);
                let offByOneUp = this.game.board.filter(el => el.group === this.game.board[i].group).every(el => {
                    if (tile.upgrades > el.upgrades) {
                        return false;
                    }
                    return tile.upgrades < el.upgrades || tile.upgrades === el.upgrades;

                });
                let offByOneDown = this.game.board.filter(el => el.group === this.game.board[i].group).every(el => {
                    if (tile.upgrades < el.upgrades) {
                        return false;
                    }
                    return tile.upgrades > el.upgrades || tile.upgrades === el.upgrades;

                });
                const canUpgrade = offByOneUp && ownsAll && noneMortgaged && this.game.board[i].upgrades < 5 && this.getPlayer.money >= this.game.board[i].upgrade;
                const canDowngrade = offByOneDown && ownsAll && noneMortgaged && this.game.board[i].upgrades > 0;
                let calculatedRent = this.calcRentCostTile(i, true);
                return {...tile, index: i, canUpgrade, canDowngrade, calculatedRent}
            })
            .filter(tile => {
                return tile.owned && tile.player === playerIndex;
            })
            .sort((a, b) => {
                return a.group === b.group ? a.cost < b.cost ? 1 : -1 : a.type === b.type ? a.group < b.group ? -1 : 1 : a.type < b.type ? -1 : 1
            });
    }

    canUpgrade = (propertyIndex) => {
        let ownsAll = this.game.board.filter(el => el.group === this.game.board[propertyIndex].group && el.player !== this.game.board[propertyIndex].player).length === 0;
        let noneMortgaged = this.game.board.filter(el => el.group === this.game.board[propertyIndex].group).every(el => !el.mortgaged);
        return ownsAll && noneMortgaged && this.game.board[propertyIndex].upgrades < 3 && this.getPlayer.money >= this.game.board[propertyIndex].upgrade;
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
    selectedTab: observable,
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
    netWorth: computed,
    liquidWorth: computed,
    playerProperties: computed,
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
    mortgageProperty: action,
    changeCurrentPlayer: action,
    setGameInfo: action,
    createTrade: action,
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
    mergeTradeData: action,
    acceptTrade: action,
    addToLog: action,
    startTurn: action,
    payAllPlayers: action,
    endTurn: action,
    handleModifierCard: action,
    upgradeProperty: action,
    rejectTrade: action,
    cancelTrade: action,
    downgradeProperty: action,
    checkIfPlayerPassedGo: action,
    playerPassedGoMoneyIncrease: action,
    checkIfTooManyDoubles: action,
    socketActions: action,
    checkAndSetCurrentPlayer: action,
});

export default new Store();