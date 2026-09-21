import axios, { AxiosRequestConfig } from 'axios';
// config
import { AUTH_SESSION_KEY, HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

const accessToken = localStorage.getItem(AUTH_SESSION_KEY);

if (accessToken) {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------
