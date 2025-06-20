import React, { useEffect, useCallback } from "react";
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
import { fetchPostDetail } from "../redux/asyncActions";
import CommentForm from "../components/CommentForm";
import CommentItem from "../components/CommentItem";

const PostDetailPage = ({ teamId, postId, navigateTo }) => {
  const dispatch = useDispatch();
  const { postDetail, comments, loading, error } = useSelector(
    (state) => state.posts
  );
  const { user } = useSelector((state) => state.auth);

  const fetchData = useCallback(() => {
    fetchPostDetail(dispatch, teamId, postId);
  }, [dispatch, teamId, postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !postDetail) {
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
          Loading Post Details...
        </Typography>
      </Box>
    );
  }

  if (error || !postDetail) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Post</AlertTitle>
          {error || "Post not found or you don't have access."}
          <Button onClick={() => navigateTo("dashboard")} sx={{ ml: 2 }}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  const formattedDate = new Date(postDetail.created_at).toLocaleDateString(
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        variant="outlined"
        sx={{ mb: 3 }}
        onClick={() => navigateTo("dashboard")}
      >
        &larr; Back to Dashboard
      </Button>
      <Card sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {postDetail.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          By {postDetail.author.username} on {formattedDate}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {postDetail.content}
        </Typography>
      </Card>

      <Typography variant="h5" gutterBottom>
        Comments ({comments.length})
      </Typography>
      {comments.length > 0 ? (
        <List sx={{ bgcolor: "background.paper", borderRadius: 3, py: 0 }}>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <CommentItem comment={comment} />
              {index < comments.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No comments yet. Be the first to comment!
        </Typography>
      )}

      {user && (
        <CommentForm
          teamId={teamId}
          postId={postId}
          onCommentAdded={fetchData}
        />
      )}
    </Container>
  );
};

export default PostDetailPage;
