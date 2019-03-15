import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';

class Player extends Component {
    render() {
        return (
            <div className="player d-flex justify-content-center">
                <b>{this.props.playerNumber + 1}</b>
            </div>
        );
    }
}

export default inject("store")(observer(Player));
