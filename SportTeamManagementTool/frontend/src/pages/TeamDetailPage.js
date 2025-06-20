import React, { useEffect, useCallback, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useDispatch, useSelector } from "../redux/store";
import {
  fetchTeamDetail,
  fetchTeamPosts,
  fetchTeamEvents,
} from "../redux/asyncActions";
import CreatePostModal from "../components/CreatePostModal"; // New Import
import CreateEventModal from "../components/CreateEventModal"; // New Import

const TeamDetailPage = ({ teamId, navigateTo }) => {
  const dispatch = useDispatch();
  const {
    teamDetail,
    loading: teamLoading,
    error: teamError,
  } = useSelector((state) => state.teams);
  const {
    teamPosts,
    loading: postsLoading,
    error: postsError,
  } = useSelector((state) => state.posts);
  const {
    teamEvents,
    loading: eventsLoading,
    error: eventsError,
  } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false); // New State
  const [isCreateEventModalOpen, setCreateEventModalOpen] = useState(false); // New State

  const fetchTeamData = useCallback(() => {
    fetchTeamDetail(dispatch, teamId);
    fetchTeamPosts(dispatch, teamId);
    fetchTeamEvents(dispatch, teamId);
  }, [dispatch, teamId]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const isTrainer = teamDetail?.trainer && teamDetail.trainer.id === user?.id;
  const isMember = teamDetail?.memberships.some((m) => m.user.id === user?.id);

  if (teamLoading || postsLoading || eventsLoading) {
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
          Loading Team Details...
        </Typography>
      </Box>
    );
  }

  if (teamError || postsError || eventsError || !teamDetail) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Team</AlertTitle>
          {teamError && <p>Team Detail Error: {teamError}</p>}
          {postsError && <p>Posts Error: {postsError}</p>}
          {eventsError && <p>Events Error: {eventsError}</p>}
          {!teamDetail && <p>Team not found or you don't have access.</p>}
          <Button onClick={() => navigateTo("dashboard")}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        variant="outlined"
        sx={{ mb: 3 }}
        onClick={() => navigateTo("dashboard")}
      >
        &larr; Back to Dashboard
      </Button>
      <Card sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {teamDetail.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {teamDetail.description || "No description provided."}
        </Typography>
        <Typography variant="subtitle1">
          Trainer: {teamDetail.trainer?.username || "N/A"}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Created: {new Date(teamDetail.created_at).toLocaleDateString()}
        </Typography>
        {isTrainer && (
          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={() => setCreatePostModalOpen(true)}
            >
              Create New Post
            </Button>
            <Button
              variant="contained"
              onClick={() => setCreateEventModalOpen(true)}
            >
              Create New Event
            </Button>
          </Box>
        )}
      </Card>

      {!isMember && (
        <Alert severity="info" sx={{ mb: 4 }}>
          You are not a member of this team. Join the team to interact with its
          content.
        </Alert>
      )}

      {/* Team Posts */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Team Posts
        </Typography>
        {teamPosts.length > 0 ? (
          <List>
            {teamPosts.map((post) => (
              <ListItem
                key={post.id}
                button
                onClick={() =>
                  navigateTo("postDetail", {
                    teamId: teamDetail.id,
                    postId: post.id,
                  })
                }
              >
                <ListItemText
                  primary={post.title}
                  secondary={`By ${post.author.username} on ${new Date(
                    post.created_at
                  ).toLocaleDateString()} - ${post.comments_count} comments`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No posts for this team yet.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Team Events */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Team Events
        </Typography>
        {teamEvents.length > 0 ? (
          <List>
            {teamEvents.map((event) => (
              <ListItem key={event.id}>
                <ListItemText
                  primary={event.title}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {new Date(event.start_time).toLocaleString()}
                        {event.end_time &&
                          ` - ${new Date(event.end_time).toLocaleString()}`}
                      </Typography>
                      {event.location && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Location: {event.location}
                        </Typography>
                      )}
                      {event.description && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {event.description}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No events for this team yet.
          </Typography>
        )}
      </Box>

      {/* Create Post Modal */}
      {isTrainer && (
        <CreatePostModal
          open={isCreatePostModalOpen}
          onClose={() => setCreatePostModalOpen(false)}
          teamId={teamId}
          onPostCreated={fetchTeamData} // Callback to refresh posts after creation
        />
      )}

      {/* Create Event Modal */}
      {isTrainer && (
        <CreateEventModal
          open={isCreateEventModalOpen}
          onClose={() => setCreateEventModalOpen(false)}
          teamId={teamId}
          onEventCreated={fetchTeamData} // Callback to refresh events after creation
        />
      )}
    </Container>
  );
};

export default TeamDetailPage;
