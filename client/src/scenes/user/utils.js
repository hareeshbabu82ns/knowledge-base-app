
const initState = { user: null, token: null }

export const saveUserLocal = ( userData ) => localStorage.setItem( 'profile', JSON.stringify( userData ) )

export const loadUserLocal = () => {
  const profile = localStorage.getItem( 'profile' )
  if ( profile )
    return JSON.parse( localStorage.getItem( 'profile' ) )
  else {
    localStorage.setItem( 'profile', JSON.stringify( initState ) )
    return initState
  }
}

export const clearUserLocal = ( userData ) => localStorage.setItem( 'profile', JSON.stringify( initState ) )