import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  initialAuthState,
  authReducer,
  initialTeamState,
  teamReducer,
  initialPostState,
  postReducer,
  initialEventState,
  eventReducer,
} from "./reducers";
import { AUTH_REQUEST, LOGIN_SUCCESS } from "./actions";
import { getToken } from "../api/apiService";

// Combine reducers (simple manual combination for useReducer)
const rootReducer = (state, action) => {
  return {
    auth: authReducer(state.auth, action),
    teams: teamReducer(state.teams, action),
    posts: postReducer(state.posts, action),
    events: eventReducer(state.events, action),
  };
};

export const initialState = {
  auth: initialAuthState,
  teams: initialTeamState,
  posts: initialPostState,
  events: initialEventState,
};

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  // Auto-login/fetch user details if token exists on initial load
  useEffect(() => {
    const token = getToken();
    if (token && !state.auth.user) {
      dispatch({ type: AUTH_REQUEST });
      if (token) {
        // This is a placeholder for a proper token verification and user data fetch
        // In a real app, you'd hit a /me endpoint or decode JWT for user_id/username
        // For now, we simulate success with basic user info
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token: token,
            user_id: null,
            username: "Authenticated User",
          },
        });
      }
    }
  }, [state.auth.user, dispatch]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useDispatch = () => useContext(StoreContext).dispatch;
export const useSelector = (selector) =>
  selector(useContext(StoreContext).state);
