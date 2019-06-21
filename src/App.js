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
        origin: null,
        destination: null,
        isSearchingAir: false,
        isSearchingRoute: false
    };
    radius = 6371;
    currentFrame = null;
    timer = null;
    fetchEverySeconds = 6;
    framesPerFetch = this.fetchEverySeconds * 30;

    distanceBetweenAirports = ( lat1, lon1, lat2, lon2 ) => {
        let dlat = ( lat2 - lat1 ) * Math.PI / 180;
        let dlon = ( lon2 - lon1 ) * Math.PI / 180;

        let a = Math.sin( dlat / 2 ) * Math.sin( dlat / 2 ) + Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) * Math.sin( dlon / 2 ) * Math.sin( dlon / 2 );
        let c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
        let d = this.radius * c;

        return Math.round( d );
    }

    distanceToGo = ( lat1, lon1, planelat1, planelon1 ) => {
        let dlat = ( lat1 - planelat1 ) * Math.PI / 180;
        let dlon = ( lon1 - planelon1 ) * Math.PI / 180;

        let a = Math.sin( dlat / 2 ) * Math.sin( dlat / 2 ) + Math.cos( lat1 * Math.PI / 180 ) * Math.cos( planelat1 * Math.PI / 180 ) * Math.sin( dlon / 2 ) * Math.sin( dlon / 2 );
        let c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
        let d = this.radius * c;

        return Math.round( d );
    }

    calcDistances = ( airportlocations, aircraftposition ) => {
        let lat1 = airportlocations.dest.destlat;
        let lat2 = airportlocations.org.orglat;
        let lon1 = airportlocations.dest.destlng;
        let lon2 = airportlocations.org.orglng;

        let planelat1 = aircraftposition.plane.lat;
        let planelon1 = aircraftposition.plane.lng;

        let distanceBetweenPorts = this.distanceBetweenAirports( lat1, lon1, lat2, lon2 );
        let distanceToGo = this.distanceToGo( lat1, lon1, planelat1, planelon1 );

        console.log( distanceBetweenPorts + ', ' + distanceToGo );
    }

    getFlightRoute = ( callsign, latitude, longitude ) => {
        this.setState({
            isSearchingRoute: true
        });

        let data = { call: callsign }

        fetch( 'http://dev.heckfordclients.co.uk/flighttracker/routes.php', {
            method: 'POST',
            body: JSON.stringify( data )
        }).then( ( response ) => {
            return response.json()
        }).then( ( json ) => {
            this.searchAirports( json[ 'route found' ][ 1 ], latitude, longitude );
        });
    }

    searchAirports = ( str, latitude, longitude ) => {
        let airports = str.split( '-' );
        let data = { origin: airports[ 0 ], dest: airports[ 1 ] }

        fetch( 'http://dev.heckfordclients.co.uk/flighttracker/airports.php', {
            method: 'POST',
            body: JSON.stringify( data )
        }).then( ( response ) => {
            return response.json()
        }).then( ( json ) => {
            this.setState({
                origin: json[ 'org' ][ 1 ],
                destination: json[ 'dest' ][ 1 ],
                isSearchingRoute: false
            });
            this.calcDistances( { org: { orglat: json[ 'org' ][ 6 ], orglng: json[ 'org' ][ 7 ] }, dest: { destlat: json[ 'dest' ][ 6 ], destlng: json[ 'dest' ][ 7 ] } }, { plane: { lat: latitude, lng: longitude } } );
        })
    }

    searchAircraftData = ({ icao, callsign, altitude, velocity, latitude, longitude }) => {

        this.setState({
            flightinfo: {
                callsign,
                altitude,
                velocity
            },
            isSearchingAir: true
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
                    isSearchingAir: false
                });
            } else {
                alert( 'Flight information not found' );
            }
        });

        this.getFlightRoute( callsign, latitude, longitude );
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

                <FlightData flight = { this.state.flightinfo } searchingair = { this.state.isSearchingAir } searchingroute = { this.state.isSearchingRoute } origin = { this.state.origin } destination = { this.state.destination } />
            </div>
        );
    }

    componentDidMount() {
        this.fetchData();
    }

}

export default App;
