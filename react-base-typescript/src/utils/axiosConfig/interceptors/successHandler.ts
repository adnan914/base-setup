import { AxiosResponse } from "axios"

const successHandler = (response: AxiosResponse): AxiosResponse => {
  return response.data;
}

export default successHandler;