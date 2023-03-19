import jwt from 'jsonwebtoken'
import axios from 'axios'

import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-for-jwt'

export default async ( req, res, next ) => {
  try {
    const token = req.headers.authorization.split( ' ' )[ 1 ]
    const decodedToken = jwt.verify( token, JWT_SECRET )

    const { email, id, googleId, accessToken } = decodedToken

    if ( googleId ) {

      // check with google for user info
      const userInfoRes = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )
      if ( !userInfoRes ) throw 'Google Login Failed'

      // read local user from db
      const user = await User.findOne( { email: userInfoRes.data.email } )

      // add user for subsequent execution
      req.auth = { user: user, accessToken }

    } else {

      // check local db for user info
      const user = await User.findOne( { email } )
      if ( !user ) throw 'Login Failed'

      // add user for subsequent execution
      req.auth = { user, accessToken }

    }

    next()

  } catch ( err ) {

    console.log( '--- Auth Middleware Failed ---\n', err )

    res.status( 401 ).json( { message: err.message } )

  }
}