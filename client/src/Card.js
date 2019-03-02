import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import Player from './Player';
import tiles from './monopoly';

class Card extends Component {
    render() {
        return (
            <div className="game-tile">
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
