import React, { Component } from 'react';
import './FlightData.css';

class FlightData extends Component {

    render() {
        const { callsign, airline, model, altitude, velocity } = this.props.flight;
        const searchingData = this.props.searchingair;
        const searchingRoute = this.props.searchingroute;
        const origin = this.props.origin;
        const destination = this.props.destination;
        const widthPercentage = this.props.widthpercentage;
        const milesToGo = this.props.mileage;
        const hoursToGo = this.props.hourstogo;
        const timeOfArrival = this.props.eta;

        return(
            <div className="flightdata">
                <p>{ callsign === undefined ? 'Flight No.: N/A' : callsign }</p>
                <p className="airline">Airline: { ( airline === undefined || airline === '' ) ? 'N/A' : airline }</p>
                <p className="model">Aircraft: { ( model === undefined || model === '' ) ? 'N/A' : model }</p>
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
                { searchingData ? <p className="count">Searching airlines/aircraft...</p> : null }
                { searchingRoute ? <p className="count">Searching route...</p> : null }
            </div>
        )
    }
}

export default FlightData;
