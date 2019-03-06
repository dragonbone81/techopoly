import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {withRouter} from 'react-router-dom';


class NewGame extends Component {
    state = {
        name: "",
        username: "",
        password: "",
    }

    componentDidMount() {
        localStorage.removeItem("username");
    }

    render() {

        return (
            <div>
                <input onChange={({target}) => this.setState({name: target.value})} value={this.state.name}
                       placeholder="Game Name"/>
                <input onChange={({target}) => this.setState({username: target.value})} value={this.state.username}
                       placeholder="username"/>
                <input onChange={({target}) => this.setState({password: target.value})} value={this.state.password}
                       placeholder="password"/>
                <button onClick={() => {
                    this.props.store.connectedFromNew();
                    this.props.store.newGame(this.state.name, this.state.username, this.state.password);
                    this.props.history.push(`/game/${this.state.name}`);
                }}>New Game
                </button>
                <button onClick={() => {
                    this.props.store.connectedFromNew();
                    this.props.store.connectToGame(this.state.name, this.state.username, this.state.password);
                    this.props.history.push(`/game/${this.state.name}`);
                }}>Join
                </button>
            </div>
        );
    }
}

export default withRouter(inject("store")(observer(NewGame)));
