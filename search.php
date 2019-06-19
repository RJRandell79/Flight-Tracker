<?php
    header( 'Access-Control-Allow-Origin:*' );
    date_default_timezone_set( 'Europe/London' );

    $rest_json = file_get_contents( 'php://input' );
    $icao = json_decode( $rest_json, true );

    if( ( $fp = fopen( 'aircraftDatabase.csv', 'r' ) ) !== false ) :
        while( ( $row = fgetcsv( $fp ) ) !== false ) :
            if( $row[ 0 ] === $icao[ 'icao' ] ) :
                echo json_encode( array( 'found' => $row ) );
                exit;
            endif;
        endwhile;

        fclose( $fp );
        echo json_encode( array( 'found' => 'No matches' ) );
    else :
        echo json_encode( array( 'found' => 'File failed to open' ) );
    endif;

?>
