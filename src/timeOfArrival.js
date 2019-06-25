
export default function timeOfArrivalFunc( hours, minutes, timedifference, timezone ) {
    let hoursMs = hours * 3.6e+6;
    let minutesMs = minutes * 60000;
    let timeLeft = hoursMs + minutesMs;

    let date = new Date();
    let timenow = date.getTime();

    let milliseconds = Math.abs( 3.6e+6 * timedifference );
    let arrivaltime = 0;

    if( parseInt( timedifference ) < 0 ) {
        arrivaltime = timeLeft + ( timenow - milliseconds );
    } else {
        arrivaltime = timeLeft + ( timenow + milliseconds );
    }

    let arriving = new Date( arrivaltime );
    let arrivalDay = arriving.getDay();
    let arrivalDate = arriving.getDate();
    let arrivalHour = arriving.getHours();
    let arrivalMinutes = arriving.getMinutes();

    let day, dateSuffix = '';

    switch( arrivalDay ) {
        case 0 : day = 'Sunday'; break;
        case 1 : day = 'Monday'; break;
        case 2 : day = 'Tuesday'; break;
        case 3 : day = 'Wednesday'; break;
        case 4 : day = 'Thursday'; break;
        case 5 : day = 'Friday'; break;
        case 6 : day = 'Saturday'; break;
        default: day = '';
    }

    switch( arrivalDate ) {
        case '1' :
        case '21' :
        case '31' : dateSuffix = 'st'; break;
        case '2' :
        case '22' : dateSuffix = 'nd'; break;
        case '3' :
        case '23' : dateSuffix = 'rd'; break;
        default : dateSuffix = 'th';
    }

    return day + ' ' + arrivalDate + dateSuffix + ', ' + arrivalHour + ':' + arrivalMinutes + ' (' + timezone + ')';
}
