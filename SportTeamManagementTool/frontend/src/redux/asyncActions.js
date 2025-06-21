import { api } from "../api/apiService";
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
import { useSelector } from "./store"; // Still needed for internal logic in some async actions

export const loginUser = async (dispatch, credentials) => {
  dispatch({ type: AUTH_REQUEST });
  try {
    const data = await api.auth.login(credentials);
    dispatch({ type: LOGIN_SUCCESS, payload: data });
    return true;
  } catch (error) {
    dispatch({ type: LOGIN_FAILURE, payload: error.message });
    return false;
  }
};

export const registerUser = async (dispatch, userData) => {
  dispatch({ type: AUTH_REQUEST });
  try {
    const data = await api.auth.register(userData);
    dispatch({ type: REGISTER_SUCCESS, payload: data });
    return true;
  } catch (error) {
    dispatch({ type: REGISTER_FAILURE, payload: error.message });
    return false;
  }
};

export const logoutUser = async (dispatch) => {
  try {
    await api.auth.logout();
    dispatch({ type: LOGOUT_SUCCESS });
  } catch (error) {
    dispatch({ type: LOGOUT_SUCCESS });
    console.error("Logout API failed:", error.message);
  }
};

export const fetchAllTeamsAndUserMemberships = async (
  dispatch,
  currentUserId
) => {
  dispatch({ type: FETCH_TEAMS_REQUEST });
  try {
    const response = await api.teams.getAll();
    // Check if the response has a 'results' key (DRF pagination)
    const allTeams = response.results ? response.results : response;

    const userTeams = allTeams.filter((team) =>
      team.memberships.some(
        (membership) => membership.user.id === currentUserId
      )
    );
    const teamsToJoin = allTeams.filter(
      (team) =>
        !team.memberships.some(
          (membership) => membership.user.id === currentUserId
        )
    );

    dispatch({
      type: FETCH_TEAMS_SUCCESS,
      payload: { teams: userTeams, teamsToJoin },
    });
  } catch (error) {
    dispatch({ type: FETCH_TEAMS_FAILURE, payload: error.message });
  }
};

export const fetchTeamDetail = async (dispatch, teamId) => {
  dispatch({ type: FETCH_TEAM_DETAIL_REQUEST });
  try {
    const team = await api.teams.getById(teamId);
    dispatch({ type: FETCH_TEAM_DETAIL_SUCCESS, payload: team });
  } catch (error) {
    dispatch({ type: FETCH_TEAM_DETAIL_FAILURE, payload: error.message });
  }
};

export const createNewTeam = async (dispatch, teamData) => {
  dispatch({ type: CREATE_TEAM_REQUEST });
  try {
    const newTeam = await api.teams.create(teamData);
    dispatch({ type: CREATE_TEAM_SUCCESS, payload: newTeam });
    return true;
  } catch (error) {
    dispatch({ type: CREATE_TEAM_FAILURE, payload: error.message });
    return false;
  }
};

export const joinTeam = async (dispatch, teamId, username, role) => {
  dispatch({ type: JOIN_TEAM_REQUEST });
  try {
    const membership = await api.teams.join(teamId, username, role);
    const updatedTeam = await api.teams.getById(teamId);
    dispatch({
      type: JOIN_TEAM_SUCCESS,
      payload: { team: updatedTeam, membership },
    });
    return true;
  } catch (error) {
    dispatch({ type: JOIN_TEAM_FAILURE, payload: error.message });
    return false;
  }
};

export const fetchPostsFeed = async (dispatch, currentUserId) => {
  dispatch({ type: FETCH_POSTS_FEED_REQUEST });
  try {
    // Correctly extract allTeams from the paginated response
    const allTeamsResponse = await api.teams.getAll();
    const allTeams = allTeamsResponse.results
      ? allTeamsResponse.results
      : allTeamsResponse;

    const userTeamIds = allTeams
      .filter((team) =>
        team.memberships.some((m) => m.user.id === currentUserId)
      )
      .map((team) => team.id);

    let allPosts = [];
    for (const teamId of userTeamIds) {
      try {
        const teamPostsResponse = await api.posts.getByTeam(teamId);
        // Correctly extract teamPosts from the paginated response
        const teamPosts = teamPostsResponse.results
          ? teamPostsResponse.results
          : teamPostsResponse;

        allPosts = [
          ...allPosts,
          ...teamPosts.map((p) => ({
            ...p,
            team_name: allTeams.find((t) => t.id === teamId)?.name,
          })),
        ];
      } catch (error) {
        console.error(
          `Failed to fetch posts for team ${teamId}:`,
          error.message
        );
      }
    }
    allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    dispatch({ type: FETCH_POSTS_FEED_SUCCESS, payload: allPosts });
  } catch (error) {
    dispatch({ type: FETCH_POSTS_FEED_FAILURE, payload: error.message });
  }
};

