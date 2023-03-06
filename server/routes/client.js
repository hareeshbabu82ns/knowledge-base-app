import express from "express"
import {
  getProducts, getProduct,
  getCustomers, getCustomer,
  getTransactions
} from '../controllers/client.js'

const router = express.Router()

router.get( '/products', getProducts )
router.get( '/products/:id', getProduct )

router.get( '/customers', getCustomers )
router.get( '/customers/:id', getCustomer )

router.get( '/transactions', getTransactions )

export default router