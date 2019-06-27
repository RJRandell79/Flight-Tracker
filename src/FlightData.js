import React, { Component } from 'react';
import './FlightData.css';
import AircraftImage from './aircraftImage.js';

class FlightData extends Component {

    setTempBar = ( temp ) => {
        let percentage = ( temp / 100 ) * 100;
        let barStyle;

        if( temp < 0 ) {
            barStyle = { width: Math.abs( percentage ) + '%',  transform: `translateX( -100% )`, background: `#00F` }
        } else {
            barStyle = { width: percentage + '%',  transform: `translateX( 0 )` }
        }
        return barStyle;
    }

    render() {
        const { callsign, airline, model, altitude, velocity } = this.props.flight;
        const aircraftImage = this.props.aircraftimage;
        const searchingData = this.props.searchingair;
        const searchingRoute = this.props.searchingroute;
        const origin = this.props.origin;
        const destination = this.props.destination;
        const widthPercentage = this.props.widthpercentage;
        const milesToGo = this.props.mileage;
        const hoursToGo = this.props.hourstogo;
        const timeOfArrival = this.props.eta;
        const weather = this.props.weather;

        return(
            <div className="flightdata">
                <div className="flightinfo-container">
                    <div className="flightinfo">
                        <p>{ callsign === undefined ? 'Flight No.: N/A' : callsign }</p>
                        <p className="airline">Airline: { ( airline === undefined || airline === '' ) ? 'N/A' : airline }</p>
                        <p className="model">Aircraft: { ( model === undefined || model === '' ) ? 'N/A' : model }</p>
                    </div>
                    <AircraftImage image = { aircraftImage } />
                </div>
                <hr />

                <div className="origin">
                    <p>From: { ( origin === undefined || origin === '' ) ? 'N/A' : origin }</p>
                    <p>To: { ( destination === undefined || destination === '' ) ? 'N/A' : destination }</p>
                </div>
                <div className="graph">
                    <span className="distance" style={{ width: widthPercentage + '%' }}></span>
                </div>
                <div className="destination">
                    <p className="miles">Distance left: { ( milesToGo === undefined || milesToGo === 0 ) ? 'N/A' : milesToGo + ' miles' } </p>
                    <p>Flight time remaining: { ( hoursToGo === undefined || hoursToGo === 0 ? 'N/A' : hoursToGo ) }</p>
                    <p>ETA (local time): { ( timeOfArrival === undefined || timeOfArrival === '' ? 'N/A' : timeOfArrival ) }</p>
                </div>
                <hr />

                <p>Calibrated altitude: { altitude === undefined ? 'n/a' : altitude + 'ft' }</p>
                <p>Ground speed: { velocity === undefined ? 'n/a' : velocity + 'mph' }</p>
                <hr />

                <div className="weather-console">
                    <div class="ground">
                        <p>Ground temperature:</p>
                        <p>{ ( weather.temp === undefined || weather.temp === '' ) ? 'N/A' : weather.temp + 'ºC' }</p>
                    </div>

                    <div className="temperature">
                        <div className="graph">
                            <span className="bar" style={ this.setTempBar( weather.temp ) }></span>
                            <span className="divider"></span>
                        </div>
                        <div className="labels">
                            <p>-60ºC</p>
                            <p className="center-text">0ºC</p>
                            <p>60ºC</p>
                        </div>
                    </div>

                    <div class="air">
                        <p>Air temperature:</p>
                        <p>{ ( weather.airtemp === undefined || weather.airtemp === '' ) ? 'N/A' : weather.airtemp + 'ºC at ' + altitude + 'ft' }</p>
                    </div>

                    <div className="temperature">
                        <div className="graph">
                            <span className="bar" style={ this.setTempBar( weather.airtemp ) }></span>
                            <span className="divider"></span>
                        </div>
                        <div className="labels">
                            <p>-60ºC</p>
                            <p className="center-text">0ºC</p>
                            <p>60ºC</p>
                        </div>
                    </div>


                    <div className="altitude">

                    </div>
                </div>

                <div className="weather">
                    <p>Icon: { ( weather.icon === undefined || weather.icon === '' ) ? 'N/A' : weather.icon }</p>
                    <p>Cloud cover: { ( weather.cloudcover === undefined || weather.cloudcover === '' ) ? 'N/A' : weather.cloudcover + '%' }</p>
                    <p>Wind speed: { ( weather.windspeed === undefined || weather.windspeed === '' ) ? 'N/A' : weather.windspeed + 'mph' }</p>
                    <p>Wind bearing: { ( weather.windbearing === undefined || weather.windbearing === '' ) ? 'N/A' : weather.windbearing + 'º' }</p>
                </div>
                <hr />

                { searchingData ? <p className="count">Searching airlines/aircraft...</p> : null }
                { searchingRoute ? <p className="count">Searching route...</p> : null }
            </div>
        )
    }
}

export default FlightData;
