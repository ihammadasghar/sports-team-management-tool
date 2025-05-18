import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './NewGame.css';

function NewGame() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opponent, setOpponent] = useState("");
  const [datetime, setDatetime] = useState("");
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        `http://localhost:8000/teams/${teamId}/games/`,
        {
          title,
          description,
          opponent,
          datetime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/dashboard");
    } catch (err) {
      setError("Erro ao criar o jogo.");
      console.error(err);
    }
  };

  return (
    <div className="new-game-container">
      <h2>Novo Jogo</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título do Jogo:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label>Adversário:</label>
          <input
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Data e Hora:</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>ID da Equipa:</label>
          <input
            type="number"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">Criar Jogo</button>
      </form>
    </div>
  );
}

export default NewGame;
