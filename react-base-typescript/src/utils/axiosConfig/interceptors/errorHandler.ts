import { AxiosError } from "axios";
import axios from "../index"
import { store } from '../../../store/store';
import { refreshToken } from "../../../store/actions/authAction";
import * as commonService from "../../CommonService"
// import { LoginRes } from "../../types";

const handleAuthentication = async (error: any) => {
	const config = error.config
	if(config.url === "/refresh") {
		commonService.forError("Not authenticated");
		store.dispatch({ type: "auth/logout"})
		Promise.reject()
	} else {
		const res: any = refreshToken(store.dispatch)
		if (res && res.access_token) { 
			config.headers = {
				...config.headers, Authorization:  `Bearer ${res.access_token}`
			}
			return axios(config)
		}
		else {
			store.dispatch({ type: "auth/logout"})
			return false
		}
	}
};

export default function errorHandler (error: AxiosError): Promise<AxiosError> {
	if (error?.message === "Network Error") {
		return handleAuthentication(error)
	}
	const message  = error?.message ? error.message : 'Seems like something went wrong!' ;
	switch (error.status) {
		case 400:
			if (message === "jwt expired") handleAuthentication(error);
			else commonService.forError(message);
			break;
		case 401:
			handleAuthentication(error);
			break;
		case 500:
			commonService.forError(message);
			break;
		case 504:
			commonService.forError('Sorry, could not access the external resource to refine the data for your request, please try again later!');
			break;
		case 700:
			commonService.forError(message);
			break;
		default:
			commonService.forError(message ? message : 'something went wrong');
			break;
	}
	return Promise.reject(error);
}
