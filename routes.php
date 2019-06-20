<?php
    header( 'Access-Control-Allow-Origin:*' );
    date_default_timezone_set( 'Europe/London' );

    $rest_json = file_get_contents( 'php://input' );
    $callsign = json_decode( $rest_json, true );

    if( ( $fp = fopen( 'flightRoutes.csv', 'r' ) ) !== false ) :
        while( ( $row = fgetcsv( $fp ) ) !== false ) :
            if( $row[ 0 ] === preg_replace( '/\s+/', '', $callsign[ 'call' ] ) ) :
                echo json_encode( array( 'route found' => $row ) );
                exit;
            endif;
        endwhile;

        fclose( $fp );
        echo json_encode( array( 'route found' => 'No matches' ) );
    else :
        echo json_encode( array( 'route found' => 'File failed to open' ) );
    endif;
?>
