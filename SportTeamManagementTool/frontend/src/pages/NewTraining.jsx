import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './NewTraining.css';

function NewTraining() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [datetime, setDatetime] = useState("");
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedId = localStorage.getItem("teamId");
    if (storedId) setTeamId(storedId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("accessToken");

    if (!token || !teamId) {
      setError("Token ou ID da equipa não encontrado.");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/teams/${teamId}/trainings/`,
        { title, description, datetime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/dashboard");
    } catch (err) {
      setError("Erro ao criar o treino.");
      console.error(err);
    }
  };

  return (
    <div className="new-training-container">
      <h2>Novo Treino</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Descrição:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
        </div>
        <div className="form-group">
          <label>Data e Hora:</label>
          <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>ID da Equipa:</label>
          <input type="number" value={teamId} readOnly />
        </div>
        <button type="submit" className="submit-button">Criar Treino</button>
      </form>
    </div>
  );
}

export default NewTraining;
