
import { lazy } from "react";
import { ROUTES_PATH } from "../utils/constant";

const Login = lazy(() => import("pages/Login"))

const Home = lazy(() => import("pages/Dashboard"))


export const publicRoutes = [
  {
    key: "login",
    path: ROUTES_PATH.LOGIN,
    component: Login,
    // layout: PublicLayout,
  },
];

export const privateRoutes = [
  {
    key: "home",
    path: ROUTES_PATH.DASHBOARD,
    component: Home,
    // layout: PrivateLayout,
  },
];
