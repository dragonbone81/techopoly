import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';

class Player extends Component {
    render() {
        return (
            <div
                className={`${this.props.moving ? "player-moving" : "player"} d-flex justify-content-center align-items-center`}
                style={{backgroundColor: !this.props.moving ? this.props.store.game.player_info[this.props.playerNumber].color : null}}
            >
                {this.props.moving && (
                    <i className="fas fa-circle"/>
                )}
                {!this.props.moving && (
                    <b>{this.props.playerNumber + 1}</b>
                )}
            </div>
        );
    }
}

export default inject("store")(observer(Player));
