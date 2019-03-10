import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import Player from './Player';

// import tiles from '../../server/monopoly';

class Card extends Component {
    getCardColor = () => {
        if (this.props.store.game.board[this.props.position].owned) {
            return this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color
        } else {
            return "grey"
        }
    };

    render() {
        return (
            <div onClick={() => this.props.store.devMoveHere(this.props.position)}
                 style={{
                     backgroundImage: `url(${this.props.store.game.board[this.props.position].url})`,
                     border: `1px solid ${this.getCardColor()}`,
                 }}
                 className={`game-tile d-flex flex-wrap align-content-between justify-content-between ${this.props.store.game.board[this.props.position].mortgaged ? "grey-card" : ""}`}
                 onMouseLeave={this.props.store.clearMousedOverTile}
                 onMouseEnter={() => this.props.store.setMousedOverTile(this.props.position)}
            >
                {this.props.store.game.player_info.filter(player => player.position === this.props.position).map((player, i) => {
                    return <Player playerNumber={player.id} key={i}/>
                })}
                {this.props.right && this.props.store.game.board[this.props.position].owned && <div
                    style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                    className="owned-square-right"/>}
                {this.props.bottom && this.props.store.game.board[this.props.position].owned && <div
                    style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                    className="owned-square-bottom"/>}
                {this.props.left && this.props.store.game.board[this.props.position].owned && <div
                    style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                    className="owned-square-left"/>}
                {this.props.top && this.props.store.game.board[this.props.position].owned && <div
                    style={{backgroundColor: this.props.store.game.player_info[this.props.store.game.board[this.props.position].player].color}}
                    className="owned-square-top"/>}

                {/*<div>{this.props.position}</div>*/}
                {/*<div>{this.props.store.game.board[this.props.position].name}</div>*/}
            </div>
        );
    }
}

export default inject("store")(observer(Card));
