import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';

class Mortgage extends Component {
    render() {
        return (
            <div>
                <b>Player</b>
            </div>
        );
    }
}

export default inject("store")(observer(Mortgage));
