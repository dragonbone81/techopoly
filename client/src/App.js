import React, {Component} from 'react';
import Board from "./Board"
import NewGame from "./NewGame"
import {Switch, Route} from 'react-router-dom';

class App extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/" component={
                    () => <div className="main">
                        <Board/>
                    </div>
                }/>
                <Route exact path="/newgame" component={NewGame}/>
                {/*<Route exact path="/redirect" component={Redirect}/>*/}
                {/*<Route exact path="/video/:video_id" component={VideoPage}/>*/}
            </Switch>
        );
    }
}

export default App;
