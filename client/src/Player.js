import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';

class Player extends Component {
    render() {
        return (
            <div>
                Player
            </div>
        );
    }
}

export default inject("store")(observer(Player));
