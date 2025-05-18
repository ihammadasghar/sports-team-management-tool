import { useEffect, useState } from "react";
import axios from "axios";
import './Schedule.css';

function Schedule() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const teamId = localStorage.getItem("teamId");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token || !teamId) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`http://127.0.0.1:8000/api/teams/${teamId}/trainings`, { headers }),
      axios.get(`http://127.0.0.1:8000/api/teams/${teamId}/games`, { headers })
    ])
      .then(([resTrainings, resGames]) => {
        const allEvents = [
          ...resTrainings.data.map(e => ({ ...e, type: "Treino" })),
          ...resGames.data.map(e => ({ ...e, type: "Jogo" })),
        ];
        setEvents(allEvents);
      })
      .catch(() => setError("Erro ao carregar os horários."));
  }, [teamId, token]);

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const horas = Array.from({ length: 14 }, (_, i) => i + 8);

  const getEventsForCell = (dia, hora) =>
    events.filter(event => {
      const d = new Date(event.datetime);
      return d.getDay() === dia && d.getHours() === hora;
    });

  return (
    <div className="schedule-grid-container">
      <h1>Horários da Semana</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="schedule-grid">
        <div className="grid-header empty"></div>
        {diasSemana.map((dia, i) => <div key={i} className="grid-header">{dia}</div>)}

        {horas.map((hora, rowIndex) => (
          <>
            <div key={`h-${hora}`} className="grid-hour">{hora}:00</div>
            {diasSemana.map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="grid-cell">
                {getEventsForCell(colIndex, hora).map(event => (
                  <div key={event.id} className={`grid-event ${event.type === "Jogo" ? "game" : "training"}`}>
                    <strong>{event.title}</strong><br />{event.type}
                  </div>
                ))}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

export default Schedule;
