import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import Player from './Player';

// import tiles from '../../server/monopoly';

class Card extends Component {
    render() {
        return (
            <div
                // onClick={() => this.props.store.devMoveHere(this.props.position)}
                style={{
                    backgroundImage: `url(${this.props.store.game.board[this.props.position].url})`,
                    // border: `2px solid ${this.props.store.game.board[this.props.position].color}`
                }}
                className={`game-tile d-flex flex-wrap align-content-between justify-content-between ${this.props.store.game.board[this.props.position].mortgaged ? "grey-card" : ""}`}
                onMouseLeave={this.props.store.clearMousedOverTile}
                onMouseEnter={() => this.props.store.setMousedOverTile(this.props.position)}
            >
                {this.props.store.game.player_info.filter(player => player.position === this.props.position).map((player, i) => {
                    return <Player playerNumber={player.id} key={i}/>
                })}
                {this.props.store.game.animated_players_move.moves.filter(tileIndex => tileIndex === this.props.position).map((tileIndex, i) => {
                    return <Player key={i} moving={true}/>
                })}
                {this.props.right && this.props.store.game.board[this.props.position].owned && <div
                    style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                    className="owned-square-right"/>}
                {this.props.right && this.props.store.game.board[this.props.position].owned && (
                    <div className="d-flex flex-column left-tiles-upgrade-bar">
                        {this.props.store.game.board[this.props.position].upgrades > 0 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="left-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 1 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="left-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 2 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="left-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 3 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="left-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 4 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="left-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 4 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="left-tiles-upgrade-bar-component"
                        />
                        }
                    </div>
                )}
                {/*{this.props.bottom && this.props.store.game.board[this.props.position].color && (*/}
                    {/*<div style={{backgroundColor: this.props.store.game.board[this.props.position].color}}*/}
                         {/*className="d-flex flex-row top-tiles-color"/>*/}
                {/*)}*/}
                {this.props.bottom && this.props.store.game.board[this.props.position].owned && <div
                    style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                    className="owned-square-bottom"/>}
                {this.props.bottom && this.props.store.game.board[this.props.position].owned && (
                    <div className="d-flex flex-row top-tiles-upgrade-bar">
                        {this.props.store.game.board[this.props.position].upgrades > 0 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="top-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 1 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="top-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 2 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="top-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 3 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="top-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 4 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="top-tiles-upgrade-bar-component"
                        />
                        }
                    </div>
                )}
                {this.props.left && this.props.store.game.board[this.props.position].owned && <div
                    style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                    className="owned-square-left"/>}
                {this.props.left && this.props.store.game.board[this.props.position].owned && (
                    <div className="d-flex flex-column right-tiles-upgrade-bar">
                        {this.props.store.game.board[this.props.position].upgrades > 0 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="right-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 1 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="right-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 2 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="right-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 3 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="right-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 4 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="right-tiles-upgrade-bar-component"
                        />
                        }
                    </div>
                )}
                {this.props.top && this.props.store.game.board[this.props.position].owned && <div
                    style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                    className="owned-square-top"/>}
                {this.props.top && this.props.store.game.board[this.props.position].owned && (
                    <div className="d-flex flex-row bottom-tiles-upgrade-bar">
                        {this.props.store.game.board[this.props.position].upgrades > 0 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="bottom-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 1 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="bottom-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 2 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="bottom-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 3 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="bottom-tiles-upgrade-bar-component"
                        />
                        }
                        {this.props.store.game.board[this.props.position].upgrades > 4 &&
                        <div
                            style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                            className="bottom-tiles-upgrade-bar-component"
                        />
                        }
                    </div>
                )}
            </div>
        );
    }
}

export default inject("store")(observer(Card));
