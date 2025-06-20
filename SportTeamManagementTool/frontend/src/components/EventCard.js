import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";

const EventCard = ({ event, navigateTo }) => {
  const startDate = new Date(event.start_time).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const endDate = event.end_time
    ? new Date(event.end_time).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Grid item xs={12}>
      <Card
        sx={{ p: 2, cursor: "pointer" }}
        onClick={() => navigateTo("teamDetail", { teamId: event.team })}
      >
        <CardContent>
          <Typography variant="h6" component="div">
            {event.title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Team {event.team_name || event.team} | {startDate}{" "}
            {endDate && ` - ${endDate}`}
          </Typography>
          {event.location && (
            <Typography variant="body2" color="text.secondary">
              Location: {event.location}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" noWrap>
            {event.description?.substring(0, 100)}
            {event.description?.length > 100 ? "..." : ""}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default EventCard;
