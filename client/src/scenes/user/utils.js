const initState = { user: null, token: null };

export const saveUserLocal = (userData) =>
  localStorage.setItem("profile", JSON.stringify(userData));

export const loadUserLocal = () => {
  const profile = localStorage.getItem("profile");
  if (profile) return JSON.parse(localStorage.getItem("profile"));
  else {
    localStorage.setItem("profile", JSON.stringify(initState));
    return initState;
  }
};

export const clearUserLocal = (userData) =>
  localStorage.setItem("profile", JSON.stringify(initState));

/// Theme
const initThemeState = { mode: "dark", baseColor: "#09D7F9" };

export const saveThemeLocal = (themeData) =>
  localStorage.setItem("theme", JSON.stringify(themeData));

export const loadThemeLocal = () => {
  const theme = localStorage.getItem("theme");
  if (theme) return JSON.parse(localStorage.getItem("theme"));
  else {
    localStorage.setItem("theme", JSON.stringify(initThemeState));
    return initThemeState;
  }
};

export const clearThemeLocal = (themeData) =>
  localStorage.setItem("theme", JSON.stringify(initThemeState));
