import './App.css';
import About from './pages/About.js';
import Navbar from './pages/Navbar.js';
import ItemAdd from './pages/ItemAdd.js';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MapBoxMiami from "./pages/MapBoxMiami.js";
import "mapbox-gl/dist/mapbox-gl.css";


function App() {
  return (
      <div style={{ height: "100vh", width: "100%" }}>
  <Router>
      <Navbar />
      <div style={{ minHeight: "100vh" }}>
        <Routes>
          <Route path="/" element={<MapBoxMiami />} />
          <Route path="/about" element={<About />} />
          <Route path="/add-item" element={<ItemAdd />} />
        </Routes>
      </div>
    </Router>
    </div>
   
  );
}

export default App;
 
