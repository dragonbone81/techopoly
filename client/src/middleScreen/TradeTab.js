import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class TradeTab extends Component {
    proposeTrade = () => {
        this.props.selectTab({selectedTab: "my_info"});
        this.props.store.createTrade(this.props.player, this.props.store.currentProposingTrade.givenProperties, this.props.store.currentProposingTrade.takenProperties, this.props.store.currentProposingTrade.moneyGiven, this.props.store.currentProposingTrade.moneyTaken);
        this.props.store.refreshCurrentProposingTrade();
    };

    render() {
        const yourCash = this.props.store.getPlayer.money;
        const playersCash = this.props.store.game.player_info[this.props.player].money;
        const playerIndex = this.props.store.playerIndex;
        return (
            <div className="d-flex flex-column text-center">
                <div className="d-flex flex-row justify-content-around main-trade-content">
                    <div className="d-flex flex-column text-center">
                        <div className="trade-money-label">
                            <u>You give {this.props.store.game.player_info[this.props.player].username}</u>
                        </div>
                        <div className="text-left">
                            Your money: ${yourCash}
                        </div>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text">$</span>
                            </div>
                            <input onChange={({target}) => {
                                if (target.value > yourCash)
                                    target.value = yourCash;
                                this.props.store.setCurrentProposingTrade("moneyGiven", target.value);
                            }}
                                   value={this.props.store.currentProposingTrade.moneyGiven === 0 ? "" : this.props.store.currentProposingTrade.moneyGiven}
                                   type="number"
                                   min={0}
                                   className="form-control"
                                   placeholder="Trade Money"/>
                        </div>
                        <div className="player-properties-trade">
                            {this.props.store.playersProperties(playerIndex).filter(property => !property.hasHousesOnAny).map((property, i) => {
                                return (
                                    <div key={i}
                                         className="trade-row d-flex flex-row justify-content-between align-items-center">
                                        <div className="trade-properties-pic" style={{
                                            backgroundImage: `url(${property.url})`,
                                        }}/>
                                        <div className="trade-prop-name">{property.name}</div>
                                        <div>
                                            <input
                                                onChange={() => {
                                                    const index = this.props.store.currentProposingTrade.givenProperties.findIndex(el => el === property.index);
                                                    if (index === -1) {
                                                        this.props.store.setCurrentProposingTrade("givenProperties", [...this.props.store.currentProposingTrade.givenProperties, property.index]);
                                                    } else {
                                                        this.props.store.setCurrentProposingTrade("givenProperties", [...this.props.store.currentProposingTrade.givenProperties.slice(0, index), ...this.props.store.currentProposingTrade.givenProperties.slice(index + 1)]);
                                                    }
                                                }}
                                                type="checkbox" className="double"/>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="d-flex flex-column text-center">
                        <div className="trade-money-label">
                            <u>You get from {this.props.store.game.player_info[this.props.player].username}</u>
                        </div>
                        <div className="text-left">
                            Their money: ${playersCash}
                        </div>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text">$</span>
                            </div>
                            <input onChange={({target}) => {
                                if (target.value > playersCash)
                                    target.value = playersCash;
                                this.props.store.setCurrentProposingTrade("moneyTaken", target.value);
                            }}
                                   value={this.props.store.currentProposingTrade.moneyTaken === 0 ? "" : this.props.store.currentProposingTrade.moneyTaken}
                                   type="number"
                                   min={0}
                                   className="form-control"
                                   placeholder="Trade Money"/>
                        </div>
                        <div className="player-properties-trade">
                            {this.props.store.playersProperties(this.props.player).map((property, i) => {
                                return (
                                    <div key={i}
                                         className="trade-row d-flex flex-row justify-content-between align-items-center">
                                        <div className="trade-properties-pic" style={{
                                            backgroundImage: `url(${property.url})`,
                                        }}/>
                                        <div className="trade-prop-name">{property.name}</div>
                                        <div>
                                            <input
                                                onChange={() => {
                                                    const index = this.props.store.currentProposingTrade.takenProperties.findIndex(el => el === property.index);
                                                    if (index === -1) {
                                                        this.props.store.setCurrentProposingTrade("takenProperties", [...this.props.store.currentProposingTrade.takenProperties, property.index]);
                                                    } else {
                                                        this.props.store.setCurrentProposingTrade("takenProperties", [...this.props.store.currentProposingTrade.takenProperties.slice(0, index), ...this.props.store.currentProposingTrade.takenProperties.slice(index + 1)]);
                                                    }
                                                }}
                                                type="checkbox" className="double"/>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div>
                    <button
                        disabled={(this.props.store.currentProposingTrade.moneyTaken === 0 || this.props.store.currentProposingTrade.moneyTaken === "0") && (this.props.store.currentProposingTrade.moneyGiven === 0 || this.props.store.currentProposingTrade.moneyGiven === "0") && this.props.store.currentProposingTrade.takenProperties.length === 0 && this.props.store.currentProposingTrade.givenProperties.length === 0}
                        onClick={this.proposeTrade} type="button"
                        className="btn btn-primary">Propose Trade
                    </button>
                </div>
            </div>
        );
    }
}

export default inject("store")(observer(TradeTab));