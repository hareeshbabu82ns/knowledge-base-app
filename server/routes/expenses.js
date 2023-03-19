import express from "express"

import auth from '../middlewares/auth.js'
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../controllers/expenses.js'

const router = express.Router()

router.get( '/transactions', auth, getTransactions )
router.post( '/transactions', auth, addTransaction )
router.patch( '/transactions/:id', auth, updateTransaction )
router.delete( '/transactions/:id', auth, deleteTransaction )

export default router