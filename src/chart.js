import React from 'react';
import Cell from './cell';
import './bingo.css';


class Chart extends React.Component {
    render() {
        return (
            <div>
    <p> Game Code: {this.props.game_code}</p>
    <div className='row'>
        <Cell text={this.props.bingo_data[0]} />
        <Cell text={this.props.bingo_data[1]} />
        <Cell text={this.props.bingo_data[2]} />
        <Cell text={this.props.bingo_data[3]} />
        <Cell text={this.props.bingo_data[4]} />
    </div>

    <div className='row'>
        <Cell text={this.props.bingo_data[5]} />
        <Cell text={this.props.bingo_data[6]} />
        <Cell text={this.props.bingo_data[7]} />
        <Cell text={this.props.bingo_data[8]} />
        <Cell text={this.props.bingo_data[9]} />
    </div>

    <div className='row'>
        <Cell text={this.props.bingo_data[10]} />
        <Cell text={this.props.bingo_data[11]} />
        <Cell text={this.props.bingo_data[12]} />
        <Cell text={this.props.bingo_data[13]} />
        <Cell text={this.props.bingo_data[14]} />
    </div>

    <div className='row'>
        <Cell text={this.props.bingo_data[15]} />
        <Cell text={this.props.bingo_data[16]} />
        <Cell text={this.props.bingo_data[17]} />
        <Cell text={this.props.bingo_data[18]} />
        <Cell text={this.props.bingo_data[19]} />
    </div>

    <div className='row'>
        <Cell text={this.props.bingo_data[20]} />
        <Cell text={this.props.bingo_data[21]} />
        <Cell text={this.props.bingo_data[22]} />
        <Cell text={this.props.bingo_data[23]} />
        <Cell text={this.props.bingo_data[24]} />
    </div>
    </div>
        );
    }


}

export default Chart;




