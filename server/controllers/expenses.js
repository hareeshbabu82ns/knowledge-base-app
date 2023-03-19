import { EXPENSE_TYPES } from '../models/Expenses/const.js'

import Transaction from "../models/Expenses/ExpenseTransaction.js";


const validateTransactionData = ( { amount, tags, type } ) => {

  if ( amount === 0 ) {
    throw 'amount can not be empty'
  }

  if ( tags.length === 0 ) {
    throw 'tags can not be empty'
  }

  if ( !EXPENSE_TYPES.includes( type ) ) {
    throw 'expense type not valid'
  }

  return true

}

export const addTransaction = async ( req, res ) => {
  try {

    const { user } = req.auth

    const { amount, tags, type, dateUTC } = req.body

    const isValid = validateTransactionData( { amount, tags, type, date: dateUTC } )

    const newTransaction = new Transaction( { userId: user._id, amount, tags, type, date: dateUTC } )

    const trans = await newTransaction.save()

    // console.log( 'date utc: ', dateUTC )
    // console.log( 'date db: ', trans.date )
    // console.log( trans )

    res.status( 201 ).json( { id: trans._id } )

  } catch ( err ) {
    res.status( 404 ).json( { message: err.message } )
  }
}

export const getTransactions = async ( req, res ) => {

  try {

    const { user } = req.auth

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
        { userId: user._id },
      ],
    } )
      .sort( sortFormatted )
      .skip( page * pageSize )
      .limit( pageSize )

    const total = await Transaction.countDocuments( {
      $or: [
        // { cost: { $regex: new RegExp( search, 'i' ) } },
        { userId: user._id },
      ],
    } )

    res.status( 200 ).json( { transactions, total } )
  } catch ( err ) {
    res.status( 404 ).json( { message: err.message } )
  }
}