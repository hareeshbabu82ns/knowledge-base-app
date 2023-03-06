import { ObjectId } from "mongoose";
import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

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

export const getCustomer = async ( req, res ) => {
  try {
    const { id } = req.params
    const user = await User.findById( id )
    res.status( 200 ).json( user )
  } catch ( err ) {
    res.status( 404 ).json( { message: err.message } )
  }
}

export const getCustomers = async ( req, res ) => {
  try {
    // const { id } = req.params
    const users = await User.find( { role: 'user' } ).select( '-password' )
    res.status( 200 ).json( users )
  } catch ( err ) {
    res.status( 404 ).json( { message: err.message } )
  }
}

export const getTransactions = async ( req, res ) => {
  try {
    // sort should look like : { "field": "userId", "sort": "desc" }
    const { page = 0, pageSize = 20, sort = null, search = '' } = req.query

    // formatted sort should look like: {userId: -1}
    const genSort = () => {
      const sortParsed = JSON.parse( sort )
      const sortFormatted = {
        [ sortParsed.field ]: sortParsed.sort === "asc" ? 1 : -1,
      }
      return sortFormatted
    }

    const sortFormatted = Boolean( sort ) ? genSort() : {}

    const transactions = await Transaction.find( {
      $or: [
        // { cost: { $regex: new RegExp( search, 'i' ) } },
        { userId: { $regex: new RegExp( search, 'i' ) } },
      ],
    } )
      .sort( sortFormatted )
      .skip( page * pageSize )
      .limit( pageSize )

    const total = await Transaction.countDocuments( {
      $or: [
        // { cost: { $regex: new RegExp( search, 'i' ) } },
        { userId: { $regex: new RegExp( search, 'i' ) } },
      ],
    } )

    res.status( 200 ).json( { transactions, total } )
  } catch ( err ) {
    res.status( 404 ).json( { message: err.message } )
  }
}