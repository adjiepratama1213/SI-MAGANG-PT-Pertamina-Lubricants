import { useCallback, useEffect, useMemo, useReducer } from 'react';
// utils
import axios from 'src/utils/axios';
//
import { AUTH_SESSION_KEY } from 'src/config-global';
import { endpoints } from 'src/utils/endpoints';
import { ActionMapType, AuthStateType, AuthUserType, TAuthStatus } from '../../types';
import { AuthContext } from './auth-context';
import { isValidToken, jwtDecode, setSession } from './utils';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  VALIDATE = 'VALIDATE',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
    status: TAuthStatus;
    loading?: boolean;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
    status?: TAuthStatus;
  };
  [Types.VALIDATE]: {
    user: AuthUserType;
    status: TAuthStatus;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: {
    status: TAuthStatus;
  };
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      // ...state,
      loading: action.payload.loading,
      user: action.payload.user,
      status: action.payload.status,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
      status: action.payload.status,
    };
  }
  if (action.type === Types.VALIDATE) {
    return {
      ...state,
      user: action.payload.user,
      status: action.payload.status,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
      status: action.payload.status,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(AUTH_SESSION_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        const { userId, isVerified }: { userId: string; isVerified?: boolean } = jwtDecode(
          `${accessToken}`
        );

        window.postMessage(
          {
            type: 'AUTH_DATA',
            token: accessToken,
          },
          '*' // bisa diganti dengan origin tertentu jika perlu
        );
        const res = await axios.post(endpoints.auth.me, { userId });

        const user = res.data;

        if (isVerified) {
          dispatch({
            type: Types.INITIAL,
            payload: {
              loading: false,
              status: 'authenticated',
              user: {
                ...user,
                accessToken,
              },
            },
          });
        } else {
          // MFA pending: keep user so MFA validation page has email after refresh
          dispatch({
            type: Types.INITIAL,
            payload: {
              status: 'unauthenticated',
              user: {
                ...user,
                accessToken,
              },
              loading: false,
            },
          });
        }
      } else {
        // setSession(null);
        dispatch({
          type: Types.INITIAL,
          payload: {
            status: 'unauthenticated',
            user: null,
            loading: false,
          },
        });
      }
    } catch (error) {
      console.error(error);
      // setSession(null);
      dispatch({
        type: Types.INITIAL,
        payload: {
          status: 'unauthenticated',
          user: null,
          loading: false,
        },
      });
    }
  }, [dispatch]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ----------------------------------------------------------------------------------------------------

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    const data = {
      email,
      password,
    };

    const res = await axios.post(endpoints.auth.login, data);

    const { accessToken, user } = res.data;

    setSession(accessToken);

    if (user.isVerified && user.idamanId) {
      // Kirim token ke extension via postMessage
      if (accessToken) {
        window.postMessage(
          {
            type: 'AUTH_DATA',
            token: accessToken,
          },
          '*' // bisa diganti dengan origin tertentu jika perlu
        );
      }
      dispatch({
        type: Types.VALIDATE,
        payload: {
          status: 'authenticated',
          user: {
            ...user,
            accessToken,
          },
        },
      });
    } else {
      dispatch({
        type: Types.LOGIN,
        payload: {
          status: 'unauthenticated',
          user: {
            ...user,
            accessToken,
          },
        },
      });
    }
  }, []);

  // WEBAUTHN_LOGIN
  const webAuthnLogin = useCallback(async (webAuthnId: string) => {
    const data = {
      webAuthnId,
    };

    const res = await axios.post(endpoints.auth.loginWebAuthn, data);

    const { accessToken, user } = res.data;

    setSession(accessToken);

    dispatch({
      type: Types.LOGIN,
      payload: {
        status: 'unauthenticated',
        user: {
          ...user,
          accessToken,
        },
      },
    });

    return res.data;
  }, []);

  // WEBAUTHN_LOGIN
  const loginWithToken = useCallback(async (token: string) => {
    const data = {
      token,
    };
    try {
      const res = await axios.post(endpoints.auth.qrVerify, data);

      const { accessToken, user } = res.data;

      setSession(accessToken);

      // Kirim token ke extension via postMessage
      if (accessToken) {
        window.postMessage(
          {
            type: 'ACCESS_TOKEN',
            token: accessToken,
          },
          '*' // bisa diganti dengan origin tertentu jika perlu
        );
      }

      if (res.data) {
        dispatch({
          type: Types.VALIDATE,
          payload: {
            status: 'authenticated',
            user: {
              ...user,
              accessToken,
            },
          },
        });
      } else {
        dispatch({
          type: Types.VALIDATE,
          payload: {
            status: 'unauthenticated',
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.VALIDATE,
        payload: {
          status: 'unauthenticated',
        },
      });
      throw error;
    }
  }, []);

  // CONFIRM LOGIN
  const mfaValidate = useCallback(async (email: string, code: string) => {
    try {
      const data = { id: email, code };

      const res = await axios.post(endpoints.mfa.validate, data);

      const { accessToken, user } = res.data;

      setSession(accessToken);

      // Kirim token ke extension via postMessage
      if (accessToken) {
        window.postMessage(
          {
            type: 'ACCESS_TOKEN',
            token: accessToken,
          },
          '*' // bisa diganti dengan origin tertentu jika perlu
        );
      }

      if (res.data) {
        dispatch({
          type: Types.VALIDATE,
          payload: {
            status: 'authenticated',
            user: {
              ...user,
              accessToken,
            },
          },
        });
      } else {
        dispatch({
          type: Types.VALIDATE,
          payload: {
            status: 'unauthenticated',
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.VALIDATE,
        payload: {
          status: 'unauthenticated',
        },
      });
      throw error;
    }
  }, []);

  // REGISTER
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const data = {
        email,
        password,
        firstName,
        lastName,
      };

      const res = await axios.post(endpoints.auth.register, data);

      const { accessToken } = res.data;

      localStorage.setItem(AUTH_SESSION_KEY, accessToken);

      dispatch({
        type: Types.REGISTER,
        payload: {
          user: {
            accessToken,
          },
        },
      });
    },
    []
  );

  // LOGOUT
  const logout = useCallback(async () => {
    window.postMessage(
      {
        type: 'AUTH_DATA',
        token: null,
      },
      '*' // bisa diganti dengan origin tertentu jika perlu
    );
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
      payload: {
        status: 'unauthenticated',
      },
    });
  }, []);

  // ----------------------------------------------------------------------

  // const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const checkAuthenticated = state.status ? state.status : 'unauthenticated';
  // const checkAuthenticated = state.user?.isActive ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',

      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      status,
      //
      initialize,
      login,
      register,
      logout,
      mfaValidate,
      webAuthnLogin,
      loginWithToken,
    }),
    [
      initialize,
      login,
      logout,
      register,
      mfaValidate,
      webAuthnLogin,
      loginWithToken,
      status,
      state.user,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
