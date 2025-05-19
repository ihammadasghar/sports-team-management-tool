import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from "../assets/logo.jpg";

function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("");
  const [athleteTeam, setAthleteTeam] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("username");
    const id = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const athleteTeam = localStorage.getItem("athleteTeam");

    if (user) setUsername(user);
    if (id) setUserId(id);
    if (role) setRole(role);
    if (athleteTeam) setAthleteTeam(athleteTeam);
  }, []);

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

  console.log("Team:", athleteTeam);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {role == "trainer" ? <h1>Welcome trainer {username}!</h1> : <></>}
        {role == "athlete" ? <h1>Welcome athlete {username}!</h1> : <></>}
        {role == "member" ? <h1>Welcome member {username}!</h1> : <></>}
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
          {role == "trainer" ? (
            <>
              <h2>Teams you manage</h2>
              <ul className="team-list">
                {teams.map((team) => {
                  if (team.trainer.id == userId) {
                    return (
                      <li
                        key={team.id}
                        className="team-card"
                        onClick={() => navigate(`/teams/${team.id}`)}
                      >
                        <h3>{team.name}</h3>
                        <h4>Number of members: {team.members.length}</h4>
                        <p>{team.description}</p>
                      </li>
                    );
                  }
                })}
              </ul>
            </>
          ) : (
            <></>
          )}
          {role == "athlete" ? (
            <>
              <h2>Your Team</h2>
              <ul className="team-list">
                {teams.map((team) => {
                  if (team.id == athleteTeam) {
                    return (
                      <li
                        key={team.id}
                        className="team-card"
                        onClick={() => navigate(`/teams/${team.id}`)}
                      >
                        <h3>{team.name}</h3>
                        <h4>Number of members: {team.members.length}</h4>
                        <p>{team.description}</p>
                      </li>
                    );
                  }
                })}
              </ul>
            </>
          ) : (
            <></>
          )}
          {role == "member" ? (
            <>
              <h2>Teams you support</h2>
              <ul className="team-list">
                {teams.map((team) => {
                  if (team.members.includes(userId)) {
                    return (
                      <li
                        key={team.id}
                        className="team-card"
                        onClick={() => navigate(`/teams/${team.id}`)}
                      >
                        <h3>{team.name}</h3>
                        <h4>Number of members: {team.members.length}</h4>
                        <p>{team.description}</p>
                      </li>
                    );
                  }
                })}
              </ul>
            </>
          ) : (
            <></>
          )}
          {error && <p className="error-message">{error}</p>}
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 SportsTeam - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
