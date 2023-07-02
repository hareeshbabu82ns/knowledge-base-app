import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUserSignupMutation } from 'state/api'
import { useDispatch } from 'react-redux'

import { setUser } from 'state'

function Copyright( props ) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

const initFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function SignUp() {

  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [ searchParams ] = useSearchParams()

  const [ signUp, { isLoading } ] = useUserSignupMutation()

  const [ formData, setFormData ] = React.useState( initFormData )

  const onInputChange = ( e ) => setFormData( { ...formData, [ e.target.name ]: e.target.value } )

  const toSignin = () => {
    const params = searchParams.toString()
    navigate( `/signin?${params}` )
  }

  const handleSubmit = async ( e ) => {
    e.preventDefault()

    if ( formData.email.length === 0 || formData.password.length === 0 ) {
      toast( 'eMail or Password can not be empty', { toastId: 'user-form-validation' } )
      return
    }
    if ( formData.password.length !== formData.confirmPassword.length ) {
      toast( 'Passwords did not match', { toastId: 'user-pwd-form-validation' } )
      return
    }

    const toastId = toast.loading( 'Signing up...', { toastId: 'signup-action' } )
    try {
      const payload = await signUp( formData ).unwrap();
      dispatch( setUser( payload ) )
      localStorage.setItem( 'profile', JSON.stringify( payload ) )
      // console.log( 'signup successful', payload )
      toast.update( toastId, { render: 'signup successful', type: 'success', isLoading: false, autoClose: true } )
      navigate( searchParams?.get( 'from' ) || '/dashboard' )
    } catch ( error ) {
      // console.error( 'signup failed', error );
      toast.update( toastId, { render: 'signup failed', type: 'error', isLoading: false, autoClose: true } )
      dispatch( setUser( null ) )
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundImage: 'none',
          bgcolor: theme.palette.background.alt,
          borderRadius: '0.55rem',
          padding: { xs: 2, md: 5 },
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value={formData.firstName}
                onChange={onInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={onInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={onInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={onInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={onInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I want to receive inspiration, marketing promotions and updates via email."
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onSubmit={handleSubmit}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link onClick={toSignin} variant="body2" color="inherit">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  )
}