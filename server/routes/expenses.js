import express from "express"

import auth from '../middlewares/auth.js'
import { getTransactions, addTransaction, updateTransaction } from '../controllers/expenses.js'

const router = express.Router()

router.get( '/transactions', auth, getTransactions )
router.post( '/transactions', auth, addTransaction )
router.patch( '/transactions/:id', auth, updateTransaction )

export default router