import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "../redux/store";
import { loginUser } from "../redux/asyncActions";

const LoginPage = ({ navigateTo }) => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigateTo("dashboard");
    }
  }, [isAuthenticated, navigateTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await loginUser(dispatch, { username, password });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            size="small"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link
                href="#"
                variant="body2"
                onClick={() => navigateTo("register")}
              >
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Container>
  );
};

export default LoginPage;
