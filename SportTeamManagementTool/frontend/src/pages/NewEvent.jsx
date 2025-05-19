import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Alert,
} from "reactstrap";

const EventForm = () => {
  const { id } = useParams();
  const [eventType, setEventType] = useState("training");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState(id);
  const [datetime, setDatetime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!title || !description || !team || !datetime) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    let eventData = {
      title,
      description,
      team,
      datetime: datetime,
    };

    let endpoint = "/api/events/"; // Base endpoint
    if (eventType === "training") {
      endpoint += "training/";
    } else if (eventType === "game") {
      endpoint += "game/";
      if (!opponent) {
        setError("Opponent is required for games.");
        setIsLoading(false);
        return;
      }
      eventData.opponent = opponent;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include authorization header if needed (e.g., with a token)
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Attempt to get detailed error
        let errorMessage = `Failed to create event: ${response.status}`;
        if (errorData && errorData.detail) {
          errorMessage += ` - ${errorData.detail}`; // Use detail if available
        } else if (errorData) {
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        }
        throw new Error(errorMessage);
      }

      setSuccess(`Event "${title}" created successfully!`);
      setTitle("");
      setDescription("");
      setTeam("");
      setDatetime("");
      setOpponent("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Create Event</h1>

      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="eventType">Event Type</Label>
          <div className="d-flex gap-2">
            <Button
              type="button"
              color={eventType === "training" ? "primary" : "secondary"}
              onClick={() => setEventType("training")}
              disabled={isLoading}
            >
              Training
            </Button>
            <Button
              type="button"
              color={eventType === "game" ? "primary" : "secondary"}
              onClick={() => setEventType("game")}
              disabled={isLoading}
            >
              Game
            </Button>
          </div>
        </FormGroup>

        <FormGroup>
          <Label for="title">Title</Label>
          <Input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter event title"
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup>
          <Label for="description">Description</Label>
          <Input
            type="textarea"
            name="description"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Enter event description"
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup>
          <Label for="datetime">Date and Time</Label>
          <Input
            type="datetime-local"
            name="datetime"
            id="datetime"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
            placeholder="Select date and time"
            disabled={isLoading}
          />
          <FormText>Select the date and time for the event.</FormText>
        </FormGroup>

        {eventType === "game" && (
          <FormGroup>
            <Label for="opponent">Opponent</Label>
            <Input
              type="text"
              name="opponent"
              id="opponent"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              required
              placeholder="Enter opponent name"
              disabled={isLoading}
            />
          </FormGroup>
        )}

        <Button type="submit" color="primary" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </Form>
    </div>
  );
};

export default EventForm;
