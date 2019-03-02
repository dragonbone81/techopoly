import React, {Component} from 'react';
import Card from "./Card";
import MainView from "./MainView";
import "./App.css";
import {inject, observer} from "mobx-react";

class Board extends Component {
    render() {
        return (
            this.props.store.inGame ? <div className="d-flex flex-column main-box">
                    <MainView/>
                    <div className="d-flex flex-row">
                        <Card position={20}/>
                        <Card position={21}/>
                        <Card position={22}/>
                        <Card position={23}/>
                        <Card position={24}/>
                        <Card position={25}/>
                        <Card position={26}/>
                        <Card position={27}/>
                        <Card position={28}/>
                        <Card position={29}/>
                        <Card position={30}/>
                    </div>
                    <div className="main-row-here d-flex flex-row justify-content-between">
                        <Card position={19}/>
                        <Card position={31}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card position={18}/>
                        <Card position={32}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card position={17}/>
                        <Card position={33}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card position={16}/>
                        <Card position={34}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card position={15}/>
                        <Card position={35}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card position={14}/>
                        <Card position={36}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card position={13}/>
                        <Card position={37}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card position={12}/>
                        <Card position={38}/>
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                        <Card position={11}/>
                        <Card position={39}/>
                    </div>
                    <div className="d-flex flex-row">
                        <Card position={10}/>
                        <Card position={9}/>
                        <Card position={8}/>
                        <Card position={7}/>
                        <Card position={6}/>
                        <Card position={5}/>
                        <Card position={4}/>
                        <Card position={3}/>
                        <Card position={2}/>
                        <Card position={1}/>
                        <Card position={0}/>
                    </div>
                </div>
                :
                <div>Loading</div>
        );
    }
}

export default inject("store")(observer(Board));
