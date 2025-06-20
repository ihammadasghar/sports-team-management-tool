import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useDispatch, useSelector, StoreProvider } from "./redux/store"; // Import StoreProvider here
import { logoutUser } from "./redux/asyncActions";
import Header from "./components/Header";
import AuthGuard from "./components/AuthGuard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import PostDetailPage from "./pages/PostDetailPage";
import CreateTeamPage from "./pages/CreateTeamPage";
import { theme } from "./theme/muiTheme";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [pageParams, setPageParams] = useState({}); // To pass IDs to detail pages

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Set initial page based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("login");
    }
  }, [isAuthenticated]);

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  const handleLogout = () => {
    logoutUser(dispatch);
    handleNavigate("login");
  };

  const handleCreateTeamClick = () => {
    handleNavigate("createTeam");
  };

  let PageComponent;
  switch (currentPage) {
    case "login":
      PageComponent = <LoginPage navigateTo={handleNavigate} />;
      break;
    case "register":
      PageComponent = <RegisterPage navigateTo={handleNavigate} />;
      break;
    case "dashboard":
      PageComponent = (
        <AuthGuard
          isAuthenticated={isAuthenticated}
          navigateTo={handleNavigate}
        >
          <DashboardPage navigateTo={handleNavigate} />
        </AuthGuard>
      );
      break;
    case "teamDetail":
      PageComponent = (
        <AuthGuard
          isAuthenticated={isAuthenticated}
          navigateTo={handleNavigate}
        >
          <TeamDetailPage
            teamId={pageParams.teamId}
            navigateTo={handleNavigate}
          />
        </AuthGuard>
      );
      break;
    case "postDetail":
      PageComponent = (
        <AuthGuard
          isAuthenticated={isAuthenticated}
          navigateTo={handleNavigate}
        >
          <PostDetailPage
            teamId={pageParams.teamId}
            postId={pageParams.postId}
            navigateTo={handleNavigate}
          />
        </AuthGuard>
      );
      break;
    case "createTeam":
      PageComponent = (
        <AuthGuard
          isAuthenticated={isAuthenticated}
          navigateTo={handleNavigate}
        >
          <CreateTeamPage navigateTo={handleNavigate} />
        </AuthGuard>
      );
      break;
    default:
      PageComponent = <LoginPage navigateTo={handleNavigate} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header
        isAuthenticated={isAuthenticated}
        username={user?.username}
        onLogout={handleLogout}
        onCreateTeamClick={handleCreateTeamClick}
      />
      {PageComponent}
    </ThemeProvider>
  );
}

// Wrap the App with the StoreProvider
// This is exported as default so index.js can use it
export default function AppWrapper() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}
