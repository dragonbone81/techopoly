import React, {Component} from 'react';
import Card from "./Card";
import MainView from "./middleScreen/MainView";
import "./App.css";
import {inject, observer} from "mobx-react";
import {withRouter} from 'react-router-dom';

class Board extends Component {
    componentDidMount() {
        let gameInfo = localStorage.getItem("previous_game");
        if (!gameInfo) {
            this.props.history.push("/start");
            return;
        }
        gameInfo = JSON.parse(gameInfo);
        this.props.store.setGameAuthInfo(gameInfo);
        this.props.store.connectToGame();
    }

    render() {
        return (
            this.props.store.inGame ? <div
                    style={{outline: `2px solid ${this.props.store.getPlayer.state !== "NOT_TURN" ? "#61c86a" : "#c8464b"}`}}
                    className="d-flex flex-column main-box">
                    <MainView/>
                    <div className="d-flex flex-row">
                        <Card position={20}/>
                        <Card bottom={true} position={21}/>
                        <div/>
                        <Card bottom={true} position={22}/>
                        <div/>
                        <Card bottom={true} position={23}/>
                        <Card bottom={true} position={24}/>
                        <Card bottom={true} position={25}/>
                        <Card bottom={true} position={26}/>
                        <Card bottom={true} position={27}/>
                        <Card bottom={true} position={28}/>
                        <Card bottom={true} position={29}/>
                        <Card position={30}/>
                    </div>
                    <div className="main-row-here d-flex flex-row justify-content-between">
                        <Card right={true} position={19}/>
                        <Card left={true} position={31}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card right={true} position={18}/>
                        <Card left={true} position={32}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card right={true} position={17}/>
                        <Card left={true} position={33}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card right={true} position={16}/>
                        <Card left={true} position={34}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card right={true} position={15}/>
                        <Card left={true} position={35}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card right={true} position={14}/>
                        <Card left={true} position={36}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card right={true} position={13}/>
                        <Card left={true} position={37}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card right={true} position={12}/>
                        <Card left={true} position={38}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card right={true} position={11}/>
                        <Card left={true} position={39}/>
                    </div>
                    <div className="d-flex flex-row">
                        <Card position={10}/>
                        <Card top={true} position={9}/>
                        <Card top={true} position={8}/>
                        <Card top={true} position={7}/>
                        <Card top={true} position={6}/>
                        <Card top={true} position={5}/>
                        <Card top={true} position={4}/>
                        <Card top={true} position={3}/>
                        <Card top={true} position={2}/>
                        <Card top={true} position={1}/>
                        <Card position={0}/>
                    </div>
                </div>
                :
                <div style={{margin: "auto", textAlign: "center", fontSize: 80}}><i
                    className="fas fa-spinner  fa-spin"/></div>
        );
    }
}

export default withRouter(inject("store")(observer(Board)));
