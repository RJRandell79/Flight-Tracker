/* Original base code: https://github.com/Swizec/webgl-airplanes-map/tree/master/src */

import React, { Component } from 'react';
import './App.css';
import DeckGL, { IconLayer, TextLayer } from 'deck.gl';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';
import Base64 from 'base-64';
import { CONFIG } from './config.js';

import FlightData from './FlightData';

import Airplane from './airplane-icon.png';
import destinationPoint from './destinationPoint.js';

const MAPBOX_ACCESS_TOKEN = CONFIG.mapboxapikey;
const MAPBOX_STYLE = "mapbox://styles/robrandell/cj9jtcr56024l2rrxpdxuxmnf";
const OPENSKY_USERNAME = CONFIG.openskyusername;
const OPENSKY_PASSWORD = CONFIG.openskypassword;

const initialViewState = {
    longitude: -2.2936,
    latitude: 54.496953,
    zoom: 5,
    pitch: 0,
    bearing: 0
}

class App extends Component {
    state = {
        airplanes: [],
        flightinfo: [],
        aircraft: [],
        isSearching: false,
    };
    currentFrame = null;
    timer = null;
    fetchEverySeconds = 6;
    framesPerFetch = this.fetchEverySeconds * 30;

    getFlightRoute = ( callsign ) => {
        this.setState({
            isSearching: true
        });

        let data = { call: callsign }

        fetch( 'http://dev.heckfordclients.co.uk/flighttracker/routes.php', {
            method: 'POST',
            body: JSON.stringify( data )
        }).then( ( response ) => {
            return response.json()
        }).then( ( json ) => {
            this.setState({
                isSearching: false
            });
            console.log( json[ 'route found' ][ 1 ] )
        });
    }

    searchAircraftData = ({ icao, callsign, altitude, velocity }) => {

        this.setState({
            flightinfo: {
                callsign,
                altitude,
                velocity
            },
            isSearching: true
        });

        let data = { icao: icao }

        fetch( 'http://dev.heckfordclients.co.uk/flighttracker/search.php', {
            method: 'POST',
            body: JSON.stringify( data )
        }).then( ( response ) => {
            return response.json()
        }).then( ( json ) => {
            if( json[ 'found' ][ 4 ] !== '' && json[ 'found' ][ 13 ] !== '' ) {
                this.setState({
                    flightinfo: {
                        callsign,
                        altitude,
                        velocity,
                        airline: json[ 'found' ][ 13 ],
                        model: json[ 'found' ][ 4 ]
                    },
                    isSearching: false
                });
            } else {
                alert( 'Flight information not found' );
            }
        });

        this.getFlightRoute( callsign );
    }

    animationFrame = () => {
        let { airplanes } = this.state;
        airplanes = airplanes.map( d => {
            const [ longitude, latitude ] = d.interpolatePos(
                this.currentFrame / this.framesPerFetch
            );
            return {
                ...d, longitude, latitude
            };
        });
        this.currentFrame += 1;
        this.setState({ airplanes });
    }

    startAnimation = () => {
        if( this.timer ) {
            this.timer.stop();
        }
        this.currentFrame = 0;
        this.timer = d3.timer( this.animationFrame );
    };

    validateCallsign = ( callsign ) => {
        if( callsign === '' || callsign === undefined ) {
            return 'FLIGHT NO. NOT AVAILABLE';
        } else {
            return callsign;
        }
    }

    convertToMPH = ( metrespersecond ) => {
        return Math.round( metrespersecond * 2.237 );
    }
    convertoFeet = ( metres ) => {
        return Math.round( metres * 3.281 );
    }

