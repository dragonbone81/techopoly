import React, {Component} from 'react';
import Board from "./Board"
import NewGame from "./NewGame"
import {Switch, Route} from 'react-router-dom';

class App extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/game/:game_name" component={
                    () => <div className="main">
                        <Board/>
                    </div>
                }/>
                <Route exact path="/play-game" component={
                    () => <div className="main">
                        <Board/>
                    </div>
                }/>
                <Route exact path="/newgame" component={NewGame}/>
            </Switch>
        );
    }
}

export default App;
