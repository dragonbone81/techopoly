import React, {Component} from 'react';

class Card extends Component {
    render() {
        let className = "";
        if (this.props.vertical) {
            className = "game-tile vertical";
        } else {
            className = "game-tile";
        }
        if (this.props.edge) {
            className = "game-tile edge";
        }
        return (
            <div className={className}>
                Card
            </div>
        );
    }
}

export default Card;
