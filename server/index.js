const path = require( "path" );
const express = require( "express" );
const cors = require( 'cors' )
const fs = require( 'fs' );
const fileUpload = require( 'express-fileupload' );

const PORT = process.env.PORT || 3001;

const app = express();

app.use( cors() )

app.use(
  fileUpload( {
    useTempFiles: true,
    safeFileNames: true,
    preserveExtension: true,
    tempFileDir: `${__dirname}/public/files/temp`
  } )
);

app.use( express.json() );

// Have Node serve the files for our built React app
app.use( express.static( path.resolve( __dirname, '../client/build' ) ) );

// serve files
app.use( '/uploads', express.static( __dirname + '/public' ) );


// Handle GET requests to /api route
app.get( "/api", ( req, res ) => {
  res.json( { message: "Hello from server!" } );
} );

// All other GET requests not handled before will return our React app
app.get( '*', ( req, res ) => {
  res.sendFile( path.resolve( __dirname, '../client/build', 'index.html' ) );
} );

app.listen( PORT, () => {
  console.log( `Server listening on ${PORT}` );
} );
