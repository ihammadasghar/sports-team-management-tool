import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './SignUp.css';

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("athlete");
  const [teamId, setTeamId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [height, setHeight] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let endpoint = "";
    if (role === "athlete") endpoint = "/api/register/athlete/";
    else if (role === "trainer") endpoint = "/api/register/trainer/";
    else if (role === "member") endpoint = "/api/register/member/";

    const userData = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      password,
    };

    const data =
      role === "athlete"
        ? {
            user: userData,
            team_id: parseInt(teamId),
            birth_date: birthDate,
            height: parseFloat(height),
          }
        : { user: userData };

    try {
      const res = await axios.post(`http://127.0.0.1:8000${endpoint}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      localStorage.setItem("username", username);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", res.data.id);

      setSuccess("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Erro ao criar conta.");
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Criar Conta</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Utilizador:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="athlete">Atleta</option>
            <option value="trainer">Treinador</option>
            <option value="member">Sócio</option>
          </select>
        </div>

        <div className="form-group">
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Primeiro Nome:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Último Nome:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {role === "athlete" && (
          <>
            <div className="form-group">
              <label>ID da Equipa:</label>
              <input type="number" value={teamId} onChange={(e) => setTeamId(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Data de Nascimento:</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Altura (em metros):</label>
              <input type="number" step="0.01" value={height} onChange={(e) => setHeight(e.target.value)} required />
            </div>
          </>
        )}

        <button type="submit" className="submit-button">Criar Conta</button>
      </form>
    </div>
  );
}

export default SignUp;
