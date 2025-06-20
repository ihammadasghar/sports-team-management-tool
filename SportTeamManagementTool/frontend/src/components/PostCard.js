import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";

const PostCard = ({ post, navigateTo }) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString(
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
    <Grid item xs={12}>
      <Card
        sx={{ p: 2, cursor: "pointer" }}
        onClick={() =>
          navigateTo("postDetail", { teamId: post.team, postId: post.id })
        }
      >
        <CardContent>
          <Typography variant="h6" component="div">
            {post.title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            By {post.author.username} from{" "}
            {post.team_name || `Team ${post.team}`} on {formattedDate}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {post.content.substring(0, 100)}
            {post.content.length > 100 ? "..." : ""}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default PostCard;
