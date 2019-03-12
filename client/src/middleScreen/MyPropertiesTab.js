import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class MyPropertiesTab extends Component {
    render() {
        return (

            <div className="properties-tab d-flex flex-row justify-content-around my-properties-table">
                <table className="table">
                    <thead>
                    <tr>
                        <th/>
                        <th className="text-center" scope="col">Name</th>
                        <th className="text-center" scope="col">Rent</th>
                        <th className="text-center" scope="col">Upgrade</th>
                        <th className="text-center" scope="col">Mortgaged?</th>
                    </tr>
                    </thead>
                    <tbody className="">
                    {this.props.store.playersProperties(this.props.store.playerIndex).map((property, i) => {
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
                                        <div className="d-flex upgrade-bar">
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
                                        <div className="d-flex justify-content-center">
                                            <button
                                                disabled={!property.canUpgrade}
                                                className='btn btn-sm shadow-none'
                                                style={{backgroundColor: "transparent"}}
                                                onClick={() => this.props.store.upgradeProperty(property.index)}
                                            >
                                                <i className="far fa-arrow-alt-circle-up mr-2 cursor upgrade-prop"/>
                                            </button>
                                            <button
                                                disabled={!property.canDowngrade}
                                                className='btn btn-sm shadow-none'
                                                style={{backgroundColor: "transparent"}}
                                                onClick={() => this.props.store.downgradeProperty(property.index)}
                                            >
                                                <i className="far fa-arrow-alt-circle-down ml-2 cursor upgrade-prop"/>
                                            </button>
                                        </div>
                                    </td>
                                    :
                                    <td/>
                                }
                                <td className="text-center">
                                    <input
                                        disabled={(property.mortgaged && this.props.store.getPlayer.money - property.cost / 2 < 0) || this.props.store.getPlayer.state === "NOT_TURN" || !this.props.store.game.board.filter(el => el.group === property.group).every(el => el.upgrades === 0)}
                                        onChange={() => this.props.store.mortgageProperty(property.index)}
                                        checked={property.mortgaged} type="checkbox" className="double"
                                    /> {property.mortgaged ? "(-)" : "(+)"}{property.cost / 2}
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default inject("store")(observer(MyPropertiesTab));