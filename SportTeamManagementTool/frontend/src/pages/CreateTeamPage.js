import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "../redux/store";
import { createNewTeam } from "../redux/asyncActions";

const CreateTeamPage = ({ navigateTo }) => {
  const dispatch = useDispatch();
  const { loading, error, createTeamSuccess } = useSelector(
    (state) => state.teams
  );
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

  useEffect(() => {
    if (createTeamSuccess) {
      setTimeout(() => {
        navigateTo("dashboard");
      }, 1500);
    }
  }, [createTeamSuccess, navigateTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await createNewTeam(dispatch, {
      name: teamName,
      description: teamDescription,
    });
    if (success) {
      setTeamName("");
      setTeamDescription("");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Create New Team
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Team Name"
            name="name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            variant="outlined"
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Team Description"
            name="description"
            multiline
            rows={4}
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            variant="outlined"
            size="small"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {createTeamSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Team created successfully! Redirecting...
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading || !teamName.trim()}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Team"
            )}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() => navigateTo("dashboard")}
          >
            Cancel
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default CreateTeamPage;
