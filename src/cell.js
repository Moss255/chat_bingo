import React from 'react';
import './bingo.css';


class Cell extends React.Component {
    constructor (props) {
        super(props);
        this.state =  {
            is_clicked: false
        };

        this.handleClick = this.handleClick.bind(this);

    }

    render() {
        if (this.state.is_clicked) {
            return <button onClick={this.handleClick} style={{backgroundColor: '#fae'}}>
                {this.props.text}
                </button>
        } else {
            return <button onClick={this.handleClick} style={{backgroundColor: '#aaa'}}>
                {this.props.text}
                </button>
        }
        // Render bingo cards
    }

    handleClick = (e) => {
        this.setState({is_clicked: !this.state.is_clicked});  
    }


}

export default Cell;
