import { ObjectId } from "mongoose";
import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";

export const getProduct = async ( req, res ) => {
  try {
    const { id } = req.params
    const product = await Product.findById( id )
    const stat = await ProductStat.findOne( {
      productId: product._id,
    } )
    const productStat = {
      ...product._doc,
      stats: stat,
    }
    res.status( 200 ).json( productStat )
  } catch ( err ) {
    res.status( 404 ).json( { message: err.message } )
  }
}

export const getProducts = async ( req, res ) => {
  try {
    // const { id } = req.params
    const products = await Product.find()

    // fetch stats of each product
    const productsWithStats = await Promise.all(
      products.map( async ( product ) => {
        const stat = await ProductStat.findOne( {
          productId: product._id,
        } )
        return {
          ...product._doc,
          stats: stat,
        }
      } )
    )
    res.status( 200 ).json( productsWithStats )
  } catch ( err ) {
    res.status( 404 ).json( { message: err.message } )
  }
}

export const getProductStats = async ( req, res ) => {
  try {
    // const { id } = req.params
    const productStats = await ProductStat.find()
    res.status( 200 ).json( productStats )
  } catch ( err ) {
    res.status( 404 ).json( { message: err.message } )
  }
}