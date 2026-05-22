// import { Spot } from "../../utils/types"
import axios from "../../utils/axiosConfig"

export const getSpot = (params: object) => axios.get("/api/marketdata/spot", { params })