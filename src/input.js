import React from 'react';
import './bingo.css';


class Input extends React.Component {
    constructor (props) {
        super(props);
        this.updateData = this.updateData.bind(this);
    }

    updateData = (event) => {
        this.props.start();
    }

    updateGameCode = (event) => {
        this.props.GameCodeFunction(event.target.value);
    }

    updateBingoData = (event) => {
        this.props.BingoFunction(event.target.value.split('\n'));
    }



    render() {
        return (
            <div className='c_board'>
                
           
                <div className='container-fluid'>
      
                    <p> Do you have a game code? </p>
      
                    <p> Enter below </p>
      
                </div>
      
                <div className='input-group'>
                    <div className="input-group-prepend">
                        <span className="input-group-text">Game Code</span>
                    </div>
                <input type="text" className='input-group-lg' onChange={this.updateGameCode}/>
            </div>
      
            <div className='input-group'> 
                <label> Please enter bingo entries </label>
                <textarea className='form-control-file' onChange={this.updateBingoData}></textarea>
      
            </div>
      
            <div className='container-fluid'>
                <input type='button' value='Go' className='btn' onClick={this.updateData}/>
            </div>
          </div>
        );
    }


}

export default Input;

