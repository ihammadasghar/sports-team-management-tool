import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/");
      return;
    }

    axios.get("http://localhost:8000/teams/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      setTeams(res.data);
    })
    .catch((err) => {
      console.error(err);
      setError("Erro ao carregar equipas.");
    });
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h1>Minhas Equipas</h1>
      {error && <p className="error-message">{error}</p>}
      <ul className="team-list">
        {teams.map((team) => (
          <li key={team.id} className="team-card">
            <h3>{team.name}</h3>
            <p>{team.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
