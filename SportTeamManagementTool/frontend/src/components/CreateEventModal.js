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
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "../redux/store";
import { createTeamEvent } from "../redux/asyncActions";

const CreateEventModal = ({ open, onClose, teamId, onEventCreated }) => {
  const dispatch = useDispatch();
  const { loading, error, createEventSuccess } = useSelector(
    (state) => state.events
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [formErrors, setFormErrors] = useState({}); // New state for form validation errors

  useEffect(() => {
    // Reset form fields and errors when modal opens or closes
    if (open) {
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setFormErrors({});
    }
    if (createEventSuccess) {
      onClose(); // Close modal on success
      if (onEventCreated) {
        onEventCreated(); // Trigger data refresh in parent
      }
    }
  }, [open, createEventSuccess, onClose, onEventCreated]);

  // Helper to get current datetime in YYYY-MM-DDTHH:MM format for TextField type="datetime-local"
  const getLocalDateTime = () => {
    const now = new Date();
    // Adjust for local timezone offset to ensure 'min' attribute reflects local time
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const validateForm = () => {
    const errors = {};
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    if (!title.trim()) {
      errors.title = "Event title is required.";
    }
    if (!startTime) {
      errors.startTime = "Start time is required.";
    } else {
      const startDateTime = new Date(startTime);
      if (startDateTime < now) {
        errors.startTime = "Start time cannot be in the past.";
      }
    }

    if (endTime) {
      if (!startTime) {
        errors.endTime = "End time requires a start time.";
      } else {
        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);
        if (endDateTime < startDateTime) {
          errors.endTime = "End time cannot be before start time.";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      // Run validation before dispatching
      return;
    }

    const eventData = {
      title,
      description: description.trim() || null,
      start_time: startTime,
      end_time: endTime.trim() || null,
      location: location.trim() || null,
    };

    await createTeamEvent(dispatch, teamId, eventData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Event</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate>
          {" "}
          {/* Add noValidate to prevent browser's default validation */}
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            type="text"
            fullWidth
            required
            variant="outlined"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFormErrors((prev) => ({ ...prev, title: "" }));
            }}
            error={!!formErrors.title}
            helperText={formErrors.title}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Start Time"
            type="datetime-local"
            fullWidth
            required
            variant="outlined"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setFormErrors((prev) => ({ ...prev, startTime: "" }));
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: getLocalDateTime(), // Set minimum selectable date to now
            }}
            error={!!formErrors.startTime}
            helperText={formErrors.startTime}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="End Time (Optional)"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setFormErrors((prev) => ({ ...prev, endTime: "" }));
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: startTime || getLocalDateTime(), // End time cannot be before start time or now
            }}
            error={!!formErrors.endTime}
            helperText={formErrors.endTime}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Location (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            "Create Event"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEventModal;
