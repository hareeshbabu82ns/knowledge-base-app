import jwt from 'jwt-decode';

const initState = { user: null, token: null };

export const isTokenExpired = (token) => {
  // console.log(`isTokenExpired, ${token}`);
  try {
    const jwtDecoded = jwt(token);
    console.log(`token time: ${jwtDecoded.exp * 1000}`);
    const nowTime = new Date().getTime();
    console.log(`now time: ${nowTime}`);
    return jwtDecoded.exp * 1000 < nowTime;
  } catch (ex) {
    console.log(ex);
    return true;
  }
};

export const saveUserLocal = (userData) =>
  localStorage.setItem('profile', JSON.stringify(userData));

export const loadUserLocal = () => {
  const profile = localStorage.getItem('profile');
  if (profile) {
    const profileJSON = JSON.parse(localStorage.getItem('profile'));
    // console.log('profile:', profileJSON.token);
    if (isTokenExpired(profileJSON?.token)) {
      localStorage.setItem('profile', JSON.stringify(initState));
      return initState;
    }
    return profileJSON;
  } else {
    localStorage.setItem('profile', JSON.stringify(initState));
    return initState;
  }
};

export const clearUserLocal = (userData) =>
  localStorage.setItem('profile', JSON.stringify(initState));

/// Theme
const initThemeState = {
  mode: 'dark',
  baseColor: '#303fa0',
  secondaryColor: '#cf6828',
  tertiaryColor: '#43bab9',
};

export const saveThemeLocal = (themeData) =>
  localStorage.setItem('theme', JSON.stringify(themeData));

export const loadThemeLocal = () => {
  const theme = localStorage.getItem('theme');
  if (theme) return JSON.parse(localStorage.getItem('theme'));
  else {
    localStorage.setItem('theme', JSON.stringify(initThemeState));
    return initThemeState;
  }
};

export const clearThemeLocal = (themeData) =>
  localStorage.setItem('theme', JSON.stringify(initThemeState));
