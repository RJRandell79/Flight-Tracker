
export default function distanceToGoFunc( lat1, lon1, planelat1, planelon1 ) {
    const radius = 3959; //miles

    let dlat = ( lat1 - planelat1 ) * Math.PI / 180;
    let dlon = ( lon1 - planelon1 ) * Math.PI / 180;

    let a = Math.sin( dlat / 2 ) * Math.sin( dlat / 2 ) + Math.cos( lat1 * Math.PI / 180 ) * Math.cos( planelat1 * Math.PI / 180 ) * Math.sin( dlon / 2 ) * Math.sin( dlon / 2 );
    let c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    let d = radius * c;

    return Math.round( d );
}
