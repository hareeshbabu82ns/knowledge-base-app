import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import Link from '@mui/material/Link';
import { toast } from 'react-toastify';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserSigninMutation, useUserGoogleSigninMutation } from 'state/api';
import { setUser } from 'state';
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { saveUserLocal } from './utils';
import Copyright from 'views/utilities/Copyright';
import PageContainer from 'components/container/PageContainer';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [signIn, { isLoading }] = useUserSigninMutation();
  const [googleSignIn] = useUserGoogleSigninMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // console.log( tokenResponse )

      const toastId = toast.loading('Login...', { toastId: 'google-login-action' });
      try {
        const payload = await googleSignIn({
          accessToken: tokenResponse.access_token,
          expiresIn: tokenResponse.expires_in,
        }).unwrap();
        // console.log('login payload: ', payload);
        await dispatch(setUser(payload));
        saveUserLocal(payload);

        // console.log( 'login successful', payload )
        toast.update(toastId, {
          render: 'login successful',
          type: 'success',
          isLoading: false,
          autoClose: true,
        });
        navigate(searchParams?.get('from') || '/dashboard');
      } catch (error) {
        // console.error( 'login failed', error );
        toast.update(toastId, {
          render: 'login failed',
          type: 'error',
          isLoading: false,
          autoClose: true,
        });
        dispatch(setUser(null));
      }
    },
    onError: (errorResponse) => console.log(errorResponse),
    // flow: 'auth-code',
  });

  const toSignup = () => {
    const params = searchParams.toString();
    navigate(`/auth/register?${params}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.length === 0 || password.length === 0) {
      toast('eMail or Password can not be empty', { toastId: 'user-login-form-validation' });
      return;
    }

    // const payload = await toast.promise( signIn( { email, password } ).unwrap(),
    //   {
    //     error: 'Login failed',
    //   } )
    const toastId = toast.loading('Login...', { toastId: 'login-action' });
    try {
      const payload = await signIn({ email, password }).unwrap();
      dispatch(setUser(payload));
      saveUserLocal(payload);

      // console.log( 'login successful', payload )
      toast.update(toastId, {
        render: 'login successful',
        type: 'success',
        isLoading: false,
        autoClose: true,
      });
      navigate(searchParams?.get('from') || '/dashboard');
    } catch (error) {
      // console.error( 'login failed', error );
      toast.update(toastId, {
        render: 'login failed',
        type: 'error',
        isLoading: false,
        autoClose: true,
      });
      dispatch(setUser(null));
    }
  };

  return (
    <PageContainer title="Login" description="this is Login page">
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            xl={4}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Sign in
                </Typography>
              </Box>

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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                  Sign In
                </Button>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={googleLogin}
                >
                  Google Sign In
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
              <Copyright sx={{ mt: 5 }} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login;
