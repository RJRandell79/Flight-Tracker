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
                altitude: props.flight[ 1 ] + 'ft',
                speed: props.flight[ 2 ] + 'mph'
            }
        })
    }

    render() {
        return(
            <div className="flightdata">
                <p>Flight Number: { this.state.flight.callsign }</p>
                <p className="airline">Airline:</p>
                <hr />

                <div className="origindestination">
                    <p>From:</p>
                    <p>To:</p>
                </div>
                <hr />

                <p>Calibrated altitude: { this.state.flight.altitude }</p>
                <p>Ground speed: { this.state.flight.speed }</p>
            </div>
        )
    }
}

export default FlightData;
