import React, { Component } from 'react';
import './FlightData.css';

class FlightData extends Component {

    render() {
        const { callsign, airline, model, altitude, velocity } = this.props.flight;
        const datacount = this.props.datalength;

        return(
            <div className="flightdata">
                <p>Flight Number: { callsign === undefined ? 'N/A' : callsign }</p>
                <p className="airline">Airline: { airline === undefined ? 'N/A' : airline }</p>
                <p className="model">Aircraft: { model === undefined ? 'N/A' : model }</p>
                <hr />

                <div className="origindestination">
                    <p>From: n/a</p>
                    <p>To: n/a</p>
                </div>
                <hr />

                <p>Calibrated altitude: { altitude === undefined ? 'n/a' : altitude + 'ft' }</p>
                <p>Ground speed: { velocity === undefined ? 'n/a' : velocity + 'mph' }</p>
                <hr />
                <p className="count">{ datacount === 0 ? 'Data loading...' : datacount + ' aircraft loaded.' }</p>
            </div>
        )
    }
}

export default FlightData;
