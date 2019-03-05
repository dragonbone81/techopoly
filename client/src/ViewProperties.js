import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';

class ViewProperties extends Component {
    render() {
        return (
            <div className="props d-flex flex-column">
                <u>My Properties:</u>
                <div className="d-flex flex-row justify-content-between">
                    <div>Name</div>
                    <div>Fund</div>
                    <div>Mortgage</div>
                </div>

                <div className="d-flex flex-column">{this.props.store.playersProperties.map(property => {
                    return (
                        <div className="d-flex flex-row justify-content-between">
                            <div>{property.name}</div>
                            <div>
                                <button>+</button>
                                /
                                <button>-</button>
                            </div>
                            <div>{!property.mortaged ?
                                <button onClick={() => this.props.store.mortgageProp(property.id)}>mortgage</button>
                                :
                                <button onClick={() => this.props.store.mortgageProp(property.id)}>unmortgage</button>
                            }</div>
                        </div>
                    )
                })}</div>
            </div>
        );
    }
}

export default inject("store")(observer(ViewProperties));
