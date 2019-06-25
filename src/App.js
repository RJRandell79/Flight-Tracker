/* Original base code: https://github.com/Swizec/webgl-airplanes-map/tree/master/src */

import React, { Component } from 'react';
import './App.css';
import DeckGL, { IconLayer, TextLayer, LineLayer } from 'deck.gl';
import { MapboxLayer } from '@deck.gl/mapbox';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';
import Base64 from 'base-64';
import { CONFIG } from './config.js';

import FlightData from './FlightData';

import Airplane from './airplane-icon.png';
import destinationPoint from './destinationPoint.js';
import timeOfArrivalFunc from './timeOfArrival.js';
import distanceToGoFunc from './distanceToGo.js';
import distanceBetweenAirportsFunc from './distanceBetweenAirports.js';
import flightTimeRemainingFunc from './flightTimeRemaining.js';

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
        origingps: null,
        destination: null,
        destinationgps: null,
        distance: 0,
        milesToGo: 0,
        hoursToGo: 0,
        timeOfArrival: '',
        isSearchingAir: false,
        isSearchingRoute: false
    };
    map = null;
    radius = 3959; //miles
    currentFrame = null;
    timer = null;
    fetchEverySeconds = 6;
    framesPerFetch = this.fetchEverySeconds * 30;

    _onMapLoad = () => {
        this.map = this._map;
    }

    _onWebGLInitialized = ( gl ) => {
        this.setState({ gl });
    }

    calcDistances = ( airportlocations, aircraftposition ) => {
        let lat1 = airportlocations.dest.destlat;
        let lat2 = airportlocations.org.orglat;
        let lon1 = airportlocations.dest.destlng;
        let lon2 = airportlocations.org.orglng;

        let planelat1 = aircraftposition.plane.lat;
        let planelon1 = aircraftposition.plane.lng;
        let planespeed = aircraftposition.plane.speed;

        let timedifference = airportlocations.dest.timedifference;
        let timezone = airportlocations.dest.timezone;

        let distanceBetweenPorts = distanceBetweenAirportsFunc( lat1, lon1, lat2, lon2 );
        let distanceToGo = distanceToGoFunc( lat1, lon1, planelat1, planelon1 );
        let hoursToGo = flightTimeRemainingFunc( distanceToGo, planespeed );
        let eta = timeOfArrivalFunc( hoursToGo[ 0 ], hoursToGo[ 1 ], timedifference, timezone );

        this.setState({
            distance: Math.round( 100 - ( ( distanceToGo / distanceBetweenPorts ) * 100 ) ),
            milesToGo: Math.round( distanceToGo ),
            hoursToGo: hoursToGo[ 0 ] + ' hrs, ' + hoursToGo[ 1 ] + ' mins',
            timeOfArrival: eta
        });
    }

    getFlightRoute = ( callsign, latitude, longitude, velocity ) => {
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
            this.searchAirports( json[ 'route found' ][ 1 ], latitude, longitude, velocity );
        });
    }

    searchAirports = ( str, latitude, longitude, velocity ) => {

        let airports = str.split( '-' );
        let data = { origin: airports[ 0 ], dest: airports[ 1 ] }

        let doneRoute = this.map.getLayer( 'flightpathdone' );
        let togoRoute = this.map.getLayer( 'flightpathtogo' );

        if( typeof togoRoute !== 'undefined' ) {
            this.map.removeLayer( 'flightpathtogo' );
        }
        if( typeof doneRoute !== 'undefined' ) {
            this.map.removeLayer( 'flightpathdone' );
        }

        fetch( 'http://dev.heckfordclients.co.uk/flighttracker/airports.php', {
            method: 'POST',
            body: JSON.stringify( data )
        }).then( ( response ) => {
            return response.json()
        }).then( ( json ) => {
            this.setState({
                origin: json[ 'org' ][ 1 ],
                origingps: [ json[ 'org' ][ 6 ], json[ 'org' ][ 7 ] ],
                destination: json[ 'dest' ][ 1 ],
                destinationgps: [ json[ 'dest' ][ 6 ], json[ 'dest' ][ 7 ] ],
                isSearchingRoute: false
            });
            this.calcDistances( { org: { orglat: json[ 'org' ][ 6 ], orglng: json[ 'org' ][ 7 ] }, dest: { destlat: json[ 'dest' ][ 6 ], destlng: json[ 'dest' ][ 7 ], timedifference: json[ 'dest' ][ 9 ], timezone: json[ 'dest' ][ 11 ] } }, { plane: { lat: latitude, lng: longitude, speed: velocity } } );

            const flightpathToGo = new MapboxLayer({
                id: 'flightpathtogo',
                type: LineLayer,
                data: [{
                    from: { position: [ longitude, latitude ] },
                    to: { position: [ +json[ 'dest' ][ 7 ], +json[ 'dest' ][ 6 ] ] }
                }],
                getSourcePosition: d => d.from.position,
                getTargetPosition: d => d.to.position,
                getWidth: 2,
                getColor: [ 0, 255, 0 ]
            });

            const flightpathDone = new MapboxLayer({
                id: 'flightpathdone',
                type: LineLayer,
                data: [{
                    from: { position: [ +json[ 'org' ][ 7 ], +json[ 'org' ][ 6 ] ] },
                    to: { position: [ longitude, latitude ] }
                }],
                getSourcePosition: d => d.from.position,
                getTargetPosition: d => d.to.position,
                getWidth: 2,
                getColor: [ 0, 255, 0 ]
            });

            this.map.addLayer( flightpathToGo );
            this.map.addLayer( flightpathDone );

            flightpathToGo.setProps({
                getColor: [ 0, 0, 255 ]
            });
            flightpathDone.setProps({
                getColor: [ 255, 0, 0 ]
            })
        });
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

        this.getFlightRoute( callsign, latitude, longitude, velocity );
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
        const { gl } = this.state;
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
                <DeckGL ref = { ref => { this._deck = ref && ref.deck } } initialViewState = { initialViewState } controller = { true } layers = { layers } onClick={ this._onClick } onWebGLInitialized = { this._onWebGLInitialized }>
                { gl && (
                    <StaticMap ref = { ref => { this._map = ref && ref.getMap(); } } mapboxApiAccessToken = { MAPBOX_ACCESS_TOKEN } mapStyle = { MAPBOX_STYLE } onLoad = { this._onMapLoad } />
                )}
                </DeckGL>

                <FlightData flight = { this.state.flightinfo } searchingair = { this.state.isSearchingAir } searchingroute = { this.state.isSearchingRoute } origin = { this.state.origin } destination = { this.state.destination } widthpercentage = { this.state.distance } hourstogo = { this.state.hoursToGo } eta = { this.state.timeOfArrival } mileage = { this.state.milesToGo } />
            </div>
        );
    }

    componentDidMount() {
        this.fetchData();
    }

}

export default App;
