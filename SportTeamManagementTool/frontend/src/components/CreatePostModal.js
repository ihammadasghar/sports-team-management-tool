import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "../redux/store";
import { createTeamPost } from "../redux/asyncActions";

const CreatePostModal = ({ open, onClose, teamId, onPostCreated }) => {
  const dispatch = useDispatch();
  const { loading, error, createPostSuccess } = useSelector(
    (state) => state.posts
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Reset form fields and errors when modal opens or closes
    if (open) {
      setTitle("");
      setContent("");
      setFormErrors({});
    }
    if (createPostSuccess) {
      onClose();
      if (onPostCreated) {
        onPostCreated();
      }
    }
  }, [open, createPostSuccess, onClose, onPostCreated]);

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = "Title is required.";
    }
    if (!content.trim()) {
      errors.content = "Content is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      // Run validation before dispatching
      return;
    }

    await createTeamPost(dispatch, teamId, { title, content });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Post</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate>
          {" "}
          {/* Add noValidate to prevent browser's default validation */}
          <TextField
            autoFocus
            margin="dense"
            label="Post Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFormErrors((prev) => ({ ...prev, title: "" }));
            }} // Clear error on change
            error={!!formErrors.title} // Set error prop based on validation
            helperText={formErrors.title} // Display helper text for error
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Post Content"
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setFormErrors((prev) => ({ ...prev, content: "" }));
            }} // Clear error on change
            error={!!formErrors.content} // Set error prop based on validation
            helperText={formErrors.content} // Display helper text for error
          />
          {error && ( // Backend errors
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create Post"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostModal;
