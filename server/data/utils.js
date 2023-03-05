import User from '../models/User.js'
import { dataUser } from "./index.js"

export const pushInitUserData = async () => {
  const user = await User.findOne()
  // console.log( "🚀 ~ file: utils.js:6 ~ pushInitUserData ~ user:", user )
  if ( !user ) {
    await User.insertMany( dataUser )
    console.log( 'users mockdata uploaded' )
  }
}

