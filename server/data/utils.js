import User from '../models/User.js'
import Product from '../models/Product.js'
import ProductStat from '../models/ProductStat.js'
import { dataUser, dataProduct, dataProductStat } from "./index.js"



export const pushInitUserData = async () => {
  const user = await User.findOne()
  // console.log( "🚀 ~ file: utils.js:6 ~ pushInitUserData ~ user:", user )
  if ( !user ) {
    await User.insertMany( dataUser )
    console.log( 'users mockdata uploaded' )
  }
}
export const pushInitProductData = async () => {
  const product = await Product.findOne()
  // console.log( "🚀 ~ file: utils.js:6 ~ pushInitUserData ~ product:", product )
  if ( !product ) {
    await Product.insertMany( dataProduct )
    console.log( 'products mockdata uploaded' )
  }
}
export const pushInitProductStatData = async () => {
  const productStat = await ProductStat.findOne()
  // console.log( "🚀 ~ file: utils.js:6 ~ pushInitUserData ~ productStat:", productStat )
  if ( !productStat ) {
    await ProductStat.insertMany( dataProductStat )
    console.log( 'productStats mockdata uploaded' )
  }
}

export const pushInitData = async () => {
  await pushInitUserData()
  await pushInitProductData()
  await pushInitProductStatData()
}