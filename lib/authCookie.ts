// Edge-safe constants shared by middleware.ts (Edge runtime) and lib/auth.ts
// (Node). Kept in its own file so middleware doesn't pull in mongoose.
//
// In production the cookie uses the `__Host-` prefix: browsers only accept it
// when it is Secure, has Path=/ and no Domain — so it can't be planted by a
// subdomain or sent over plain HTTP. Plain HTTP dev can't set __Host- cookies.
export const AUTH_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-ezy_session' : 'ezy_session';
