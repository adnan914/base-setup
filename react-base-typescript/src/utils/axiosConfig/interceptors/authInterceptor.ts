import { AxiosRequestHeaders } from "axios"
import { store } from '../../../store/store';

interface HeadersDefaults {
    headers: AxiosRequestHeaders,
    url: string
}

const authInterceptor = (config: HeadersDefaults) => {
    const { auth } = store.getState()
    if (auth.token) {
        if(config?.url === '/refresh') {
            config.headers['Authorization'] = `Bearer ${auth.refresh_token}`;
        } else {
            config.headers['Authorization'] = `Bearer ${auth.token}`;
        }
    }
    return config;
}
export default authInterceptor;