import React, {Component} from 'react';
import "./App.css";
import {inject, observer} from "mobx-react";
import {withRouter} from 'react-router-dom';
import Board from "./Board"


class MainApp extends Component {
    state = {
        selectedTab: this.props.history.location.pathname
    };

    render() {
        return (
            <div className="main d-flex flex-column">
                <Board/>
            </div>
        );
    }
}

export default withRouter(inject("store")(observer(MainApp)));
