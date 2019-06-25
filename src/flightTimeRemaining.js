
export default function flightTimeRemainingFunc( remainingDistance, velocity ) {
    let time = remainingDistance / velocity;
    let radixPos = String( time ).indexOf( '.' );
    let decimalvalue = String( time ).slice( radixPos );

    let hours = Math.floor( time );
    let minutes = Math.round( decimalvalue * 60 );

    return [ hours, minutes ];
}
