import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./TeamDetails.css";

function TeamDetails() {
  const { id } = useParams();
  const [publications, setPublications] = useState([]);
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState(null);
  const [isTrainer, setIsTrainer] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`http://127.0.0.1:8000/api/teams/${id}`, { headers })
      .then((res) => setTeam(res.data))
      .catch(() => setError("Erro ao carregar publicações"));

    axios
      .get(`http://127.0.0.1:8000/api/teams/${id}/publications`, { headers })
      .then((res) => setPublications(res.data))
      .catch(() => setError("Erro ao carregar publicações"));

    axios
      .get(`http://127.0.0.1:8000/api/teams/${id}/trainings`, { headers })
      .then((resTrainings) => {
        axios
          .get(`http://127.0.0.1:8000/api/teams/${id}/games`, { headers })
          .then((resGames) => {
            const all = [...resTrainings.data, ...resGames.data].sort(
              (a, b) => new Date(a.datetime) - new Date(b.datetime)
            );
            setEvents(all);
          })
          .catch(() => setError("Erro ao carregar jogos"));
      })
      .catch(() => setError("Erro ao carregar treinos"));

    setIsTrainer(true); // Substituir por lógica real se necessário
  }, [id, navigate]);

  return (
    <div className="team-details-container">
      <h2>Team details</h2>
      {error && <p className="error-message">{error}</p>}

      {isTrainer && (
        <div className="actions">
          <Link to={`/teams/${id}/publications/new`} className="btn">
            Nova Publicação
          </Link>
          <Link to={`/teams/${id}/events/new`} className="btn">
            Novo Evento
          </Link>
        </div>
      )}

      <div className="content-columns">
          <section className="column">
            <h3>Publications by the trainer {team?.trainer_name || ""}</h3>
            {publications.length === 0 ? (
              <p>Sem publicações para esta equipa.</p>
            ) : (
              <ul className="publication-list">
                {publications.map((pub) => (
                  <li
                    key={pub.id}
                    className="publication-item"
                    onClick={() => navigate(`/publications/${pub.id}`)}
                  >
                    <h4>{pub.title}</h4>
                    <p>{pub.text}</p>
                    <small>
                      Publicado em:{" "}
                      {new Date(pub.date_published).toLocaleDateString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="column">
            <h3>Eventos (Treinos e Jogos)</h3>
            {events.length === 0 ? (
              <p>Sem eventos agendados para esta equipa.</p>
            ) : (
              <ul className="event-list">
                {events.map((event) => (
                  <li key={event.id} className="event-item">
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                    <p>
                      <strong>Data:</strong>{" "}
                      {new Date(event.datetime).toLocaleString()}
                    </p>
                    {"opponent" in event && (
                      <p>
                        <strong>Adversário:</strong> {event.opponent}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

    </div>
  );
}

export default TeamDetails;
