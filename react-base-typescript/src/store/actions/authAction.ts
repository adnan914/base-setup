import { AppDispatch } from "../store";
import * as auth from "../reducers/authReducer";
// import * as API from "../apiAction/authApi"
import {
  // LoginForm,
  Signupfield,
  Setnewpassword,
  Setuppassword,
  Forgotpasswordfield,
  Confirmcodefield,
} from "../types/authType";

// export const login = (form: LoginForm) => async (dispatch: AppDispatch) => {
  export const login = () => async (dispatch: AppDispatch) => {
  try {
    // const res: LoginRes = await API.login(form)
    // if(res.access_token) {
    // Cookies.set("token", "asdadasd", { expires: 1 });
    localStorage.setItem("token",'asdadasd')
    // Cookies.set("user", JSON.stringify(user), { expires: 1 });
    // Cookies.set("user", JSON.stringify(user), { expires: 1 });
    // Cookies.set('refresh_token', res.refresh_token, { expires: 1 })
    // }
    dispatch(
      auth.login({
        access_token: "asdadasd",
        refresh_token: "asdasdasd",
      })
    );
    return true;
  } catch (err) {}
};

export const signup = (form: Signupfield) => async (dispatch: AppDispatch) => {
  try {
    // const res: LoginRes = await API.login(form)
    // if(res.access_token) {
    // Cookies.set("token", "asdadasd", { expires: 1 });
    // Cookies.set('refresh_token', res.refresh_token, { expires: 1 })
    // }
    // dispatch(
    //   auth.signup({ access_token: "asdadasd", refresh_token: "asdasdasd" })
    // );
    return true;
  } catch (err) {}
};
export const confirmcode =
  (form: Confirmcodefield) => async (dispatch: AppDispatch) => {
    try {
      // const res: LoginRes = await API.login(form)
      // if(res.access_token) {

      // Cookies.set('refresh_token', res.refresh_token, { expires: 1 })
      // }
      //   dispatch(
      //     auth.signup({ access_token: "asdadasd", refresh_token: "asdasdasd" })
      //   );
      return true;
    } catch (err) {}
  };
export const forgotpassword =
  (form: Forgotpasswordfield) => async (dispatch: AppDispatch) => {
    try {
      // const res: LoginRes = await API.login(form)
      // if(res.access_token) {

      // Cookies.set('refresh_token', res.refresh_token, { expires: 1 })
      // }
      //   dispatch(
      //     auth.signup({ access_token: "asdadasd", refresh_token: "asdasdasd" })
      //   );
      return true;
    } catch (err) {}
  };
export const setnewpassword =
  (form: Setnewpassword) => async (dispatch: AppDispatch) => {
    try {
      // const res: LoginRes = await API.login(form)
      // if(res.access_token) {

      // Cookies.set('refresh_token', res.refresh_token, { expires: 1 })
      // }
      //   dispatch(
      //     auth.signup({ access_token: "asdadasd", refresh_token: "asdasdasd" })
      //   );
      return true;
    } catch (err) {}
  };
export const setuppassword =
  (form: Setuppassword) => async (dispatch: AppDispatch) => {
    try {
      // const res: LoginRes = await API.login(form)
      // if(res.access_token) {

      // Cookies.set('refresh_token', res.refresh_token, { expires: 1 })
      // }
      //   dispatch(
      //     auth.signup({ access_token: "asdadasd", refresh_token: "asdasdasd" })
      //   );
      return true;
    } catch (err) {}
  };

export const logout = (dispatch: AppDispatch) => {
    dispatch(auth.logout());
};

export const refreshToken = (dispatch: AppDispatch) => {
  // const res: any = await API.refreshToken()
  // if(res && res.access_token) {
  //     Cookies.set('token', res.access_token, { expires: 1 })
  //     dispatch(auth.refreshToken(res))
  // }
  // return res
  return {
    access_token: "asdasdd"
  }
}