import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./NewPublication.css"; // Importa o CSS
import { getCurrentDateFormatted } from "../utils/utils";

function NewPublication() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const teamId = id;
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("text", text);
      formData.append("team", teamId);
      formData.append("date_published", getCurrentDateFormatted());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post("http://127.0.0.1:8000/api/publications/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/dashboard");
    } catch (err) {
      setError("Erro ao criar a publicação.");
      console.error(err);
    }
  };

  return (
    <div className="new-publication-container">
      <h2>Nova Publicação</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Texto:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Criar
        </button>
      </form>
    </div>
  );
}

export default NewPublication;
