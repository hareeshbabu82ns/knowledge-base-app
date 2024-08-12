import NextAuth from "next-auth";
import { authOptionsPartial } from "@/lib/auth/utils";
import {
  apiRoutePrefix,
  DEFAULT_LOGIN_REDIRECT,
  // privateRoutes,
  publicRoutes,
} from "./config/routes";

const { auth } = NextAuth(authOptionsPartial);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const queryParams = nextUrl.searchParams;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiRoutePrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  // const isAuthRoute = privateRoutes.includes(nextUrl.pathname)

  // console.log("middleware: ROUTE", req.nextUrl.pathname)
  // console.log("middleware: isLoggedIn", isLoggedIn)
  // console.log("middleware: isApiAuthRoute", isApiAuthRoute)
  // console.log("middleware: isPublicRoute", isPublicRoute)
  // console.log("middleware: isAuthRoute", isAuthRoute)

  if (isApiAuthRoute) {
    return;
  }
  // if (isAuthRoute) {
  //   if (isLoggedIn) {
  //     return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
  //   }
  //   // return
  // }

  if (isLoggedIn && nextUrl.pathname === "/sign-in") {
    const from = queryParams.has("from")
      ? decodeURIComponent(queryParams.get("from") || DEFAULT_LOGIN_REDIRECT)
      : queryParams.has("callbackUrl")
        ? decodeURIComponent(
            queryParams.get("callbackUrl") || DEFAULT_LOGIN_REDIRECT,
          )
        : DEFAULT_LOGIN_REDIRECT;
    return Response.redirect(new URL(from, nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    let from = nextUrl.pathname;
    if (nextUrl.search) {
      from += nextUrl.search;
    }
    return Response.redirect(
      new URL(`/sign-in?from=${encodeURIComponent(from)}`, nextUrl),
    );
  }

  return;
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
