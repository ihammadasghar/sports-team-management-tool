import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import './TeamDetails.css';

function TeamDetails() {
  const { id } = useParams(); // id da equipa via URL
  const [publications, setPublications] = useState([]);
  const [events, setEvents] = useState([]);
  const [isTrainer, setIsTrainer] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }

    // Fetch publications
    axios.get(`http://localhost:8000/teams/${id}/publications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPublications(res.data))
    .catch(() => setError("Erro ao carregar publicações"));

    // Fetch events (jogos e treinos)
    axios.get(`http://localhost:8000/teams/${id}/trainings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(resTrainings => {
      axios.get(`http://localhost:8000/teams/${id}/games`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(resGames => {
        setEvents([...resTrainings.data, ...resGames.data].sort((a,b) => new Date(a.datetime) - new Date(b.datetime)));
      })
      .catch(() => setError("Erro ao carregar jogos"));
    })
    .catch(() => setError("Erro ao carregar treinos"));

    // Verificar se és treinador (simplificado, podes buscar do backend ou token)
    // Exemplo: token payload tem 'role' ou consultamos endpoint user info
    // Aqui vamos assumir que o backend devolve no token ou que sabes por outro modo
    // Por enquanto, habilita o botão manualmente
    setIsTrainer(true);  // TODO: substituir por lógica real
  }, [id, navigate]);

  return (
    <div className="team-details-container">
      <h2>Detalhes da Equipa</h2>
      {error && <p className="error-message">{error}</p>}

      {isTrainer && (
        <div className="actions">
          <Link to={`/teams/${id}/publications/new`} className="btn">Nova Publicação</Link>
          <Link to={`/teams/${id}/events/new`} className="btn">Novo Evento</Link>
        </div>
      )}

      <section>
        <h3>Publicações</h3>
        {publications.length === 0 ? (
          <p>Sem publicações para esta equipa.</p>
        ) : (
          <ul className="publication-list">
            {publications.map(pub => (
              <li key={pub.id} className="publication-item">
                <h4>{pub.title}</h4>
                <p>{pub.text}</p>
                <small>Publicado em: {new Date(pub.date_published).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Eventos (Treinos e Jogos)</h3>
        {events.length === 0 ? (
          <p>Sem eventos agendados para esta equipa.</p>
        ) : (
          <ul className="event-list">
            {events.map(event => (
              <li key={event.id} className="event-item">
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p><strong>Data:</strong> {new Date(event.datetime).toLocaleString()}</p>
                {"opponent" in event && <p><strong>Adversário:</strong> {event.opponent}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default TeamDetails;
