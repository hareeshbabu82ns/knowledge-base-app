import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-for-jwt'


export const googleSignin = async ( req, res ) => {
  const { email, name, profilePic, accessToken } = req.body
  try {
    const user = await User.findOne( { email } )
    if ( user ) {
      return res.status( 200 ).json( { user, token: accessToken } )
    } else {
      const newUser = await User.create( {
        email,
        name,
        profilePic,
        googleId: email,
      } )
      return res.status( 200 ).json( { user: newUser, token: accessToken } )
    }
  } catch ( err ) {
    res.status( 500 ).json( { message: 'Something went wrong!!!' } )
    console.log( err )
  }
}

export const signin = async ( req, res ) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne( { email } )
    if ( !user ) {
      return res.status( 404 ).json( { message: 'User not registered' } )
    }

    const isPwdValid = await bcrypt.compare( password, user.password )
    if ( !isPwdValid ) {
      return res.status( 400 ).json( { message: 'Invalid credentials' } )
    }

    const token = jwt.sign( { email: user.email, id: user._id }, JWT_SECRET, { expiresIn: '1h' } )

    res.status( 200 ).json( { user, token } )

  } catch ( err ) {
    res.status( 500 ).json( { message: 'Something went wrong!!!' } )
    console.log( err )
  }
}

export const signup = async ( req, res ) => {
  const { email, password, firstName, lastName } = req.body
  try {
    const userExists = await User.findOne( { email } )
    if ( userExists ) {
      return res.status( 400 ).json( { message: 'User already registered' } )
    }

    const hashedPwd = await bcrypt.hash( password, 12 )

    const result = await User.create( {
      email, password: hashedPwd,
      name: `${firstName} ${lastName}`
    } )

    const token = jwt.sign( { email: result.email, id: result._id }, JWT_SECRET, { expiresIn: '1h' } )

    res.status( 201 ).json( { user: result, token } )

  } catch ( err ) {
    res.status( 500 ).json( { message: 'Something went wrong!!!' } )
    console.log( err )
  }
}