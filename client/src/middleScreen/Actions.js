import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class Actions extends Component {
    render() {
        return (
            <div className="actions-tab d-flex flex-row justify-content-center align-items-center">
                {this.props.store.playerState === "START_TURN" && this.props.store.getPlayer.jail_turns < 3 && (
                    <button type="button" onClick={this.props.store.startTurn}
                            className="btn btn-primary">Roll Dice
                    </button>
                )}
                {this.props.store.playerState === "NOT_TURN" && (
                    <div>Not your turn.</div>
                )}
                {this.props.store.playerState === "UTILITY_CHANCE_CARD" && (
                    <button type="button" onClick={this.props.store.utilityChanceCardPayment}
                            className="btn btn-primary">Roll to See how much to Pay
                    </button>
                )}
                {this.props.store.getPlayer.jail_state && this.props.store.playerState === "START_TURN" && (
                    <button type="button" onClick={this.props.store.payOutOfJail}
                            className="btn btn-primary">pay 50
                    </button>
                )}
                {(this.props.store.playerState === "BUY_TILE" || this.props.store.playerState === "BUY_TILE_NO_MONEY") && (
                    <div className="accept-reject-tile-buy-div d-flex justify-content-center">
                        <div className="btn-group" role="group">
                            <button disabled={this.props.store.playerState === "BUY_TILE_NO_MONEY"} type="button"
                                    className="btn btn-primary buy-tile-button text-center"
                                    onClick={this.props.store.buyTile}>
                                Buy Tile
                            </button>
                            <button type="button" className="btn btn-primary reject-buy-tile-button"
                                    onClick={this.props.store.rejectBuyTile}>
                                Reject Buy
                            </button>
                        </div>
                    </div>
                )}
                {this.props.store.playerState === "INCOME_TAX" && (
                    <div>
                        <button onClick={this.props.store.payPercentTax}>Pay 10%</button>
                        <button onClick={this.props.store.payFlatTax}>Pay $200</button>
                    </div>
                )}
                {this.props.store.playerState === "END_OF_TURN" && (
                    <button type="button" onClick={this.props.store.endTurn}
                            className="btn btn-primary">End Turn
                    </button>
                )}
            </div>
        );
    }
}

export default inject("store")(observer(Actions));