import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import Mortgage from './Mortgage';
import ViewProperties from './ViewProperties';

class MainView extends Component {
    render() {
        return (
            <div className="main-view">
                {/*{this.props.store.mousedOverTileInfo ?*/}
                {/*<div className="d-flex flex-column">*/}
                {/*<div>Owner: {this.props.store.mousedOverTileIDInfo.owned ? this.props.store.players[this.props.store.mousedOverTileIDInfo.player].username : "No Owner"}</div>*/}
                {/*<div>Company Name: {this.props.store.mousedOverTileInfo.name}</div>*/}
                {/*<div>{this.props.store.mousedOverTileInfo.cost ?*/}
                {/*<div>Company Cost: ${this.props.store.mousedOverTileInfo.cost}</div> : null}*/}
                {/*</div>*/}
                {/*<div>{this.props.store.mousedOverTileInfo.upgrade ?*/}
                {/*(*/}
                {/*<div>*/}
                {/*<div>Funding Rounds Cost: ${this.props.store.mousedOverTileInfo.upgrade}</div>*/}
                {/*<div>Rent Fee: ${this.props.store.mousedOverTileInfo.rent[0]}</div>*/}
                {/*<div>1st Round: ${this.props.store.mousedOverTileInfo.rent[1]}</div>*/}
                {/*<div>2nd Round: ${this.props.store.mousedOverTileInfo.rent[2]}</div>*/}
                {/*<div>3rd Round: ${this.props.store.mousedOverTileInfo.rent[3]}</div>*/}
                {/*<div>4th Round: ${this.props.store.mousedOverTileInfo.rent[4]}</div>*/}
                {/*<div>IPO: ${this.props.store.mousedOverTileInfo.rent[5]}</div>*/}
                {/*</div>*/}
                {/*)*/}
                {/*:*/}
                {/*null}*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*:*/}
                {/*<div>*/}
                {/*{this.props.store.thisPlayersTurn && this.props.store.buyProcessStarted &&*/}
                {/*<div>*/}
                {/*<div>Buy Tile</div>*/}
                {/*<button onClick={() => this.props.store.buyPrompt(true)}>yes</button>*/}
                {/*<button onClick={() => this.props.store.buyPrompt(false)}>no</button>*/}
                {/*</div>*/}
                {/*}*/}
                {/*{this.props.store.thisPlayersTurn &&*/}
                {/*(this.props.store.turnState !== "BUY" ?*/}
                {/*<button type="button" onClick={this.props.store.rollAndMove}*/}
                {/*className="btn btn-primary">roll</button> : null)*/}
                {/*}*/}
                {/*{this.props.store.mainView === "properties" &&*/}
                {/*<ViewProperties/>*/}
                {/*}*/}
                {/*</div>*/}
                {/*}*/}
                {this.props.store.gameState !== "NOT_STARTED" &&
                <div>
                    {this.props.store.playerState === "START_TURN" && this.props.store.getPlayer.jail_turns < 3 && (
                        <button type="button" onClick={this.props.store.startTurn}
                                className="btn btn-primary">roll
                        </button>
                    )}
                    {this.props.store.getPlayer.jail_state && this.props.store.playerState === "START_TURN" && (
                        <button type="button" onClick={this.props.store.payOutOfJail}
                                className="btn btn-primary">pay 50
                        </button>
                    )}
                    {this.props.store.playerState === "BUY_TILE" && (
                        <div>
                            <button onClick={this.props.store.buyTile}>Buy Tile</button>
                            <button onClick={this.props.store.rejectBuyTile}>Reject Buy</button>
                        </div>
                    )}
                    {this.props.store.playerState === "BUY_TILE_NO_MONEY" && (
                        <div>
                            <button disabled>Buy Tile</button>
                            <button onClick={this.props.store.rejectBuyTile}>Reject Buy</button>
                        </div>
                    )}
                    {this.props.store.playerState === "END_OF_TURN" && (
                        <button type="button" onClick={this.props.store.endTurn}
                                className="btn btn-primary">End Turn
                        </button>
                    )}
                    <div>
                        <div>{this.props.store.getPlayer.money}</div>
                        <div>{`${this.props.store.dice[0]} - ${this.props.store.dice[1]}`}</div>
                    </div>
                </div>
                }
            </div>
        );
    }
}

export default inject("store")(observer(MainView));
