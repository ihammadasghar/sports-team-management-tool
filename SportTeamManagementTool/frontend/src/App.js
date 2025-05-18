import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewPublication from "./pages/NewPublication";
import NewGame from './pages/NewGame';
import NewTraining from './pages/NewTraining';
import TeamDetails from './pages/TeamDetails';
import PublicationDetails from './pages/PublicationDetails';
import Navbar from "./components/Navbar";
import News from './pages/News';
import Schedule from './pages/Schedule';
import PrivateRoute from "./components/PrivateRoute"; // importa o componente protegido

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/news" element={<News />} />

        {/* Rotas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/publications/newpublication" element={<NewPublication />} />
          <Route path="/games/newgame" element={<NewGame />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/publications/:id" element={<PublicationDetails />} />
          <Route path="/trainings/newtraining" element={<NewTraining />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
