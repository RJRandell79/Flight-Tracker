<?php
    header( 'Access-Control-Allow-Origin:*' );
    date_default_timezone_set( 'Europe/London' );

    $rest_json = file_get_contents( 'php://input' );
    $ports = json_decode( $rest_json, true );

    $org = '';
    $dest = '';

    if( ( $fp = fopen( 'airports.csv', 'r' ) ) !== false && $ports[ 'origin' ] && $ports[ 'dest' ] ) :
        while( ( $row = fgetcsv( $fp ) ) !== false ) :
            if( $row[ 5 ] === $ports[ 'origin' ] ) :
                $org = $row;
            endif;

            if( $row[ 5 ] === $ports[ 'dest' ] ) :
                $dest = $row;
            endif;
        endwhile;

        fclose( $fp );

        if( $dest !== '' && $org !== '' ) :
            echo json_encode( array( 'org' => $org, 'dest' => $dest ) );
        else :
            echo json_encode( array( 'org' => 'airport not found', 'dest' => 'airport not found' ) );
        endif;

    else :
        echo json_encode( array( 'error' => 'File failed to open' ) );
    endif;

?>
