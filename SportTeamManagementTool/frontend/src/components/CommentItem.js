import React from "react";
import { ListItem, ListItemText, Typography } from "@mui/material";

const CommentItem = ({ comment }) => {
  const formattedDate = new Date(comment.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
  return (
    <ListItem alignItems="flex-start">
      <ListItemText
        primary={
          <Typography variant="subtitle2" component="span" sx={{ mr: 1 }}>
            {comment.author.username}
          </Typography>
        }
        secondary={
          <React.Fragment>
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {comment.content}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

export default CommentItem;
