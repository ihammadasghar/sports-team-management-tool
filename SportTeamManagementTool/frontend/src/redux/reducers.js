import {
  AUTH_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGOUT_SUCCESS,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_FAILURE,
  FETCH_TEAM_DETAIL_REQUEST,
  FETCH_TEAM_DETAIL_SUCCESS,
  FETCH_TEAM_DETAIL_FAILURE,
  CREATE_TEAM_REQUEST,
  CREATE_TEAM_SUCCESS,
  CREATE_TEAM_FAILURE,
  JOIN_TEAM_REQUEST,
  JOIN_TEAM_SUCCESS,
  JOIN_TEAM_FAILURE,
  FETCH_POSTS_FEED_REQUEST,
  FETCH_POSTS_FEED_SUCCESS,
  FETCH_POSTS_FEED_FAILURE,
  FETCH_TEAM_POSTS_REQUEST,
  FETCH_TEAM_POSTS_SUCCESS,
  FETCH_TEAM_POSTS_FAILURE,
  FETCH_POST_DETAIL_REQUEST,
  FETCH_POST_DETAIL_SUCCESS,
  FETCH_POST_DETAIL_FAILURE,
  ADD_COMMENT_REQUEST,
  ADD_COMMENT_SUCCESS,
  ADD_COMMENT_FAILURE,
  CREATE_POST_REQUEST,
  CREATE_POST_SUCCESS,
  CREATE_POST_FAILURE,
  FETCH_EVENTS_FEED_REQUEST,
  FETCH_EVENTS_FEED_SUCCESS,
  FETCH_EVENTS_FEED_FAILURE,
  FETCH_TEAM_EVENTS_REQUEST,
  FETCH_TEAM_EVENTS_SUCCESS,
  FETCH_TEAM_EVENTS_FAILURE,
  CREATE_EVENT_REQUEST,
  CREATE_EVENT_SUCCESS,
  CREATE_EVENT_FAILURE,
} from "./actions";
import { getToken, setToken } from "../api/apiService";

export const initialAuthState = {
  isAuthenticated: !!getToken(),
  token: getToken(),
  user: null, // { id, username }
  loading: false,
  error: null,
};

export const authReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case AUTH_REQUEST:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      setToken(action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: { id: action.payload.user_id, username: action.payload.username },
        loading: false,
        error: null,
      };
    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
      setToken(null);
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false,
        error: action.payload,
      };
    case LOGOUT_SUCCESS:
      setToken(null);
      return {
        ...initialAuthState,
        isAuthenticated: false,
        token: null,
        user: null,
      };
    default:
      return state;
  }
};

export const initialTeamState = {
  teams: [], // All teams current user is a member of (trainer, athlete, member)
  teamsToJoin: [], // Teams the user is not a member of
  teamDetail: null,
  loading: false,
  error: null,
  createTeamSuccess: false,
  joinTeamSuccess: false,
};

export const teamReducer = (state = initialTeamState, action) => {
  switch (action.type) {
    case FETCH_TEAMS_REQUEST:
    case FETCH_TEAM_DETAIL_REQUEST:
    case CREATE_TEAM_REQUEST:
    case JOIN_TEAM_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        createTeamSuccess: false,
        joinTeamSuccess: false,
      };
    case FETCH_TEAMS_SUCCESS:
      return {
        ...state,
        loading: false,
        teams: action.payload.teams,
        teamsToJoin: action.payload.teamsToJoin,
      };
    case FETCH_TEAM_DETAIL_SUCCESS:
      return { ...state, loading: false, teamDetail: action.payload };
    case CREATE_TEAM_SUCCESS:
      return {
        ...state,
        loading: false,
        createTeamSuccess: true,
        teams: [...state.teams, action.payload],
      };
    case JOIN_TEAM_SUCCESS:
      const joinedTeam = {
        ...action.payload.team,
        memberships: [
          ...(action.payload.team.memberships || []),
          action.payload.membership,
        ],
      };
      return {
        ...state,
        loading: false,
        joinTeamSuccess: true,
        teamsToJoin: state.teamsToJoin.filter(
          (t) => t.id !== action.payload.team.id
        ),
        teams: [...state.teams, joinedTeam],
      };
    case FETCH_TEAMS_FAILURE:
    case FETCH_TEAM_DETAIL_FAILURE:
    case CREATE_TEAM_FAILURE:
    case JOIN_TEAM_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const initialPostState = {
  postsFeed: [],
  teamPosts: [],
  postDetail: null,
  comments: [],
  loading: false,
  error: null,
  createPostSuccess: false,
};

export const postReducer = (state = initialPostState, action) => {
  switch (action.type) {
    case FETCH_POSTS_FEED_REQUEST:
    case FETCH_TEAM_POSTS_REQUEST:
    case FETCH_POST_DETAIL_REQUEST:
    case ADD_COMMENT_REQUEST:
    case CREATE_POST_REQUEST:
      return { ...state, loading: true, error: null, createPostSuccess: false };
    case FETCH_POSTS_FEED_SUCCESS:
      return { ...state, loading: false, postsFeed: action.payload };
    case FETCH_TEAM_POSTS_SUCCESS:
      return { ...state, loading: false, teamPosts: action.payload };
    case FETCH_POST_DETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        postDetail: action.payload.post,
        comments: action.payload.comments,
      };
    case ADD_COMMENT_SUCCESS:
      // FIX: Manually update comments_count in postDetail when a new comment is added
      const updatedPostDetailForComment =
        state.postDetail && state.postDetail.id === action.payload.post
          ? {
              ...state.postDetail,
              comments_count: (state.postDetail.comments_count || 0) + 1,
            }
          : state.postDetail;
      return {
        ...state,
        loading: false,
        comments: [...state.comments, action.payload],
        postDetail: updatedPostDetailForComment, // Update postDetail
      };
    case CREATE_POST_SUCCESS:
      const updatedTeamPosts = state.teamPosts
        ? [...state.teamPosts, action.payload]
        : [action.payload];
      return {
        ...state,
        loading: false,
        createPostSuccess: true,
        teamPosts: updatedTeamPosts,
      };
    case FETCH_POSTS_FEED_FAILURE:
    case FETCH_TEAM_POSTS_FAILURE:
    case FETCH_POST_DETAIL_FAILURE:
    case ADD_COMMENT_FAILURE:
    case CREATE_POST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const initialEventState = {
  eventsFeed: [],
  teamEvents: [],
  loading: false,
  error: null,
  createEventSuccess: false,
};

export const eventReducer = (state = initialEventState, action) => {
  switch (action.type) {
    case FETCH_EVENTS_FEED_REQUEST:
    case FETCH_TEAM_EVENTS_REQUEST:
    case CREATE_EVENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        createEventSuccess: false,
      };
    case FETCH_EVENTS_FEED_SUCCESS:
      return { ...state, loading: false, eventsFeed: action.payload };
    case FETCH_TEAM_EVENTS_SUCCESS:
      return { ...state, loading: false, teamEvents: action.payload };
    case CREATE_EVENT_SUCCESS:
      const updatedTeamEvents = state.teamEvents
        ? [...state.teamEvents, action.payload]
        : [action.payload];
      return {
        ...state,
        loading: false,
        createEventSuccess: true,
        teamEvents: updatedTeamEvents,
      };
    case FETCH_EVENTS_FEED_FAILURE:
    case FETCH_TEAM_EVENTS_FAILURE:
    case CREATE_EVENT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
