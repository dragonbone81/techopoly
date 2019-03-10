import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import Mortgage from './Mortgage';
import ViewProperties from './ViewProperties';

class MainView extends Component {
    state = {
        dropdownExpanded: false,
        selectedTab: "my_info",
    };

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
                <div className="main-view-content">
                    <ul className="nav nav-tabs">
                        <li className="nav-item cursor" onClick={() => this.setState({selectedTab: "my_info"})}>
                            <div className={`nav-link ${this.state.selectedTab === "my_info" ? "active" : ""}`}>My
                                Info
                            </div>
                        </li>
                        <li className="nav-item cursor" onClick={() => this.setState({selectedTab: "my_properties"})}>
                            <div className={`nav-link ${this.state.selectedTab === "my_properties" ? "active" : ""}`}>My
                                Properties
                            </div>
                        </li>
                        <li className="nav-item dropdown cursor"
                            onMouseEnter={() => this.setState({dropdownExpanded: true})}
                            onMouseLeave={() => this.setState({dropdownExpanded: false})}
                        >
                            <div className="nav-link dropdown-toggle" data-toggle="dropdown" role="button"
                                 aria-haspopup="true" aria-expanded="false">Players
                            </div>
                            <div className={`dropdown-menu ${this.state.dropdownExpanded ? "show" : ""}`}>
                                <div className="dropdown-item">Action</div>
                                <div className="dropdown-item">Another action</div>
                                <div className="dropdown-item">Something else here</div>
                            </div>
                        </li>
                    </ul>
                    {this.state.selectedTab === "my_info" && (
                        <div className="info-tab d-flex flex-row justify-content-around">
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
                    )}
                    {this.state.selectedTab === "my_properties" && (
                        <div className="properties-tab d-flex flex-row justify-content-around my-properties-table">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th scope="col"/>
                                    <th scope="col">Name</th>
                                    <th scope="col">Rent</th>
                                </tr>
                                </thead>
                                <tbody className="">
                                {this.props.store.playerProperties.map((property, i) => {
                                    return (
                                        <tr>
                                            <th scope="row">
                                                <div key={i} className="my-properties-pic" style={{
                                                    backgroundImage: `url(${property.url})`,
                                                }}/>
                                            </th>
                                            <td>{property.name}</td>
                                            <td>$125</td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {this.state.selectedTab === "my_info" && (
                        <div>
                            {this.props.store.playerState === "START_TURN" && this.props.store.getPlayer.jail_turns < 3 && (
                                <button type="button" onClick={this.props.store.startTurn}
                                        className="btn btn-primary">roll
                                </button>
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
                            {this.props.store.playerState === "BUY_TILE" && (
                                <div>
                                    <button onClick={this.props.store.buyTile}>Buy Tile</button>
                                    <button onClick={this.props.store.rejectBuyTile}>Reject Buy</button>
                                </div>
                            )}
                            {this.props.store.playerState === "INCOME_TAX" && (
                                <div>
                                    <button onClick={this.props.store.payPercentTax}>Pay 10%</button>
                                    <button onClick={this.props.store.payFlatTax}>Pay $200</button>
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
                        </div>
                    )}
                </div>
                }
            </div>
        );
    }
}

export default inject("store")(observer(MainView));
