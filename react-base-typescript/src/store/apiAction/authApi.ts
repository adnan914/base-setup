// import { LoginForm } from "../../utils/types"
import axios from "../../utils/axiosConfig"

export const login = (body: object) => axios.post("/login", body)

export const refreshToken = () => axios.post("/refresh")