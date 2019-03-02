import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import Player from './Player';
import tiles from './monopoly';

class Card extends Component {
    getCardColor = () => {
        if (this.props.store.gameTilesID[this.props.position].owned) {
            return this.props.store.players[this.props.store.gameTilesID[this.props.position].player].color
        } else {
            return "grey"
        }
    };

    render() {
        return (
            <div style={{border: `1px solid ${this.getCardColor()}`}} className="game-tile"
                 onMouseLeave={this.props.store.clearMousedOverTile}
                 onMouseEnter={() => this.props.store.setMousedOverTile(this.props.position)}>
                {this.props.store.positions.includes(this.props.position) ?
                    <Player/>
                    :
                    null
                }
                {/*<div>{this.props.position}</div>*/}
                <div>{tiles[this.props.position].name}</div>
            </div>
        );
    }
}

export default inject("store")(observer(Card));
