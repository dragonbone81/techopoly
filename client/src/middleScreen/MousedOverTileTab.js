import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class MousedOverTileTab extends Component {
    state = {};

    render() {
        const tile = this.props.store.game.board[this.props.store.mousedOverTile];
        let relatedTiles = [];
        if (tile.type === "rr" || tile.type === "utility") {
            relatedTiles = this.props.store.game.board.filter((tile, i) => tile.type === this.props.store.game.board[this.props.store.mousedOverTile].type && i !== this.props.store.mousedOverTile);
        } else if (tile.type === "property") {
            relatedTiles = this.props.store.game.board.filter((tile, i) => tile.group === this.props.store.game.board[this.props.store.mousedOverTile].group && i !== this.props.store.mousedOverTile);
        }
        return (
            <div className="d-flex flex-column align-items-center justify-content-center tile-info-container">
                <div className="d-flex flex-row">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <div className="tile-info-image-div" style={{
                            backgroundImage: `url(${tile.url})`,
                        }}/>
                        <div className="tile-info-name">
                            {tile.name}
                        </div>
                    </div>
                    {(tile.type === "property" || tile.type === "rr" || tile.type === "utility") && (
                        <div className="d-flex flex-row align-items-center justify-content-center">
                            {relatedTiles.map((relTile, i) => {
                                return (
                                    <div key={i}
                                         className="d-flex flex-column align-items-center justify-content-center">
                                        <div className="rel-tile-info-image-div" style={{
                                            backgroundImage: `url(${relTile.url})`,
                                        }}/>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
                {(tile.type === "chance" || tile.type === "chest") && (
                    <div>
                        Land here and draw a card.
                    </div>
                )}
                {(tile.type === "go") && (
                    <div>
                        Pass or land and get $200.
                    </div>
                )}
                {(tile.type === "lux-tax") && (
                    <div>
                        Pay $75. Don't evade anymore taxes.
                    </div>
                )}
                {(tile.type === "income-tax") && (
                    <div>
                        Pay $200 or 10% of your net worth.
                    </div>
                )}
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
                            <div className="d-flex justify-content-between">
                                <div>Base rent:</div>
                                <div>${this.props.store.calcRentCostTile(this.props.store.mousedOverTile, true)}</div>
                            </div>
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
                            {tile.type === "rr" && (
                                <div>
                                    <div className="d-flex justify-content-between">
                                        <div>One Owned:</div>
                                        <div>$25</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>Two Owned:</div>
                                        <div>$50</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>Three Owned:</div>
                                        <div>$100</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>Four Owned:</div>
                                        <div>$200</div>
                                    </div>
                                </div>
                            )}
                            {tile.type === "utility" && (
                                <div>
                                    <div className="d-flex justify-content-between">
                                        <div>One Owned:</div>
                                        <div>$Dice×4</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>Two Owned:</div>
                                        <div>$Dice×10</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default inject("store")(observer(MousedOverTileTab));