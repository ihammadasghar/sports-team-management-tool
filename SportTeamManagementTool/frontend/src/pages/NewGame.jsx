import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './NewGame.css';

function NewGame() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opponent, setOpponent] = useState("");
  const [datetime, setDatetime] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("accessToken");
    const teamId = localStorage.getItem("teamId");

    if (!token || !teamId) {
      setError("Token de acesso ou ID da equipa não encontrado.");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/teams/${teamId}/games/`,
        {
          title,
          description,
          opponent,
          datetime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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

        <button type="submit" className="submit-button">Criar Jogo</button>
      </form>
    </div>
  );
}

export default NewGame;
