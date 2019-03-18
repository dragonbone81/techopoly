import React, {Component} from 'react';
import NewGame from "./NewGame";
import MainApp from "./MainApp";
import {Switch, Route, Redirect} from 'react-router-dom';

const RedirectHome = () => {
    return (
        <Redirect to="/start"/>
    )
};

class App extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/play-game" component={MainApp}/>
                <Route exact path="/start" component={NewGame}/>
                <Route path="/" component={RedirectHome}/>
            </Switch>
        );
    }
}

export default App;
