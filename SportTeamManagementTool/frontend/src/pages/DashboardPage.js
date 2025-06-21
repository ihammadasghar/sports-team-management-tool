import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useDispatch, useSelector } from "../redux/store";
import {
  fetchAllTeamsAndUserMemberships,
  fetchPostsFeed,
  fetchEventsFeed,
  joinTeam,
} from "../redux/asyncActions";
import TeamCard from "../components/TeamCard";
import PostCard from "../components/PostCard";

const DashboardPage = ({ navigateTo }) => {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const {
    teams,
    teamsToJoin,
    loading: teamLoading,
    error: teamError,
  } = useSelector((state) => state.teams);
  const {
    postsFeed,
    loading: postsLoading,
    error: postsError,
  } = useSelector((state) => state.posts);
  const {
    eventsFeed,
    loading: eventsLoading,
    error: eventsError,
  } = useSelector((state) => state.events);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeamToJoin, setSelectedTeamToJoin] = useState(null);
  const [joinRole, setJoinRole] = useState("member");
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Filter teams by role for display
  const teamsAsTrainer = teams.filter(
    (team) => team.trainer && team.trainer.id === user?.id
  );
  const teamsAsAthlete = teams.filter(
    (team) =>
      team.memberships.some(
        (m) => m.user.id === user?.id && m.role === "athlete"
      ) && team.trainer?.id !== user?.id
  );
  const teamsAsMember = teams.filter(
    (team) =>
      team.memberships.some(
        (m) => m.user.id === user?.id && m.role === "member"
      ) && team.trainer?.id !== user?.id
  );

  const fetchData = useCallback(async () => {
    if (user?.id) {
      await fetchAllTeamsAndUserMemberships(dispatch, user.id);
      await fetchPostsFeed(dispatch, user.id);
      await fetchEventsFeed(dispatch, user.id);
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenJoinDialog = (team) => {
    setSelectedTeamToJoin(team);
    setJoinRole("member");
    setJoinError(null);
    setJoinSuccess(false);
    setDialogOpen(true);
  };

  const handleCloseJoinDialog = () => {
    setDialogOpen(false);
    setSelectedTeamToJoin(null);
  };

  const handleConfirmJoin = async () => {
    if (selectedTeamToJoin && user?.username) {
      setJoinError(null);
      setJoinSuccess(false);
      const success = await joinTeam(
        dispatch,
        selectedTeamToJoin.id,
        user.username,
        joinRole
      );
      if (success) {
        setJoinSuccess(true);
        setTimeout(() => {
          handleCloseJoinDialog();
          fetchData();
        }, 1500);
      } else {
        setJoinError(teamError || "Failed to join team.");
      }
    }
  };

  // Helper to group events by date
  const groupEventsByDate = (events) => {
    const grouped = {};
    events.forEach((event) => {
      const date = new Date(event.start_time);
      const dateKey = date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate(eventsFeed);
  const sortedDates = Object.keys(groupedEvents).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const showLoading =
    authLoading || teamLoading || postsLoading || eventsLoading;

  if (showLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  if (teamError || postsError || eventsError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Data</AlertTitle>
          <p>Team Error: {teamError}</p>
          <p>Posts Error: {postsError}</p>
          <p>Events Error: {eventsError}</p>
          <Button onClick={fetchData}>Retry</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Your Dashboard
      </Typography>

      {/* Teams to Join */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Teams You Can Join
        </Typography>
        {teamsToJoin.length > 0 ? (
          <Grid container spacing={3}>
            {teamsToJoin.map((team) => (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      gutterBottom
                    >
                      {team.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.description || "No description."}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleOpenJoinDialog(team)}
                    >
                      Join Team
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No new teams to join.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Your Teams */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Teams
        </Typography>
        {teams.length > 0 ? (
          <Box>
            {teamsAsTrainer.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  As Trainer
                </Typography>
                <Grid container spacing={3}>
                  {teamsAsTrainer.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      currentUserId={user?.id}
                      navigateTo={navigateTo}
                    />
                  ))}
                </Grid>
              </Box>
            )}
            {teamsAsAthlete.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  As Athlete
                </Typography>
                <Grid container spacing={3}>
                  {teamsAsAthlete.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      currentUserId={user?.id}
                      navigateTo={navigateTo}
                    />
                  ))}
                </Grid>
              </Box>
            )}
            {teamsAsMember.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  As Member
                </Typography>
                <Grid container spacing={3}>
                  {teamsAsMember.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      currentUserId={user?.id}
                      navigateTo={navigateTo}
                    />
                  ))}
                </Grid>
              </Box>
            )}
            {teamsAsTrainer.length === 0 &&
              teamsAsAthlete.length === 0 &&
              teamsAsMember.length === 0 && (
                <Typography variant="body1" color="text.secondary">
                  You are not part of any teams yet.
                </Typography>
              )}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            You are not part of any teams yet.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Feed of Posts - Updated to look like a feed */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Posts from Your Teams
        </Typography>
        {postsFeed.length > 0 ? (
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2, // Spacing between posts
            }}
          >
            {postsFeed.map((post) => (
              // PostCard already has its own Card, no need for extra Grid item
              <PostCard key={post.id} post={post} navigateTo={navigateTo} />
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No posts available from your teams.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Feed of Events */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Events from Your Teams
        </Typography>
        {eventsFeed.length > 0 ? (
          <Box sx={{ bgcolor: "background.paper", borderRadius: 3, p: 2 }}>
            {sortedDates.map((dateKey) => (
              <Box key={dateKey} sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  {dateKey}
                </Typography>
                <List disablePadding>
                  {groupedEvents[dateKey].map((event) => (
                    <ListItem
                      key={event.id}
                      onClick={() =>
                        navigateTo("teamDetail", { teamId: event.team })
                      }
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        mb: 1,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            component="span"
                            sx={{ fontWeight: "medium" }}
                          >
                            {event.title}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              {new Date(event.start_time).toLocaleTimeString(
                                undefined,
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                              {event.end_time &&
                                ` - ${new Date(
                                  event.end_time
                                ).toLocaleTimeString(undefined, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              Team: {event.team_name || event.team}{" "}
                              {event.location &&
                                ` | Location: ${event.location}`}
                            </Typography>
                            {event.description && (
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {event.description.substring(0, 70)}
                                {event.description.length > 70 ? "..." : ""}
                              </Typography>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No upcoming events from your teams.
          </Typography>
        )}
      </Box>

      {/* Join Team Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseJoinDialog}>
        <DialogTitle>Join Team: {selectedTeamToJoin?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select your role for this team:
          </Typography>
          <TextField
            select
            fullWidth
            label="Role"
            value={joinRole}
            onChange={(e) => setJoinRole(e.target.value)}
            SelectProps={{ native: true }}
            variant="outlined"
            size="small"
          >
            <option value="member">Member</option>
            <option value="athlete">Athlete</option>
          </TextField>
          {joinError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {joinError}
            </Alert>
          )}
          {joinSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Successfully joined {selectedTeamToJoin?.name} as {joinRole}!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJoinDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmJoin}
            variant="contained"
            disabled={teamLoading}
          >
            {teamLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Confirm Join"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;
