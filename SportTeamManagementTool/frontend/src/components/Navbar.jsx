import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("username");
    const id = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (user) setUsername(user);
    if (id) setUserId(id);
    if (role) setRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">SportsTeam</Link>
        <Link to="/" className="navbar-link">Menu</Link>
        <Link to="/news" className="navbar-link">Notícias</Link>
        <Link to="/schedule" className="navbar-link">Horários</Link>

        {userId && (
          <>
            <Link to={`/myteams`} className="navbar-link">
              Minhas Equipas
            </Link>

            {role === "trainer" && (
              <>
                <Link to={`/trainings/${userId}`} className="navbar-link">
                  Treinos
                </Link>
                <Link to={`/games/${userId}`} className="navbar-link">
                  Jogos
                </Link>
                <Link to={`/publications/${userId}`} className="navbar-link">
                  Publicações
                </Link>
              </>
            )}

            {role === "member" && (
              <Link to={`/publications/${userId}`} className="navbar-link">
                Conteúdo
              </Link>
            )}
          </>
        )}
      </div>

      <div className="navbar-right">
        {username ? (
          <>
            <span className="navbar-user">Olá, {username}</span>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/signup" className="navbar-link">Criar Conta</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
