import React, {Component} from 'react';
import {inject, observer} from "mobx-react";

class Logs extends Component {

    componentDidUpdate(prevProps, prevState, snapshot) {
        const div = this.refs.logs;
        div.scrollTop = div.scrollHeight;
    }

    componentDidMount() {
        const div = this.refs.logs;
        div.scrollTop = div.scrollHeight;
    }

    render() {
        return (
            <div ref="logs" className="logs-tab">
                {this.props.store.game.logs.length === 0 && (
                    <div>No actions yet...</div>
                )}
                {this.props.store.game.logs.map((log, i) => {
                    let date = new Date(log.time).toLocaleString();
                    date = date.slice(0, -6) + date.slice(-3, date.length);
                    return (
                        <div key={i}>
                            {date}: {log.log}
                        </div>
                    )
                })}
            </div>
        );
    }
}

export default inject("store")(observer(Logs));