import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "store/hooks";
import { RootState } from "store/store";
// import { useSelector } from "react-redux";

//Constants
import { ROUTES_PATH } from "utils/constant";
import Header from "./component/Header";
import Sidebar from "./component/SideBar";

export const PrivateRoute = () => {
  const { token } = useAppSelector((state: RootState) => state.auth);
  const { isSideBar } = useAppSelector((state: RootState) => state.layout);

  return token ? (
    <div id="wrapper">
      <Header />
      <div className="main">
        <aside className={`side ${isSideBar ? "" : "hide_side"}`}>
          <Sidebar />
        </aside>
        <div className={`content ${isSideBar ? "" : "hide_side"}`}>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <Navigate to={ROUTES_PATH.LOGIN} />
  );
};

export const PublicRoute = () => {
  const { token } = useAppSelector((state: RootState) => state.auth);
  return !token ? <Outlet /> : <Navigate to={ROUTES_PATH.DASHBOARD} />;
};
