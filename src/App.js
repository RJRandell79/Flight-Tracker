import React, { Component } from 'react';
import './App.css';
import DeckGL, { IconLayer } from 'deck.gl';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';

const MAPBOX_ACCESS_TOKEN = '';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
