
export default function distanceBetweenAirportsFunc( lat1, lon1, lat2, lon2 ) {
    const radius = 3959; //miles

    let dlat = ( lat2 - lat1 ) * Math.PI / 180;
    let dlon = ( lon2 - lon1 ) * Math.PI / 180;

    let a = Math.sin( dlat / 2 ) * Math.sin( dlat / 2 ) + Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) * Math.sin( dlon / 2 ) * Math.sin( dlon / 2 );
    let c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    let d = radius * c;

    return Math.round( d );
}
