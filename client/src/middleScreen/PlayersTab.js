import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class PlayersTab extends Component {
    render() {
        return (
            <div>
                <div className="d-flex flex-row justify-content-around">
                    <div className="d-flex flex-column">
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Username: </span>
                            <span
                                className="flex-fill">{this.props.store.game.player_info[this.props.player].username}</span>
                        </div>
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Current Tile: </span>
                            <span
                                className="flex-fill">{this.props.store.game.board[this.props.store.game.player_info[this.props.player].position].name}</span>
                        </div>
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Out Of Jail: </span>
                            <span className="flex-fill">Nope</span>
                        </div>
                    </div>
                    <div className="d-flex flex-column">
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Cash: </span>
                            <span
                                className="flex-fill">${this.props.store.game.player_info[this.props.player].money}</span>
                        </div>
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Net Worth: </span>
                            <span
                                className="flex-fill">${this.props.store.netWorthOfPlayer(this.props.player)}</span>
                        </div>
                        <div className="d-flex flex-row info-tab-row">
                            <span className="info-tab-label">Liquid Worth: </span>
                            <span
                                className="flex-fill">${this.props.store.liquidWorthofPlayer(this.props.player)}</span>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-center">
                    <button onClick={() => this.props.selectTab({selectedTab: "player_trade"})} type="button"
                            className="btn btn-primary"
                            disabled={this.props.store.getPlayer.state === "NOT_TURN"}>
                        Trade
                    </button>
                </div>
                <div
                    className="other-players-properties-tab d-flex flex-row justify-content-around other-players-properties-table">
                    <table className="table">
                        <thead>
                        <tr>
                            <th/>
                            <th className="text-center" scope="col">Name</th>
                            <th className="text-center" scope="col">Rent</th>
                            <th className="text-center" scope="col">Upgrades</th>
                            <th className="text-center" scope="col">Mortgaged?</th>
                        </tr>
                        </thead>
                        <tbody className="">
                        {this.props.store.playersProperties(this.props.player).map((property, i) => {
                            return (
                                <tr key={i}>
                                    <th scope="row">
                                        <div className="my-properties-pic" style={{
                                            backgroundImage: `url(${property.url})`,
                                        }}/>
                                    </th>
                                    <td className="text-center">{property.name}</td>
                                    <td className="text-center">{property.calculatedRent === parseInt(property.calculatedRent, 10) ? `$${property.calculatedRent}` : property.calculatedRent}</td>
                                    {property.upgrade ?
                                        <td className="text-center upgrade-col">
                                            <div className="d-flex upgrade-bar-other-player justify-content-center">
                                                <div
                                                    className={`bar-component bar-component-left ${property.upgrades > 0 ? "bar-component-filled" : ""}`}/>
                                                <div
                                                    className={`bar-component ${property.upgrades > 1 ? "bar-component-filled" : ""}`}/>
                                                <div
                                                    className={`bar-component ${property.upgrades > 2 ? "bar-component-filled" : ""}`}/>
                                                <div
                                                    className={`bar-component ${property.upgrades > 3 ? "bar-component-filled" : ""}`}/>
                                                <div
                                                    className={`bar-component ${property.upgrades > 4 ? "bar-component-filled" : ""}`}/>
                                            </div>
                                        </td>
                                        :
                                        <td/>
                                    }
                                    <td className="text-center">
                                        <input
                                            disabled
                                            checked={property.mortgaged} type="checkbox" className="double"
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default inject("store")(observer(PlayersTab));