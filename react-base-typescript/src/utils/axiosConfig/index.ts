import config from "../config";
const axios = require('axios');

const instance = axios.create({
  baseURL: config.API_URL
});

export default instance;