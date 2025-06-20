import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Add as AddIcon, Logout as LogoutIcon } from "@mui/icons-material";

const Header = ({ onLogout, onCreateTeamClick, isAuthenticated, username }) => {
  return (
    <AppBar
      position="static"
      color="primary"
      sx={{ borderRadius: "0 0 16px 16px", mb: 4 }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sport Team Management App {username ? `(${username})` : ""}
        </Typography>
        {isAuthenticated && (
          <Box>
            <Button
              color="inherit"
              onClick={onCreateTeamClick}
              startIcon={<AddIcon />}
            >
              Create Team
            </Button>
            <Button
              color="inherit"
              onClick={onLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
