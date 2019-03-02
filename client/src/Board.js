import React, {Component} from 'react';
import Card from "./Card";
import MainView from "./MainView";
import "./App.css";

class Board extends Component {
    render() {
        return (
            <div className="d-flex flex-column main-box">
                <div className="d-flex flex-row">
                    <Card position={20}/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                </div>
                <MainView/>
                <div className="main-row-here d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Card/>
                    <Card/>
                </div>
                <div className="d-flex flex-row">
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card position={0}/>
                </div>
            </div>
        );
    }
}

export default Board;
