import React from 'react';
import Chart from './chart';
import Input from './input';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      has_entered: false,
      gamecode: '',
      bingo_data: []
    }

    this.updateBingoData = this.updateBingoData.bind(this);
    this.updateGameCode = this.updateGameCode.bind(this);
    this.startGame = this.startGame.bind(this);
    
  }

  updateBingoData = (newData) => {
    this.setState({bingo_data: newData});
  }

  updateGameCode = (newValue) => { 
    this.setState({gamecode: newValue});
  }

  startGame = () => {
    this.setState({bingo_data: this.createArray()});
    this.setState({has_entered: true});
  }


  render() {
    if (this.state.has_entered) {
      return (
          <div className="App">
          <h1> Chat Bingo </h1>
          <Chart game_code={this.state.gamecode} bingo_data={this.state.bingo_data}/>
        </div>
      );
    } else {
      return (
        <div className="App">
        <h1> Chat Bingo </h1>
        <Input BingoFunction={this.updateBingoData} GameCodeFunction={this.updateGameCode} start={this.startGame}/>
      </div>
    );
    }
    
  }

  createArray = () => {
  
    let game_code_length = this.state.gamecode.length;
  
    var rnd = generator(game_code_length);
  
    let bingo_cells = [];

    console.log(this.state.bingo_data);
  
    let i = 0;
    for (i = 0; i< 25; i++) {
      let current = Math.floor(rnd() * 50);
      console.log(current);
      bingo_cells.push(this.state.bingo_data[current]);
    }
  
   return bingo_cells;
  
  }
  
}

function generator(seed) {
  var m = 25;
  var a = 11;
  var c = 17;

  var z = seed;
  return function() {
      z = (a * z + c) % m;
      return z/m;
  };
}



export default App;


