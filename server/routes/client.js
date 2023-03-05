import express from "express"
import {
  getProducts, getProduct,
  getCustomers, getCustomer
} from '../controllers/client.js'

const router = express.Router()

router.get( '/products', getProducts )
router.get( '/products/:id', getProduct )

router.get( '/customers', getCustomers )
router.get( '/customers/:id', getCustomer )

export default router