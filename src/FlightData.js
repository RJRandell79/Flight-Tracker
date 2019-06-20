import React, { Component } from 'react';
import './FlightData.css';

class FlightData extends Component {

    render() {
        const { callsign, airline, model, altitude, velocity } = this.props.flight;
        const searchingData = this.props.searchingair;
        const searchingRoute = this.props.searchingroute;

        return(
            <div className="flightdata">
                <p>Flight Number: { callsign === undefined ? 'N/A' : callsign }</p>
                <p className="airline">Airline: { ( airline === undefined || airline === '' ) ? 'N/A' : airline }</p>
                <p className="model">Aircraft: { ( model === undefined || model === '' ) ? 'N/A' : model }</p>
                <hr />

                <div className="origindestination">
                    <p>From: n/a</p>
                    <p>To: n/a</p>
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
