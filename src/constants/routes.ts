export const ROUTES = {
  root: "/",
  login: "/login",
  admin: "/admin",
  notFound: "*",
  profile: {
    root: "/profile",
    param: "/profile/:userId?",
    byId: (userId: string | number) => `/profile/${userId}`,
  },
} as const;

export type AppRouteKey = keyof typeof ROUTES;

export const toRelativePath = (path: string): string =>
  path.startsWith("/") ? path.slice(1) : path;
