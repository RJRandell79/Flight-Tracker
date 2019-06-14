import React, { Component } from 'react';
import './FlightData.css';

class FlightData extends Component {

    state = {
        flight: {
            callsign: 'N/A',
            altitude: 'n/a',
            speed: 'n/a'
        }
    }

    componentWillReceiveProps( props ) {
        this.setState({
            flight: {
                callsign: props.flight[ 0 ],
                altitude: props.flight[ 1 ],
                speed: props.flight[ 2 ]
            }
        })
    }

    render() {
        return(
            <div className="flightdata">
                <p>Flight Number: { this.state.flight.callsign === undefined ? 'N/A' : this.state.flight.callsign }</p>
                <p className="airline">Airline: n/a</p>
                <hr />

                <div className="origindestination">
                    <p>From: n/a</p>
                    <p>To: n/a</p>
                </div>
                <hr />

                <p>Calibrated altitude: { this.state.flight.altitude === undefined ? 'n/a' : this.state.flight.altitude + 'ft' }</p>
                <p>Ground speed: { this.state.flight.speed === undefined ? 'n/a' : this.state.flight.speed + 'mph' }</p>
            </div>
        )
    }
}

export default FlightData;
