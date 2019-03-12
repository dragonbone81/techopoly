import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {withRouter} from 'react-router-dom';


class NewGame extends Component {
    state = {
        // name: "",
        // username: "",
        // password: "",
        game_name: "",
        game_password: "",
        username: "",
        password: "",
    };

    componentDidMount() {
        localStorage.removeItem("username");
    }

    submitNewGame = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/create_game", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                game_name: this.state.game_name,
                game_password: this.state.game_password,
                username: this.state.username,
                password: this.state.password
            }),
        })
            .then(res => res.json())
            .then(response => {
                localStorage.setItem("previous_game", JSON.stringify({
                    game_name: this.state.game_name,
                    game_password: this.state.game_password,
                    username: this.state.username,
                    password: this.state.password,
                    game_id: response.game_id,
                }));
                console.log(response);
                this.props.history.push("/play-game");
            });
    };

    render() {

        return (
            <div>
                {/*<input onChange={({target}) => this.setState({name: target.value})} value={this.state.name}*/}
                {/*placeholder="Game Name"/>*/}
                {/*<input onChange={({target}) => this.setState({username: target.value})} value={this.state.username}*/}
                {/*placeholder="username"/>*/}
                {/*<input onChange={({target}) => this.setState({password: target.value})} value={this.state.password}*/}
                {/*placeholder="password"/>*/}
                {/*<button onClick={() => {*/}
                {/*this.props.store.connectedFromNew();*/}
                {/*this.props.store.newGame(this.state.name, this.state.username, this.state.password);*/}
                {/*this.props.history.push(`/game/${this.state.name}`);*/}
                {/*}}>New Game*/}
                {/*</button>*/}
                {/*<button onClick={() => {*/}
                {/*this.props.store.connectedFromNew();*/}
                {/*this.props.store.connectToGame(this.state.name, this.state.username, this.state.password);*/}
                {/*this.props.history.push(`/game/${this.state.name}`);*/}
                {/*}}>Join*/}
                {/*</button>*/}
                <div className="d-flex flex-column">
                    <div className="create-game-input">
                        <form onSubmit={this.submitNewGame}>
                            <h5>Create Game</h5>
                            <small className="form-text text-muted align-self-start">Game name</small>
                            <input required value={this.state.game_name}
                                   onChange={({target}) => this.setState({game_name: target.value})}
                                   type="text"
                                   className="form-control"
                                   placeholder="Enter game name"/>
                            <small className="form-text text-muted align-self-start">Game password</small>
                            <input required value={this.state.game_password}
                                   onChange={({target}) => this.setState({game_password: target.value})}
                                   type="password" className="form-control mb-2"
                                   placeholder="Password *can be simple"/>
                            <small className="form-text text-muted align-self-start">Your name</small>
                            <input required value={this.state.username}
                                   onChange={({target}) => this.setState({username: target.value})}
                                   type="text" className="form-control mb-2"
                                   placeholder="Your game name"/>
                            <small className="form-text text-muted align-self-start">Your password</small>
                            <input required value={this.state.password}
                                   onChange={({target}) => this.setState({password: target.value})} type="password"
                                   className="form-control mb-2"
                                   placeholder="Password *can be simple"/>
                            <button type="submit" className="btn btn-primary">Create</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(inject("store")(observer(NewGame)));
