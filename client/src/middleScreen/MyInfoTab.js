import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class MyInfoTab extends Component {
    render() {
        const [diceOne, diceTwo] = this.props.store.getPlayer.dice;
        return (
            <div className="info-tab d-flex flex-column">
                <div className="d-flex flex-row justify-content-around">
                    <div className="d-flex flex-column">
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Username: </span>
                            <span className="flex-fill">{this.props.store.getPlayer.username}</span>
                        </div>
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Current Tile: </span>
                            <span className="flex-fill">{this.props.store.playerTile.name}</span>
                        </div>
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Out Of Jail: </span>
                            <span className="flex-fill">Nope</span>
                        </div>
                    </div>
                    <div className="d-flex flex-column">
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Cash: </span>
                            <span className="flex-fill">${this.props.store.getPlayer.money}</span>
                        </div>
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Net Worth: </span>
                            <span className="flex-fill">${this.props.store.netWorth}</span>
                        </div>
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Liquid Worth: </span>
                            <span className="flex-fill">${this.props.store.liquidWorth}</span>
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-row justify-content-center align-items-center dice-content">
                    {diceOne === 1 && <i className="fas fa-dice-one"/>}
                    {diceOne === 2 && <i className="fas fa-dice-two"/>}
                    {diceOne === 3 && <i className="fas fa-dice-three"/>}
                    {diceOne === 4 && <i className="fas fa-dice-four"/>}
                    {diceOne === 5 && <i className="fas fa-dice-five"/>}
                    {diceOne === 6 && <i className="fas fa-dice-six"/>}
                    <div className="space-between-dice"/>
                    {diceTwo === 1 && <i className="fas fa-dice-one"/>}
                    {diceTwo === 2 && <i className="fas fa-dice-two"/>}
                    {diceTwo === 3 && <i className="fas fa-dice-three"/>}
                    {diceTwo === 4 && <i className="fas fa-dice-four"/>}
                    {diceTwo === 5 && <i className="fas fa-dice-five"/>}
                    {diceTwo === 6 && <i className="fas fa-dice-six"/>}

                </div>
            </div>
        )
    }
}

export default inject("store")(observer(MyInfoTab));