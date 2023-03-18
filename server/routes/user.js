import express from "express"
import {
  signup, signin, googleSignin,
} from '../controllers/user.js'

const router = express.Router()

router.post( '/signin', signin )
router.post( '/signup', signup )
router.post( '/googleSignin', googleSignin )

export default router