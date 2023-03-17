import { Avatar, Box, Button, Card, CardActions, CardContent, Checkbox, Container, FormControlLabel, Grid, TextField, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
import Link from '@mui/material/Link'
import { toast } from 'react-toastify'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserSigninMutation } from 'state/api'
import { setUser } from 'state'
import { useDispatch } from 'react-redux'
import { saveUserLocal } from './utils'

const Login = () => {

  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [ searchParams ] = useSearchParams()

  const [ signIn, { isLoading } ] = useUserSigninMutation()

  const [ email, setEmail ] = useState( '' )
  const [ password, setPassword ] = useState( '' )

  const toSignup = () => {
    const params = searchParams.toString()
    navigate( `/signup?${params}` )
  }

  const handleSubmit = async ( e ) => {
    e.preventDefault()

    if ( email.length === 0 || password.length === 0 ) {
      toast( 'eMail or Password can not be empty', { toastId: 'user-login-form-validation' } )
      return
    }

    // const payload = await toast.promise( signIn( { email, password } ).unwrap(),
    //   {
    //     error: 'Login failed',
    //   } )
    const toastId = toast.loading( 'Login...', { toastId: 'login-action' } )
    try {
      const payload = await signIn( { email, password } ).unwrap();
      dispatch( setUser( payload ) )
      saveUserLocal( payload )

      // console.log( 'login successful', payload )
      toast.update( toastId, { render: 'login successful', type: 'success', isLoading: false, autoClose: true } )
      navigate( searchParams?.get( 'from' ) || '/dashboard' )
    } catch ( error ) {
      // console.error( 'login failed', error );
      toast.update( toastId, { render: 'login failed', type: 'error', isLoading: false, autoClose: true } )
      dispatch( setUser( null ) )
    }
  }

  return (
    <Container component="main" maxWidth="sm" >
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
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail( e.target.value )}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword( e.target.value )}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2" color="inherit">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link onClick={toSignup} variant="body2" color="inherit">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  )
}

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
  );
}

export default Login