import express from "express"

import auth from '../middlewares/auth.js'
import { getTransactions, addTransaction } from '../controllers/expenses.js'

const router = express.Router()

router.get( '/transactions', auth, getTransactions )
router.post( '/transactions', auth, addTransaction )

export default router