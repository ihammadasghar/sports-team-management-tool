import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewPublication from "./pages/NewPublication";
import NewGame from './pages/NewGame';
import NewTraining from './pages/NewTraining';
import TeamDetails from './pages/TeamDetails';
import PublicationDetails from './pages/PublicationDetails';
import Navbar from "./components/Navbar";

function App() {
  return (
    
    <Router>
       <Navbar />
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/publications/newpublication" element={<NewPublication />} />
          <Route path="/games/newgame" element={<NewGame />} />
           <Route path="/teams/:id" element={<TeamDetails />} />
             <Route path="/publications/:id" element={<PublicationDetails />} />
           <Route path="/trainings/newtraining" element={<NewTraining />} />
      </Routes>
    </Router>
  );
}

export default App;
