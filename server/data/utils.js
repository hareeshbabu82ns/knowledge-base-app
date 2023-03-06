import User from '../models/User.js'
import Product from '../models/Product.js'
import ProductStat from '../models/ProductStat.js'
import Transaction from '../models/Transaction.js'
import { dataUser, dataProduct, dataProductStat, dataTransaction } from "./index.js"

export const pushInitUserData = async () => {
  const user = await User.findOne()
  // console.log( "🚀 ~ file: utils.js:6 ~ pushInitUserData ~ user:", user )
  if ( !user ) {
    await User.insertMany( dataUser )
    console.log( 'Users mockdata uploaded' )
  }
}
export const pushInitProductData = async () => {
  const product = await Product.findOne()
  // console.log( "🚀 ~ file: utils.js:6 ~ pushInitUserData ~ product:", product )
  if ( !product ) {
    await Product.insertMany( dataProduct )
    console.log( 'Products mockdata uploaded' )
  }
}
export const pushInitProductStatData = async () => {
  const productStat = await ProductStat.findOne()
  // console.log( "🚀 ~ file: utils.js:6 ~ pushInitUserData ~ productStat:", productStat )
  if ( !productStat ) {
    await ProductStat.insertMany( dataProductStat )
    console.log( 'ProductStats mockdata uploaded' )
  }
}
export const pushInitTransactionData = async () => {
  const productStat = await Transaction.findOne()
  // console.log( "🚀 ~ file: utils.js:6 ~ pushInitUserData ~ productStat:", productStat )
  if ( !productStat ) {
    await Transaction.insertMany( dataTransaction )
    console.log( 'Transaction mockdata uploaded' )
  }
}

export const pushInitData = async () => {
  await pushInitUserData()
  await pushInitProductData()
  await pushInitProductStatData()
  await pushInitTransactionData()
}