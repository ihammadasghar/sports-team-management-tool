import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewPublication from "./pages/NewPublication";
import NewGame from "./pages/NewGame";
import NewTraining from "./pages/NewTraining";
import TeamDetails from "./pages/TeamDetails";
import PublicationDetails from "./pages/PublicationDetails";
import Navbar from "./components/Navbar";
import News from "./pages/News";
import Schedule from "./pages/Schedule";
<<<<<<< Updated upstream
import PrivateRoute from "./components/PrivateRoute";
import { Fragment } from "react";

function AppWrapper() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";
=======
import PrivateRoute from "./components/PrivateRoute"; // importa o componente protegido
import SignUp from './pages/SignUp';
>>>>>>> Stashed changes

  return (
    <Fragment>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/news" element={<News />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/games/newgame" element={<NewGame />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/teams/:id/publications/new" element={<NewPublication />} />
          <Route path="/publications/:id" element={<PublicationDetails />} />
          <Route path="/trainings/newtraining" element={<NewTraining />} />
        </Route>
      </Routes>
    </Fragment>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
