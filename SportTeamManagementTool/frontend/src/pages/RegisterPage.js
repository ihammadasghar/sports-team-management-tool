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
  AlertTitle,
} from "@mui/material";
import { useDispatch, useSelector } from "../redux/store";
import { registerUser } from "../redux/asyncActions";

const RegisterPage = ({ navigateTo }) => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigateTo("dashboard");
    }
  }, [isAuthenticated, navigateTo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await registerUser(dispatch, formData);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            name="password2"
            type="password"
            value={formData.password2}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Registration Error</AlertTitle>
              {typeof error === "object" ? (
                <ul>
                  {Object.entries(error).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong>{" "}
                      {Array.isArray(value) ? value.join(", ") : value}
                    </li>
                  ))}
                </ul>
              ) : (
                error
              )}
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
              "Sign Up"
            )}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link
                href="#"
                variant="body2"
                onClick={() => navigateTo("login")}
              >
                {"Already have an account? Sign In"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Container>
  );
};

export default RegisterPage;
