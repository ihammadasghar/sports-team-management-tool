import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("username");
    const id = localStorage.getItem("userId");
    if (user) setUsername(user);
    if (id) setUserId(id);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          SportsTeam
        </Link>
        <Link to="/" className="navbar-link">Menu</Link>
        <Link to="/news" className="navbar-link">Notícias</Link>

        {/* Links que precisam do userId */}
        {userId && (
          <>
            <Link to={`/teams/${userId}`} className="navbar-link">Minhas Equipas</Link>
            <Link to={`/publications/${userId}`} className="navbar-link">Publicações</Link>
            <Link to={`/games/${userId}`} className="navbar-link">Jogos</Link>
            <Link to={`/trainings/${userId}`} className="navbar-link">Treinos</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {username && <span className="navbar-user">Olá, {username}</span>}
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
