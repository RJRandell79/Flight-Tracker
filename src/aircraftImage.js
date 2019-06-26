import React from 'react';
import images from './aircraftphotos/index';

const AircraftImage = ( props ) => (
    <div className="flightimage">
        <img src={ images[ props.image ] } alt="Aircraft photo" />
    </div>
);

export default AircraftImage;
