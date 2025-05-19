import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./PublicationDetails.css";
import { getCurrentDateFormatted } from "../utils/utils";

function PublicationDetails() {
  const { id } = useParams();
  const [publication, setPublication] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(`http://127.0.0.1:8000/api/publications/${id}`, { headers })
      .then((res) => setPublication(res.data))
      .catch(() => setError("Erro ao carregar publicação"))
      .finally(() => setLoading(false));

    axios
      .get(`http://127.0.0.1:8000/api/publications/${id}/comments`, { headers })
      .then((res) => setComments(res.data))
      .catch(() => setError("Erro ao carregar comentários"));
  }, [id, token]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/comments/`,
        {
          text: newComment,
          publication_id: id,
          date_published: getCurrentDateFormatted(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get(
        `http://127.0.0.1:8000/api/publications/${id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data);
      setNewComment("");
    } catch {
      setError("Erro ao adicionar comentário.");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!publication) return <p>Publicação não encontrada.</p>;

  return (
    <div className="publication-details-container">
      <h2>{publication.title}</h2>
      <p>{publication.text}</p>
      <small>
        Publicado em:{" "}
        {new Date(publication.date_published).toLocaleDateString()}
      </small>

      <section className="comments-section">
        <h3>Comentários</h3>
        {comments.length === 0 && <p>Sem comentários.</p>}
        <ul>
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <p>{comment.text}</p>
              <small>Por: {comment.author.username || "Anónimo"}</small>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            rows={3}
            placeholder="Escreve um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button type="submit">Adicionar Comentário</button>
        </form>
      </section>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default PublicationDetails;
