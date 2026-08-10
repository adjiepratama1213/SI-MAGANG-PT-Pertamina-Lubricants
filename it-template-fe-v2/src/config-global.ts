// routes

import { paths } from './pages/paths';

//

// API
// ----------------------------------------------------------------------

export const HOST = import.meta.env.VITE_HOST;
export const DEV_MODE = import.meta.env.VITE_DEV_MODE;
export const CHAT_IT_MODE = import.meta.env.VITE_CHAT_IT_MODE;
export const HOST_API = import.meta.env.VITE_HOST_API;
export const ASSETS_API = import.meta.env.VITE_ASSETS_API;
export const PRODUCT_API = import.meta.env.VITE_PRODUCT_API;
export const gcsProjectId = import.meta.env.VITE_GCS_PROJECT_ID;

export const IDAMAN = {
  viteIdamanAuthority: import.meta.env.VITE_IDAMAN_AUTHORITY,
  viteIdamanClientId: import.meta.env.VITE_IDAMAN_CLIENT_ID,
  viteIdamanClientSecret: import.meta.env.VITE_IDAMAN_CLIENT_SECRET,
  viteIdamanRedirectUri: import.meta.env.VITE_IDAMAN_REDIRECT_URI,
  viteIdamanPostLogoutRedirectUrl: import.meta.env.VITE_IDAMAN_POST_LOGOUT_REDIRECT_URL,
};

export const FIREBASE_API = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const AMPLIFY_API = {
  userPoolId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  region: import.meta.env.VITE_AWS_AMPLIFY_REGION,
};

export const AUTH0_API = {
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL,
};

export const MAPBOX_API = import.meta.env.VITE_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
// export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/post'

export const CHROMESTORE_GOOGLE = import.meta.env.VITE_CHROMESTORE_GOOGLE;

export const AUTH_SESSION_KEY = 'accessToken';

export const rolePTPL = ['SUPERSAIYAN', 'PTPL_IT', 'PTPL_QA', 'PTPL_PROD', 'EMPLOYEE'];
