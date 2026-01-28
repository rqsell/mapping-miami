import   React from "react";

import "../css/home.css";
const Home = () => {
    return (
        <div className="home">
            <span className="welcome">welcome to</span>
            <span className="mapping">MAPPING<br></br> MIAMI</span>
            <span className="button">enter</span>
            <span className="project">A PROJECT BY MIRANDA DE GASPERI & BUEN PROVECHO COLLECTIVE<br></br>WITH SUPPORT FROM 8 80 CITIES & THE KNIGHT FOUNDATION</span>
            <span className="imageBox">
                  <img src="../images/880-white-horizontal.png" alt="880" height="60" />
        <img src="../images/asset-4.png" alt="Asset 4" height="60" />
        <img src="../images/bpc-logo.png" alt="BPC" height="60" />
        <img src="../images/kecc-white.png" alt="Knight" height="60" />
                </span>
        </div>
    );
}
export default Home;
