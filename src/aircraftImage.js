import React from 'react';
import images from './aircraftphotos/index';

const AircraftImage = ( props ) => (
    <div className="flightimage">
        <img src={ ( images[ props.image ] === undefined || images[ props.image ] === '' ) ? images[ 'airplane-icon.png' ] : images[ props.image ] } />
    </div>
);

export default AircraftImage;
