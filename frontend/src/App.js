import './App.css';
import Home from './pages/Home.js';
import About from './pages/About.js';
import Navbar from './pages/Navbar.js';
import ItemAdd from './pages/ItemAdd.js';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapBoxMiami from "./pages/MapBoxMiami.js";
import "mapbox-gl/dist/mapbox-gl.css";


function App() {
  return (
  <Router>
      <Navbar />
        <Routes>

          <Route path="/" element={<Home />} />
         <Route path="/map" element={<MapBoxMiami />} />
          <Route path="/about" element={<About />} />
          <Route path="/add-item" element={<ItemAdd />} />
        </Routes>
      
    </Router>

   
  );
}

export default App;
 
