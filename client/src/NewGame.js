import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {withRouter} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer, toast} from 'react-toastify';

const URL = process.env.REACT_APP_URL || "http://localhost:3001";

class NewGame extends Component {
    state = {
        game_name: "",
        game_password: "",
        username: "",
        password: "",
        selectedTab: "create_game",
        searchGameName: "",
        gamesFound: [],
        gamesFoundSelected: -1,
        joinGamePassword: "",
        joinGameUsername: "",
        joinGameUsernamePassword: "",
        formError: "",
    };

    componentDidMount() {
        localStorage.removeItem("username");
    }

    submitNewGame = (e) => {
        e.preventDefault();
        fetch(`${URL}/create_game`, {
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
    joinGame = (e) => {
        e.preventDefault();
        console.log(this.state.gamesFound[this.state.gamesFoundSelected]._id);
        fetch(`${URL}/join_game`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                game_id: this.state.gamesFound[this.state.gamesFoundSelected]._id,
                game_password: this.state.joinGamePassword,
                username: this.state.joinGameUsername,
                password: this.state.joinGameUsernamePassword
            }),
        })
            .then(res => res.json())
            .then(response => {
                console.log(response)
                if (response.error) {
                    this.setState({formError: response.error}, () => {
                        if (this.state.formError === "incorrect_game_pw") {
                            toast.error("Incorrect password for game.", {
                                position: "top-right",
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            });
                        } else if (this.state.formError === "player_not_in_game") {
                            toast.error("You are not in this game.", {
                                position: "top-right",
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            });
                        } else if (this.state.formError === "incorrect_player_pw") {
                            toast.error("Incorrect password for player.", {
                                position: "top-right",
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            });
                        }
                    });
                    return;
                }
                if (response.success) {
                    localStorage.setItem("previous_game", JSON.stringify({
                        game_id: this.state.gamesFound[this.state.gamesFoundSelected]._id,
                        game_name: this.state.gamesFound[this.state.gamesFoundSelected].auth.game_name,
                        game_password: this.state.joinGamePassword,
                        username: this.state.joinGameUsername,
                        password: this.state.joinGameUsernamePassword,
                    }));
                    console.log(response);
                    this.props.history.push("/play-game");
                }
            });
    };
    keyPress = (e) => {
        if (e.keyCode === 13) {
            this.searchForGames();
        }
    };
    searchForGames = () => {
        this.setState({gamesFound: [], gamesFoundSelected: -1});
        fetch(`${URL}/search_for_games?game_name=${this.state.searchGameName}`)
            .then(res => res.json())
            .then(data => {
                this.setState({gamesFound: data.games});
            })
    };

    render() {

        return (
            <div className="new-game-main">
                <ToastContainer/>
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
                <ul className="nav nav-tabs">
                    <li className="nav-item cursor" onClick={() => this.setState({selectedTab: "create_game"})}>
                        <div className={`nav-link ${this.state.selectedTab === "create_game" ? "active" : ""}`}>
                            Create Game
                        </div>
                    </li>
                    <li className="nav-item cursor" onClick={() => this.setState({selectedTab: "join_game"})}>
                        <div className={`nav-link ${this.state.selectedTab === "join_game" ? "active" : ""}`}>
                            Join Game
                        </div>
                    </li>
                </ul>
                {this.state.selectedTab === "create_game" && (
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
                                   placeholder="Your name"/>
                            <small className="form-text text-muted align-self-start">Your password</small>
                            <input required value={this.state.password}
                                   onChange={({target}) => this.setState({password: target.value})} type="password"
                                   className="form-control mb-2"
                                   placeholder="Password *can be simple"/>
                            <button type="submit" className="btn btn-primary">Create</button>
                        </form>
                    </div>
                )}
                {this.state.selectedTab === "join_game" && (
                    <div className="create-game-input">
                        <h5>Join Game</h5>
                        <small className="form-text text-muted align-self-start">Search for games</small>
                        <div className="input-group">
                            <input required value={this.state.searchGameName}
                                   onChange={({target}) => this.setState({searchGameName: target.value})} type="text"
                                   className="form-control"
                                   placeholder="Search..."
                                   onKeyDown={this.keyPress}
                            />
                            <div className="input-group-append">
                                <button onClick={this.searchForGames} className="btn btn-outline-secondary"
                                        type="button">
                                    <i className="fas fa-search"/>
                                </button>
                            </div>
                        </div>
                        {this.state.gamesFound.length > 0 && (
                            <div className="mt-3">
                                <h5>Games Found</h5>
                                <ul className="list-group">
                                    {this.state.gamesFound.map((game, index) => {
                                        return (
                                            <li key={game._id}
                                                onClick={() => {
                                                    if (this.state.gamesFoundSelected !== index) {
                                                        this.setState({
                                                            gamesFoundSelected: index,
                                                            joinGamePassword: "",
                                                            joinGameUsername: "",
                                                            joinGameUsernamePassword: "",
                                                        })
                                                    }
                                                }}
                                                className="cursor list-group-item">
                                                {this.state.gamesFoundSelected !== index && (
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        {game.auth.game_name}
                                                        <i className="fas fa-arrow-circle-right"/>
                                                    </div>
                                                )}
                                                {this.state.gamesFoundSelected === index && (
                                                    <div className="">
                                                        {game.game_state === "INVITING_PLAYERS" && (
                                                            <div>
                                                                <small>Game has not started. You can still join...
                                                                </small>
                                                            </div>
                                                        )}
                                                        <form onSubmit={this.joinGame}>
                                                            <small
                                                                className="form-text text-muted align-self-start">Game
                                                                name
                                                            </small>
                                                            <input required value={game.auth.game_name}
                                                                   type="text"
                                                                   readOnly
                                                                   className="form-control"
                                                                   placeholder="Enter game name"/>
                                                            <small
                                                                className="form-text text-muted align-self-start">Game
                                                                password
                                                            </small>
                                                            <input required value={this.state.joinGamePassword}
                                                                   onChange={({target}) => this.setState({joinGamePassword: target.value})}
                                                                   type="password" className="form-control mb-2"
                                                                   placeholder="Game password"/>
                                                            <small
                                                                className="form-text text-muted align-self-start">Your
                                                                name
                                                            </small>
                                                            <input required value={this.state.joinGameUsername}
                                                                   onChange={({target}) => this.setState({joinGameUsername: target.value})}
                                                                   type="text" className="form-control mb-2"
                                                                   placeholder="Your name"/>
                                                            <small
                                                                className="form-text text-muted align-self-start">Your
                                                                password
                                                            </small>
                                                            <input required value={this.state.joinGameUsernamePassword}
                                                                   onChange={({target}) => this.setState({joinGameUsernamePassword: target.value})}
                                                                   type="password"
                                                                   className="form-control mb-2"
                                                                   placeholder="Your game password"/>
                                                            <button type="submit" className="btn btn-primary">Join
                                                            </button>
                                                        </form>
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(inject("store")(observer(NewGame)));
