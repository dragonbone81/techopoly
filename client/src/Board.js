import React, {Component} from 'react';
import Card from "./Card";
import MainView from "./MainView";
import "./App.css";

class Board extends Component {
    render() {
        return (
            <div className="d-flex flex-column main-box">
                <div className="d-flex flex-row">
                    <Card edge={true}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card edge={true}/>
                </div>
                <MainView/>
                <div className="main-row-here d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card vertical={true}/>
                    <Card vertical={true}/>
                </div>
                <div className="d-flex flex-row">
                    <Card edge={true}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card vertical={false}/>
                    <Card edge={true}/>
                </div>
                {/*<div className="d-flex flex-row">*/}
                {/*<Card vertical={true}/>*/}
                {/*<Card vertical={true}/>*/}
                {/*<Card vertical={true}/>*/}
                {/*<Card vertical={true}/>*/}
                {/*<Card vertical={true}/>*/}
                {/*</div>*/}
                {/*<div className="d-flex flex-column">*/}
                {/*/!*<Card edge={true}/>*!/*/}
                {/*<Card vertical={false}/>*/}
                {/*<MainView/>*/}
                {/*<Card vertical={false}/>*/}
                {/*</div>*/}
                {/*<div className="d-flex flex-column">*/}
                {/*/!*<Card edge={true}/>*!/*/}
                {/*<Card vertical={false}/>*/}
                {/*/!*<MainView/>*!/*/}
                {/*<Card vertical={false}/>*/}
                {/*</div>*/}
                {/*<div className="d-flex flex-row">*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*<Card/>*/}
                {/*</div>*/}
                {/*<div className="d-flex flex-row">*/}
                {/*<Card/>*/}
                {/*<MainView/>*/}
                {/*<Card/>*/}
                {/*</div>*/}
                {/*<div className="d-flex flex-row">*/}
                {/*</div>*/}
            </div>
        );
    }
}

export default Board;
