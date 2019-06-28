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

    setAltitude = ( height ) => {
        let percentage = ( height / 50000 ) * 100;
        let barStyle = { width: percentage + '%' }

        return barStyle;
    }

    setPercentage = ( value ) => {
        let percentage = ( value / 100 ) * 100;
        let barStyle = { width: percentage + '%' }

        return barStyle;
    }

    setSpeed = ( velocity ) => {
        let percentage = ( velocity / 750 ) * 100;
        let barStyle = { width: percentage + '%' }

        return barStyle;
    }

    setWindDirection = ( angle ) => {
        let rotation = { transform: `rotate( ${ angle }deg )` }

        return rotation;
    }

    setWindSpeed = ( speed ) => {
        let revolutions = ( 100 - speed ) / 5;
        let animation = { animation: `spin ${ revolutions }s linear infinite` }

        return animation;
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

                <div className="weather-console">
                    <div className="ground">
                        <p>Ground temperature:</p>
                        <p>{ ( weather.temp === undefined || weather.temp === '' ) ? 'N/A' : weather.temp + 'ºC' }</p>
                    </div>

                    <div className="temperature">
                        <div className="graph">
                            <span className="bar" style={ this.setTempBar( weather.temp ) }></span>
                            <span className="divider"></span>
                        </div>
                        <div className="labels">
                            <p>-50ºC</p>
                            <p className="center-text">0ºC</p>
                            <p>50ºC</p>
                        </div>
                    </div>

                    <div className="air">
                        <p>Air temperature:</p>
                        <p>{ ( weather.airtemp === undefined || weather.airtemp === '' ) ? 'N/A' : weather.airtemp + 'ºC at ' + altitude + 'ft' }</p>
                    </div>

                    <div className="temperature">
                        <div className="graph">
                            <span className="bar" style={ this.setTempBar( weather.airtemp ) }></span>
                            <span className="divider"></span>
                        </div>
                        <div className="labels">
                            <p>-50ºC</p>
                            <p className="center-text">0ºC</p>
                            <p>50ºC</p>
                        </div>
                    </div>

                    <div className="height">
                        <p>Altitude:</p>
                        <p>{ ( altitude === undefined || altitude === '' ) ? 'N/A' : altitude + 'ft' }</p>
                    </div>

                    <div className="altitude">
                        <div className="graph">
                            <span className="bar" style={ this.setAltitude( altitude ) }></span>
                        </div>
                        <div className="labels">
                            <p>0ft</p>
                            <p>50000ft</p>
                        </div>
                    </div>

                    <div className="cover">
                        <p>Cloud cover:</p>
                        <p>{ ( weather.cloudcover === undefined || weather.cloudcover === '' ) ? 'N/A' : weather.cloudcover + '%' }</p>
                    </div>

                    <div className="cloud">
                        <div className="graph">
                            <span className="bar" style={ this.setPercentage( weather.cloudcover ) }></span>
                        </div>
                        <div className="labels">
                            <p>0%</p>
                            <p>100%</p>
                        </div>
                    </div>

                    <div className="speed">
                        <p>Ground speed:</p>
                        <p>{ velocity === undefined ? 'n/a' : velocity + 'mph' }</p>
                    </div>

                    <div className="groundspeed">
                        <div className="graph">
                            <span className="bar" style={ this.setSpeed( velocity ) }></span>
                        </div>
                        <div className="labels">
                            <p>0mph</p>
                            <p>700mph</p>
                        </div>
                    </div>

                    <div className="weather-icons">
                        <div className="weather-label">
                            <p>Other information:</p>
                        </div>

                        <div className="icon">
                            <div className="image"></div>
                            <p>Icon: { ( weather.summary === undefined || weather.summary === '' ) ? 'N/A' : weather.summary }</p>
                        </div>
                        <div className="icon windbearing">
                            <div className="compass">
                                <div className="needle" style={ this.setWindDirection( weather.windbearing ) }></div>
                            </div>
                            <p>Wind bearing: { ( weather.windbearing === undefined || weather.windbearing === '' ) ? 'N/A' : weather.windbearing + 'º' }</p>
                        </div>
                        <div className="icon windspeed">
                            <div className="compass">
                                <div className="blades" style={ this.setWindSpeed( weather.windspeed ) }>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                            <p>Wind speed: { ( weather.windspeed === undefined || weather.windspeed === '' ) ? 'N/A' : weather.windspeed + 'mph' }</p>
                        </div>
                    </div>
                </div>
                <hr />

                { searchingData ? <p className="count">Searching airlines/aircraft...</p> : null }
                { searchingRoute ? <p className="count">Searching route...</p> : null }
            </div>
        )
    }
}

export default FlightData;