    fetchData = () => {
        d3.json( 'https://opensky-network.org/api/states/all?lamin=49.9289&lomin=-7.5062&lamax=58.589&lomax=1.6226', {
            headers: new Headers({
                'Authorization': `Basic ${Base64.encode(`${OPENSKY_USERNAME}:${OPENSKY_PASSWORD}`)}`
            }),
        }).then(
            ({ states }) => this.setState({
                airplanes: states.map( d => ({
                    icao: d[ 0 ],
                    callsign: this.validateCallsign( d[ 1 ] ),
                    last_contact: d[ 4 ],
                    longitude: d[ 5 ],
                    latitude: d[ 6 ],
                    velocity: this.convertToMPH( d[ 9 ] ),
                    origin_country: d[ 2 ],
                    true_track: Math.round( d[ 10 ] ),
                    altitude: this.convertoFeet( d[ 7 ] ),
                    interpolatePos: d3.geoInterpolate(
                        [ d[ 5 ], d[ 6 ] ],
                        destinationPoint( d[ 5 ], d[ 6 ], d[ 9 ] * this.fetchEverySeconds, d[ 10 ] )
                    )
                }))
            }, () => {
                this.startAnimation();
                setTimeout(
                    this.fetchData, this.fetchEverySeconds * 1000
                );
            })
        );
    };

    render() {
        const layers = [
            new IconLayer({
                id: 'airplanes',
                data: this.state.airplanes,
                pickable: true,
                onClick: ( info, event ) => this.searchAircraftData( info.object ),
                iconAtlas: Airplane,
                iconMapping: {
                    airplane: {
                        x: 0,
                        y: 0,
                        width: 512,
                        height: 512
                    }
                },
                sizeScale: 20,
                getPosition: d => [ d.longitude, d.latitude ],
                getIcon: d => 'airplane',
                getAngle: d => -d.true_track
            }),
            new TextLayer({
                id: 'callsigns',
                data: this.state.airplanes,
                getPosition: d => [ d.longitude, d.latitude ],
                getText: d => `${ d.callsign }`,
                getAngle: 0,
                getColor: [ 0, 225, 0, 255 ],
                getTextAnchor: 'start',
                getSize: 18,
                fontFamily: 'Monaco, monospace',
                fontWeight: 700,
                getPixelOffset: [ 25, 0 ]
            }),
            new TextLayer({
                id: 'airspeed',
                data: this.state.airplanes,
                getPosition: d => [ d.longitude, d.latitude ],
                getText: d => `Airspeed: ${ d.velocity }mph`,
                getAngle: 0,
                getColor: [ 0, 225, 0, 255 ],
                getTextAnchor: 'start',
                getSize: 12,
                fontFamily: 'Monaco, monospace',
                fontWeight: 400,
                getPixelOffset: [ 25, 18 ]
            }),
            new TextLayer({
                id: 'bearing',
                data: this.state.airplanes,
                getPosition: d => [ d.longitude, d.latitude ],
                getText: d => `Bearing: ${ d.true_track }deg`,
                getAngle: 0,
                getColor: [ 0, 225, 0, 255 ],
                getTextAnchor: 'start',
                getSize: 12,
                fontFamily: 'Monaco, monospace',
                fontWeight: 400,
                getPixelOffset: [ 25, 34 ]
            }),
            new TextLayer({
                id: 'altitude',
                data: this.state.airplanes,
                getPosition: d => [ d.longitude, d.latitude ],
                getText: d => `Altitude: ${ d.altitude }ft`,
                getAngle: 0,
                getColor: [ 0, 225, 0, 255 ],
                getTextAnchor: 'start',
                getSize: 12,
                fontFamily: 'Monaco, monospace',
                fontWeight: 400,
                getPixelOffset: [ 25, 50 ]
            })
        ];

        return(
            <div className="flights-container">
                <DeckGL initialViewState = { initialViewState } controller = { true } layers = { layers } onClick={ this._onClick }>
                    <StaticMap mapboxApiAccessToken = { MAPBOX_ACCESS_TOKEN } mapStyle = { MAPBOX_STYLE } />
                </DeckGL>

                <FlightData flight = { this.state.flightinfo } searching = { this.state.isSearching } />
            </div>
        );
    }

    componentDidMount() {
        this.fetchData();
    }

}

export default App;
