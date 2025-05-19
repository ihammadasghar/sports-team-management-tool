import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from "../assets/logo.jpg";

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

    axios
      .get("http://127.0.0.1:8000/api/teams/", {
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
      <header className="dashboard-header">
        <h1>Bem-vindo ao teu Dashboard</h1>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-image">
          <img src={logo} alt="Logo da App" />
        </div>

        <section className="dashboard-info-cards">
          <div className="info-card">
            <h3>Equipas</h3>
            <p>{teams.length}</p>
          </div>
          <div className="info-card">
            <h3>Jogadores</h3>
            <p>
              {teams.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.members.length;
              }, 0)}
            </p>
          </div>
          <div className="info-card">
            <h3>Treinos esta semana</h3>
            <p>5</p>
          </div>
          <div className="info-card">
            <h3>Jogos agendados</h3>
            <p>2</p>
          </div>
        </section>

        <section className="team-list-section">
          <h2>Minhas Equipas</h2>
          {error && <p className="error-message">{error}</p>}
          <ul className="team-list">
            {teams.map((team) => (
              <li
                key={team.id}
                className="team-card"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <h3>{team.name}</h3>
                <p>{team.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 SportsTeam - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
