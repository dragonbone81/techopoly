import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';

class Player extends Component {
    render() {
        let className = "";
        if (this.props.vertical) {
            className = "game-tile vertical";
        } else {
            className = "game-tile";
        }
        if (this.props.edge) {
            className = "game-tile edge";
        }
        return (
            <div>
                Player
            </div>
        );
    }
}

export default inject("store")(observer(Player));
