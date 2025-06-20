import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";

const TeamCard = ({ team, currentUserId, navigateTo }) => {
  const membership = team.memberships.find((m) => m.user.id === currentUserId);
  const role = membership ? membership.role_display : "Not a member";

  const isTrainer = team.trainer && team.trainer.id === currentUserId;

  const getCardTitle = () => {
    if (isTrainer) return `${team.name} (Trainer)`;
    if (membership) return `${team.name} (${role})`;
    return team.name;
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2,
          cursor: "pointer",
        }}
        onClick={() => navigateTo("teamDetail", { teamId: team.id })}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {getCardTitle()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {team.description || "No description provided."}
          </Typography>
          {team.trainer && team.trainer.id !== currentUserId && (
            <Typography variant="caption" color="text.secondary" mt={1}>
              Trainer: {team.trainer.username}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default TeamCard;
