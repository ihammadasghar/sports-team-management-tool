import React, { useState } from "react";
import {
  Card,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "../redux/store";
import { addComment } from "../redux/asyncActions";

const CommentForm = ({ teamId, postId, onCommentAdded }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.posts);
  const [commentContent, setCommentContent] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage(null);
    if (!commentContent.trim()) return;

    const success = await addComment(dispatch, teamId, postId, commentContent);
    if (success) {
      setCommentContent("");
      setSuccessMessage("Comment added successfully!");
      if (onCommentAdded) {
        onCommentAdded();
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <Card sx={{ p: 3, mt: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add a Comment
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Your Comment"
          variant="outlined"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !commentContent.trim()}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Submit Comment"
          )}
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMessage}
        </Alert>
      )}
    </Card>
  );
};

export default CommentForm;
