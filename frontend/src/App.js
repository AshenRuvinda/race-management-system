import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Admin/Dashboard';
import RaceControl from './pages/Admin/RaceControl';
import RaceCreate from './pages/Admin/RaceCreate';
import OwnerDashboard from './pages/Owner/OwnerDashboard';
import TeamRegister from './pages/Owner/TeamRegister';
import AddRacers from './pages/Owner/AddRacers';
import LiveRace from './pages/Viewer/LiveRace';


function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/race-control/:raceId" element={<RaceControl />} />
          <Route path="/admin/race-create" element={<RaceCreate />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/team-register" element={<TeamRegister />} />
          <Route path="/owner/add-racers" element={<AddRacers />} />
          <Route path="/live/:raceId" element={<LiveRace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;