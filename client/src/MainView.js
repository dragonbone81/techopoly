import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class MainView extends Component {
    render() {
        return (
            <div className="main-view">
                {/*{this.props.store.thisPlayersTurn &&*/}
                {this.props.store.turnState !== "BUY" ? <button type="button" onClick={this.props.store.rollAndMove}
                                                                className="btn btn-primary">roll</button> : null}
                {this.props.store.mousedOverTileInfo.name}
                {this.props.store.buyProcessStarted &&
                <div>
                    <div>Buy Tile</div>
                    <button onClick={() => this.props.store.buyPrompt(true)}>yes</button>
                    <button onClick={() => this.props.store.buyPrompt(false)}>no</button>
                </div>
                }
                {/*}*/}
            </div>
        );
    }
}

export default inject("store")(observer(MainView));
