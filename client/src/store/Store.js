import {decorate, configure, observable, action, computed, runInAction} from 'mobx'

configure({enforceActions: "observed"});

class Store {
    players = [
        {id: 1, position: 0},
        {id: 2, position: 25},
    ];
    turn = 0;
    player = 0;
    dice = [0, 0];

    rollDice = () => {
        this.dice[0] = Math.floor(Math.random() * Math.floor(6)) + 1;
        this.dice[1] = Math.floor(Math.random() * Math.floor(6)) + 1;
        console.log(this.diceSum)
    };
    takeTurn = () => {
        this.rollDice();
        this.players[this.player].position = this.circularAdd(this.players[this.player].position, this.diceSum, 39);
        console.log(this.players[0].position);
        this.player = this.circularAdd(this.player, 1, this.players.length - 1);
        console.log(this.player)
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

    get positions() {
        return this.players.map(el => el.position);
    };
}

decorate(Store, {
    players: observable,
    player: observable,
    turn: observable,
    positions: computed,
    diceSum: computed,
    thisPlayersTurn: computed,
    rollDice: action,
    takeTurn: action,
});

export default new Store();