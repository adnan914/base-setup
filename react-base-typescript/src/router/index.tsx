import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// global loader
// import Loader from "components/Shared/loader/Loader";

// susspense loader
// import SuspenseLoader from "components/Shared/suspenssLoader";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// PublicRoute, PrivateRoute components
import { PublicRoute, PrivateRoute } from "./Layout";
import { Provider } from "react-redux";
import { store } from "store/store";
// public routes

//constants
import { privateRoutes, publicRoutes } from "./routerConfig";
import { ROUTES_PATH } from "utils/constant";
import ComponentLoader from "shared/component-loader";
import CommonDialog from "shared/common-dialog";

import axios from "utils/axiosConfig";
import authInterceptor from "utils/axiosConfig/interceptors/authInterceptor";
import successHandler from "utils/axiosConfig/interceptors/successHandler";
import errorHandler from "utils/axiosConfig/interceptors/errorHandler";

axios.interceptors.request.use(authInterceptor, (error: any) =>
  Promise.reject(error)
);
axios.interceptors.response.use(successHandler, (error: any) =>
  errorHandler(error)
);


const theme = createTheme({
  palette: {
    primary: {
      main: "#1D2858",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
  },
});

const Main = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <CommonDialog />
          <Routes>
            <Route element={<PrivateRoute />}>
              {privateRoutes.map(
                ({
                  component: Component,
                  ...restProps
                }) => (
                  <Route
                    {...restProps}
                    element={
                      <Suspense fallback={<ComponentLoader/>}>
                        <Component />
                      </Suspense>
                    }
                  />
                )
              )}
            </Route>

            <Route element={<PublicRoute />}>
              {publicRoutes.map(
                ({
                  component: Component,
                  ...restProps
                }: any) => (
                  <Route
                    {...restProps}
                    element={
                      <Suspense fallback={<ComponentLoader/>}>
                        <Component />
                      </Suspense>
                    }
                  />
                )
              )}
              <Route path="*" element={<Navigate replace to={ROUTES_PATH.LOGIN} />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default Main;
