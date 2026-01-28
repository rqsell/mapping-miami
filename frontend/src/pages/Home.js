import   React from "react";
import asset4 from "../images/asset-4.jpg";
import bpc from "../images/bpc-logo.png";
import kecc from "../images/kecc-white.png";
import eight80 from "../images/880-white-horizontal.png";   
import "../css/home.css";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="home">
            <span className="welcome">welcome to</span>
            <span className="mapping">
                <span>MAPPING</span>
                <span style={{ fontSize: "1.4em" }}>MIAMI</span> 
                </span>
  <Link to="/map" > <span className="button"><span className="letter">e</span><span className="letter">n</span><span className="letter">t</span><span className="letter">e</span> <span className="letter">r</span>          </span>
</Link>
            <span className="project">A PROJECT BY MIRANDA DE GASPERI & BUEN PROVECHO COLLECTIVE<br></br>WITH SUPPORT FROM 8 80 CITIES & THE KNIGHT FOUNDATION</span>
            <span className="imageBox">
                  <img src={eight80} alt="880" height="60" />
        <img src={bpc} alt="BPC" height="60" />
        <img src={kecc} alt="Knight" height="60" />
                </span>
        </div>
    );
}
export default Home;
