import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class TradesTab extends Component {
    state = {
        selectedTrade: 0,
    };

    componentDidMount() {
        if (this.props.store.game.player_info && this.props.store.game.trades.length > 0) {
            const playerIndex = this.props.store.playerIndex;
            const firstIndex = this.props.store.game.trades.findIndex(el => {
                return (el.initiating_player === playerIndex || el.trading_player === playerIndex) && el.state === "PROPOSED";
            });
            this.setState({selectedTrade: firstIndex});
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.selectedTrade === -1) {
            const playerIndex = this.props.store.playerIndex;
            const firstIndex = this.props.store.game.trades.findIndex(el => {
                return (el.initiating_player === playerIndex || el.trading_player === playerIndex) && el.state === "PROPOSED";
            });
            if (firstIndex !== -1) {
                this.setState({selectedTrade: firstIndex});
            }
        }
    }


    render() {
        if (this.props.store.game.player_info && this.props.store.game.trades.length > 0) {
            const playerIndex = this.props.store.playerIndex;
            const firstIndex = this.props.store.game.trades.findIndex(el => {
                return (el.initiating_player === playerIndex || el.trading_player === playerIndex) && el.state === "PROPOSED";
            });
            if (firstIndex === -1 || this.state.selectedTrade === -1) {
                return <div className="text-center">No Trades</div>
            }
            const initiatingPlayer = this.props.store.game.player_info[this.props.store.game.trades[this.state.selectedTrade].initiating_player];
            const tradingPlayer = this.props.store.game.player_info[this.props.store.game.trades[this.state.selectedTrade].trading_player];
            const areYouInitiating = this.props.store.game.trades[this.state.selectedTrade].initiating_player === playerIndex;
            const rightProperties = areYouInitiating ? this.props.store.game.trades[this.state.selectedTrade].taken_properties : this.props.store.game.trades[this.state.selectedTrade].given_properties;
            const leftProperties = areYouInitiating ? this.props.store.game.trades[this.state.selectedTrade].given_properties : this.props.store.game.trades[this.state.selectedTrade].taken_properties;
            const initiatingPlayerHasAllProperties = this.props.store.game.trades[this.state.selectedTrade].given_properties.every(index => {
                const property = this.props.store.game.board[index];
                const hasHousesOnAny = this.props.store.game.board.filter(el => el.group === this.props.store.game.board[index].group && el.upgrade && el.upgrades > 0).length > 0;
                return property.player === this.props.store.game.trades[this.state.selectedTrade].initiating_player && !hasHousesOnAny;
            });
            const tradingPlayerHasAllProperties = this.props.store.game.trades[this.state.selectedTrade].taken_properties.every(index => {
                const property = this.props.store.game.board[index];
                const hasHousesOnAny = this.props.store.game.board.filter(el => el.group === this.props.store.game.board[index].group && el.upgrade && el.upgrades > 0).length > 0;
                return property.player === this.props.store.game.trades[this.state.selectedTrade].trading_player && !hasHousesOnAny;
            });
            return (
                <div className="d-flex flex-row justify-content-around">
                    <div className="d-flex flex-column text-center">
                        <u>Trades:</u>
                        <ul ref="trades" className="list-group pending-trades">
                            {this.props.store.game.trades.map((trade, i) => ({
                                ...trade,
                                index: i
                            })).filter(trade => trade.state === "PROPOSED" && (trade.initiating_player === playerIndex || trade.trading_player === playerIndex)).map((trade, i) => {
                                return (
                                    <li key={i}
                                        onClick={() => this.setState({selectedTrade: trade.index})}
                                        className={`list-group-item list-group-item-action ${trade.index === this.state.selectedTrade ? "active" : ""}`}>
                                        From {this.props.store.game.player_info[trade.initiating_player].username}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="d-flex flex-column">
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <div className="d-flex flex-row justify-content-around main-trade-content">
                                <div className="d-flex flex-column text-center trade-view-left">
                                    <div className="trade-money-label">
                                        <u>{areYouInitiating ? `You give to ${tradingPlayer.username}` : `You give to ${initiatingPlayer.username}`}</u>
                                    </div>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">$</span>
                                        </div>
                                        <input type="number"
                                               readOnly
                                               value={areYouInitiating ? this.props.store.game.trades[this.state.selectedTrade].given_money : this.props.store.game.trades[this.state.selectedTrade].taken_money}
                                               className="form-control"
                                               placeholder="Trade Money"/>
                                    </div>
                                    <div className="player-properties-trade">
                                        {leftProperties.map((i) => {
                                            const property = this.props.store.game.board[i];
                                            return (
                                                <div key={i}
                                                     className="trade-row d-flex flex-row justify-content-between align-items-center">
                                                    <div className="trade-properties-pic" style={{
                                                        backgroundImage: `url(${property.url})`,
                                                    }}/>
                                                    <div className="trade-prop-name">{property.name}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="d-flex flex-column text-center trade-view-right">
                                    <div className="trade-money-label">
                                        <u>{areYouInitiating ? `You get from ${tradingPlayer.username}` : `You get from ${initiatingPlayer.username}`}</u>
                                    </div>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">$</span>
                                        </div>
                                        <input type="number"
                                               readOnly
                                               value={!areYouInitiating ? this.props.store.game.trades[this.state.selectedTrade].given_money : this.props.store.game.trades[this.state.selectedTrade].taken_money}
                                               className="form-control"
                                               placeholder="Trade Money"/>
                                    </div>
                                    <div className="player-properties-trade">
                                        {rightProperties.map((i) => {
                                            const property = this.props.store.game.board[i];
                                            return (
                                                <div key={i}
                                                     className="trade-row d-flex flex-row justify-content-between align-items-center">
                                                    <div className="trade-properties-pic" style={{
                                                        backgroundImage: `url(${property.url})`,
                                                    }}/>
                                                    <div className="trade-prop-name">{property.name}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div>
                                {playerIndex !== this.props.store.game.trades[this.state.selectedTrade].initiating_player &&
                                (
                                    <button
                                        disabled={this.props.store.game.player_info[playerIndex].state === "NOT_TURN" || !tradingPlayerHasAllProperties || !initiatingPlayerHasAllProperties || tradingPlayer.money < this.props.store.game.trades[this.state.selectedTrade].taken_money || initiatingPlayer.money < this.props.store.game.trades[this.state.selectedTrade].given_money}
                                        onClick={() => {
                                            this.props.store.acceptTrade(this.state.selectedTrade);
                                            this.setState({selectedTrade: firstIndex});
                                            this.refs.trades.scrollTop = 0;
                                        }} type="button"
                                        className="btn btn-primary"
                                        style={{marginRight: 10}}
                                    >Accept Trade
                                    </button>
                                )}
                                <button
                                    disabled={this.props.store.game.player_info[playerIndex].state === "NOT_TURN"}
                                    onClick={() => {
                                        playerIndex !== this.props.store.game.trades[this.state.selectedTrade].initiating_player ? this.props.store.rejectTrade(this.state.selectedTrade) : this.props.store.cancelTrade(this.state.selectedTrade);
                                        this.setState({selectedTrade: firstIndex});
                                        this.refs.trades.scrollTop = 0;
                                    }}
                                    type="button"
                                    className="btn btn-primary">{`${playerIndex !== this.props.store.game.trades[this.state.selectedTrade].initiating_player ? "Reject Trade" : "Cancel Trade"}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (<div className="text-center">No Trades</div>);
        }
    }
}

export default inject("store")(observer(TradesTab));