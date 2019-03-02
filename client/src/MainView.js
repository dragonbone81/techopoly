import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class MainView extends Component {
    render() {
        return (
            <div className="main-view">
                {/*{this.props.store.thisPlayersTurn &&*/}
                <button type="button" onClick={this.props.store.takeTurn} className="btn btn-primary">roll</button>
                {/*}*/}
            </div>
        );
    }
}

export default inject("store")(observer(MainView));
