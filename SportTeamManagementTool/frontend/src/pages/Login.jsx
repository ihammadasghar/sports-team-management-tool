import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Autenticar e obter tokens
      const res = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res);

      const access = res.data.access;
      const refresh = res.data.refresh;

      // 2. Guardar tokens
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // 3. Buscar dados do utilizador autenticado
      const userRes = await axios.get("http://127.0.0.1:8000/api/me/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const user = userRes.data;

      // 4. Guardar dados do utilizador
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role); // trainer, athlete, member
      if (user.role === "athlete")
        localStorage.setItem("athleteTeam", user.team_id);

      // 5. Redirecionar para o dashboard
      window.location.reload();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Credenciais inválidas.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
