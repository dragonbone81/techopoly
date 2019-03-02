import {decorate, configure, observable, action, computed, runInAction} from 'mobx'

configure({enforceActions: "observed"});

class Store {
    players = [
        {id: 1, position: 0},
    ];
    turn = 0;

}

decorate(Store, {
    players: observable,
    turn: observable,
});

export default new Store();