export const fetchTeamPosts = async (dispatch, teamId) => {
  dispatch({ type: FETCH_TEAM_POSTS_REQUEST });
  try {
    const response = await api.posts.getByTeam(teamId);
    // Correctly extract posts from the paginated response
    const posts = response.results ? response.results : response;
    dispatch({ type: FETCH_TEAM_POSTS_SUCCESS, payload: posts });
  } catch (error) {
    dispatch({ type: FETCH_TEAM_POSTS_FAILURE, payload: error.message });
  }
};

export const fetchPostDetail = async (dispatch, teamId, postId) => {
  dispatch({ type: FETCH_POST_DETAIL_REQUEST });
  try {
    const post = await api.posts.getById(teamId, postId);
    dispatch({
      type: FETCH_POST_DETAIL_SUCCESS,
      payload: { post, comments: post.comments || [] },
    });
  } catch (error) {
    dispatch({ type: FETCH_POST_DETAIL_FAILURE, payload: error.message });
  }
};

export const addComment = async (dispatch, teamId, postId, commentContent) => {
  dispatch({ type: ADD_COMMENT_REQUEST });
  try {
    const newComment = await api.posts.addComment(
      teamId,
      postId,
      commentContent
    );
    dispatch({ type: ADD_COMMENT_SUCCESS, payload: newComment });
    return true;
  } catch (error) {
    dispatch({ type: ADD_COMMENT_FAILURE, payload: error.message });
    return false;
  }
};

export const createTeamPost = async (dispatch, teamId, postData) => {
  dispatch({ type: CREATE_POST_REQUEST });
  try {
    const newPost = await api.posts.create(teamId, postData);
    dispatch({ type: CREATE_POST_SUCCESS, payload: newPost });
    return true;
  } catch (error) {
    dispatch({ type: CREATE_POST_FAILURE, payload: error.message });
    return false;
  }
};

export const fetchEventsFeed = async (dispatch, currentUserId) => {
  dispatch({ type: FETCH_EVENTS_FEED_REQUEST });
  try {
    const allTeamsResponse = await api.teams.getAll();
    const allTeams = allTeamsResponse.results
      ? allTeamsResponse.results
      : allTeamsResponse;

    const userTeamIds = allTeams
      .filter((team) =>
        team.memberships.some((m) => m.user.id === currentUserId)
      )
      .map((team) => team.id);

    let allEvents = [];
    for (const teamId of userTeamIds) {
      try {
        const teamEventsResponse = await api.events.getByTeam(teamId);
        // Correctly extract teamEvents from the paginated response
        const teamEvents = teamEventsResponse.results
          ? teamEventsResponse.results
          : teamEventsResponse;

        allEvents = [
          ...allEvents,
          ...teamEvents.map((e) => ({
            ...e,
            team_name: allTeams.find((t) => t.id === teamId)?.name,
          })),
        ];
      } catch (error) {
        console.error(
          `Failed to fetch events for team ${teamId}:`,
          error.message
        );
      }
    }
    allEvents.sort(
      (a, b) => new Date(a.start_time) - new Date(a.end_time || a.start_time)
    );
    dispatch({ type: FETCH_EVENTS_FEED_SUCCESS, payload: allEvents });
  } catch (error) {
    dispatch({ type: FETCH_EVENTS_FEED_FAILURE, payload: error.message });
  }
};

export const fetchTeamEvents = async (dispatch, teamId) => {
  dispatch({ type: FETCH_TEAM_EVENTS_REQUEST });
  try {
    const response = await api.events.getByTeam(teamId);
    // Correctly extract events from the paginated response
    const events = response.results ? response.results : response;
    dispatch({ type: FETCH_TEAM_EVENTS_SUCCESS, payload: events });
  } catch (error) {
    dispatch({ type: FETCH_TEAM_EVENTS_FAILURE, payload: error.message });
  }
};

// New: Create an event for a team
export const createTeamEvent = async (dispatch, teamId, eventData) => {
  dispatch({ type: CREATE_EVENT_REQUEST });
  try {
    const newEvent = await api.events.create(teamId, eventData);
    dispatch({ type: CREATE_EVENT_SUCCESS, payload: newEvent });
    return true;
  } catch (error) {
    dispatch({ type: CREATE_EVENT_FAILURE, payload: error.message });
    return false;
  }
};
