import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class MousedOverTileTab extends Component {
    state = {};

    render() {
        const tile = this.props.store.game.board[this.props.store.mousedOverTile];
        return (
            <div className="d-flex flex-column align-items-center justify-content-center tile-info-container">
                <div className="tile-info-image-div" style={{
                    backgroundImage: `url(${tile.url})`,
                }}/>
                <div className="tile-info-name">
                    {tile.name}
                </div>
                {(tile.type === "property" || tile.type === "utility" || tile.type === "rr") && (
                    <div className="d-flex flex-row tile-info-property justify-content-between">
                        <div className="d-flex flex-column tile-info-rents">
                            <div className="d-flex justify-content-between">
                                <div>Cost:</div>
                                <div>${tile.cost}</div>
                            </div>
                            {tile.owned && (
                                <div className="d-flex justify-content-between">
                                    <div>Current rent:</div>
                                    <div>${this.props.store.calcRentCostTile(this.props.store.mousedOverTile, true)}</div>
                                </div>
                            )}
                            {!tile.owned && (
                                <div className="d-flex justify-content-between">
                                    <div>Base rent:</div>
                                    <div>${this.props.store.calcRentCostTile(this.props.store.mousedOverTile, true)}</div>
                                </div>
                            )}
                        </div>
                        <div className="d-flex flex-column justify-content-between tile-info-upgrades">
                            {tile.type === "property" && (
                                <div>
                                    <div className="d-flex justify-content-between">
                                        <div>Funding Cost:</div>
                                        <div>${tile.upgrade}</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>1st Round:</div>
                                        <div>${tile.rent[1]}</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>2nd Round:</div>
                                        <div>${tile.rent[2]}</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>3rd Round:</div>
                                        <div>${tile.rent[3]}</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>4th Round:</div>
                                        <div>${tile.rent[4]}</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>5th Round:</div>
                                        <div>${tile.rent[5]}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/*{this.props.store.mousedOverTileInfo ?*/
                }
                {/*<div className="d-flex flex-column">*/
                }
                {/*<div>Owner: {this.props.store.mousedOverTileIDInfo.owned ? this.props.store.players[this.props.store.mousedOverTileIDInfo.player].username : "No Owner"}</div>*/
                }
                {/*<div>Company Name: {this.props.store.mousedOverTileInfo.name}</div>*/
                }
                {/*<div>{this.props.store.mousedOverTileInfo.cost ?*/
                }
                {/*<div>Company Cost: ${this.props.store.mousedOverTileInfo.cost}</div> : null}*/
                }
                {/*</div>*/
                }
                {/*<div>{this.props.store.mousedOverTileInfo.upgrade ?*/
                }
                {/*(*/
                }
                {/*<div>*/
                }
                {/*<div>Funding Rounds Cost: ${this.props.store.mousedOverTileInfo.upgrade}</div>*/
                }
                {/*<div>Rent Fee: ${this.props.store.mousedOverTileInfo.rent[0]}</div>*/
                }
                {/*<div>1st Round: ${this.props.store.mousedOverTileInfo.rent[1]}</div>*/
                }
                {/*<div>2nd Round: ${this.props.store.mousedOverTileInfo.rent[2]}</div>*/
                }
                {/*<div>3rd Round: ${this.props.store.mousedOverTileInfo.rent[3]}</div>*/
                }
                {/*<div>4th Round: ${this.props.store.mousedOverTileInfo.rent[4]}</div>*/
                }
                {/*<div>IPO: ${this.props.store.mousedOverTileInfo.rent[5]}</div>*/
                }
                {/*</div>*/
                }
                {/*)*/
                }
                {/*:*/
                }
                {/*null}*/
                }
                {/*</div>*/
                }
                {/*</div>*/
                }
                {/*:*/
                }
                {/*<div>*/
                }
                {/*{this.props.store.thisPlayersTurn && this.props.store.buyProcessStarted &&*/
                }
                {/*<div>*/
                }
                {/*<div>Buy Tile</div>*/
                }
                {/*<button onClick={() => this.props.store.buyPrompt(true)}>yes</button>*/
                }
                {/*<button onClick={() => this.props.store.buyPrompt(false)}>no</button>*/
                }
                {/*</div>*/
                }
                {/*}*/
                }
                {/*{this.props.store.thisPlayersTurn &&*/
                }
                {/*(this.props.store.turnState !== "BUY" ?*/
                }
                {/*<button type="button" onClick={this.props.store.rollAndMove}*/
                }
                {/*className="btn btn-primary">roll</button> : null)*/
                }
                {/*}*/
                }
                {/*{this.props.store.mainView === "properties" &&*/
                }
                {/*<ViewProperties/>*/
                }
                {/*}*/
                }
                {/*</div>*/
                }
                {/*}*/
                }
            </div>
        );
    }
}

export default inject("store")(observer(MousedOverTileTab));


{/*{this.props.store.mousedOverTileInfo ?*/
}
{/*<div className="d-flex flex-column">*/
}
{/*<div>Owner: {this.props.store.mousedOverTileIDInfo.owned ? this.props.store.players[this.props.store.mousedOverTileIDInfo.player].username : "No Owner"}</div>*/
}
{/*<div>Company Name: {this.props.store.mousedOverTileInfo.name}</div>*/
}
{/*<div>{this.props.store.mousedOverTileInfo.cost ?*/
}
{/*<div>Company Cost: ${this.props.store.mousedOverTileInfo.cost}</div> : null}*/
}
{/*</div>*/
}
{/*<div>{this.props.store.mousedOverTileInfo.upgrade ?*/
}
{/*(*/
}
{/*<div>*/
}
{/*<div>Funding Rounds Cost: ${this.props.store.mousedOverTileInfo.upgrade}</div>*/
}
{/*<div>Rent Fee: ${this.props.store.mousedOverTileInfo.rent[0]}</div>*/
}
{/*<div>1st Round: ${this.props.store.mousedOverTileInfo.rent[1]}</div>*/
}
{/*<div>2nd Round: ${this.props.store.mousedOverTileInfo.rent[2]}</div>*/
}
{/*<div>3rd Round: ${this.props.store.mousedOverTileInfo.rent[3]}</div>*/
}
{/*<div>4th Round: ${this.props.store.mousedOverTileInfo.rent[4]}</div>*/
}
{/*<div>IPO: ${this.props.store.mousedOverTileInfo.rent[5]}</div>*/
}
{/*</div>*/
}
{/*)*/
}
{/*:*/
}
{/*null}*/
}
{/*</div>*/
}
{/*</div>*/
}
{/*:*/
}
{/*<div>*/
}
{/*{this.props.store.thisPlayersTurn && this.props.store.buyProcessStarted &&*/
}
{/*<div>*/
}
{/*<div>Buy Tile</div>*/
}
{/*<button onClick={() => this.props.store.buyPrompt(true)}>yes</button>*/
}
{/*<button onClick={() => this.props.store.buyPrompt(false)}>no</button>*/
}
{/*</div>*/
}
{/*}*/
}
{/*{this.props.store.thisPlayersTurn &&*/
}
{/*(this.props.store.turnState !== "BUY" ?*/
}
{/*<button type="button" onClick={this.props.store.rollAndMove}*/
}
{/*className="btn btn-primary">roll</button> : null)*/
}
{/*}*/
}
{/*{this.props.store.mainView === "properties" &&*/
}
{/*<ViewProperties/>*/
}
{/*}*/
}
{/*</div>*/
}
{/*}*/
}