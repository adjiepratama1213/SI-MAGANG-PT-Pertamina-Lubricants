import axios, { AxiosRequestConfig } from 'axios';
// config
import { AUTH_SESSION_KEY, PRODUCT_API } from 'src/config-global';

// ----------------------------------------------------------------------

const productAPI = axios.create({ baseURL: PRODUCT_API });

const accessToken = localStorage.getItem(AUTH_SESSION_KEY);

if (accessToken) {
  productAPI.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

productAPI.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default productAPI;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await productAPI.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------
