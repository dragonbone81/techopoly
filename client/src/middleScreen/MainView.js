import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import NavTabs from './NavTabs';
import MyInfoTab from './MyInfoTab';
import MyPropertiesTab from './MyPropertiesTab';
import Logs from './Logs';
import Actions from './Actions';
import PlayersTab from './PlayersTab';
import TradeTab from './TradeTab';
import TradesTab from './TradesTab';

class MainView extends Component {
    state = {
        dropdownExpanded: false,
        selectedTab: "trades",
        selectedPlayer: 1,
    };

    selectTab = (state) => {
        this.setState(state);
    };
    changeDropDown = (state) => {
        this.setState(state);
    };

    render() {
        return (
            <div className="main-view">
                {this.props.store.gameState !== "NOT_STARTED" &&
                <div className="main-view-content">
                    <NavTabs
                        dropdownExpanded={this.state.dropdownExpanded}
                        changeDropDown={this.changeDropDown}
                        selectTab={this.selectTab}
                        selectedTab={this.state.selectedTab}
                    />
                    {this.state.selectedTab === "my_info" && (
                        <>
                            <MyInfoTab/>
                            <Actions/>
                            <Logs/>
                        </>
                    )}
                    {this.state.selectedTab === "my_properties" && (
                        <MyPropertiesTab/>
                    )}
                    {this.state.selectedTab === "player_info" && (
                        <PlayersTab selectTab={this.selectTab} player={this.state.selectedPlayer}/>
                    )}
                    {this.state.selectedTab === "player_trade" && (
                        <TradeTab selectTab={this.selectTab} player={this.state.selectedPlayer}/>
                    )}
                    {this.state.selectedTab === "trades" && (
                        <TradesTab selectTab={this.selectTab} player={this.state.selectedPlayer}/>
                    )}
                </div>
                }
            </div>
        );
    }
}

export default inject("store")(observer(MainView));


{/*{this.props.store.mousedOverTileInfo ?*/
}
{/*<div className="d-flex flex-column">*/
}
{/*<div>Owner: {this.props.store.mousedOverTileIDInfo.owned ? this.props.store.players[this.props.store.mousedOverTileIDInfo.player].username : "No Owner"}</div>*/
}
{/*<div>Company Name: {this.props.store.mousedOverTileInfo.name}</div>*/
}
{/*<div>{this.props.store.mousedOverTileInfo.cost ?*/
}
{/*<div>Company Cost: ${this.props.store.mousedOverTileInfo.cost}</div> : null}*/
}
{/*</div>*/
}
{/*<div>{this.props.store.mousedOverTileInfo.upgrade ?*/
}
{/*(*/
}
{/*<div>*/
}
{/*<div>Funding Rounds Cost: ${this.props.store.mousedOverTileInfo.upgrade}</div>*/
}
{/*<div>Rent Fee: ${this.props.store.mousedOverTileInfo.rent[0]}</div>*/
}
{/*<div>1st Round: ${this.props.store.mousedOverTileInfo.rent[1]}</div>*/
}
{/*<div>2nd Round: ${this.props.store.mousedOverTileInfo.rent[2]}</div>*/
}
{/*<div>3rd Round: ${this.props.store.mousedOverTileInfo.rent[3]}</div>*/
}
{/*<div>4th Round: ${this.props.store.mousedOverTileInfo.rent[4]}</div>*/
}
{/*<div>IPO: ${this.props.store.mousedOverTileInfo.rent[5]}</div>*/
}
{/*</div>*/
}
{/*)*/
}
{/*:*/
}
{/*null}*/
}
{/*</div>*/
}
{/*</div>*/
}
{/*:*/
}
{/*<div>*/
}
{/*{this.props.store.thisPlayersTurn && this.props.store.buyProcessStarted &&*/
}
{/*<div>*/
}
{/*<div>Buy Tile</div>*/
}
{/*<button onClick={() => this.props.store.buyPrompt(true)}>yes</button>*/
}
{/*<button onClick={() => this.props.store.buyPrompt(false)}>no</button>*/
}
{/*</div>*/
}
{/*}*/
}
{/*{this.props.store.thisPlayersTurn &&*/
}
{/*(this.props.store.turnState !== "BUY" ?*/
}
{/*<button type="button" onClick={this.props.store.rollAndMove}*/
}
{/*className="btn btn-primary">roll</button> : null)*/
}
{/*}*/
}
{/*{this.props.store.mainView === "properties" &&*/
}
{/*<ViewProperties/>*/
}
{/*}*/
}
{/*</div>*/
}
{/*}*/
}