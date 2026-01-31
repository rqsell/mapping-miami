import React from "react";
import bpc from "../images/bpc-logo.png";
import kecc from "../images/kecc-white.png";
import eight80 from "../images/880-white-horizontal.png";   
import "../css/about.css";


const About = () => {
  return (
    <div style={{ padding: "2rem", margin: "0 auto", backgroundColor: "#C6BB99", color: "white", fontFamily: 'IBM Plex Mono, monospace', alignSelf: "center" }}>
      <p style={{    display: "flex", flexDirection: "column", padding:"0 20%" }}>
        <span style={{backgroundColor:"#86A2AA", padding:"1em",  borderRadius: "24px",  textAlign: "center"}}>Mapping Miami is a participatory digital archiving project. Centered on lived experience and celebrating Miamians’ own perspectives, Mapping Miami uses art and technology to preserve the stories of a rapidly changing city. </span>

<span style={{ fontFamily: 'AdvinePixel-Regular',  fontSize: '2.5em'}}>Miami is changing 
  <span style={{fontFamily:'AdvinePixel-Outline',  marginLeft: "1.5%" }}>fast.</span>
  </span> 


<span className="mainText">
Anyone who lives in the city, no matter how long, can attest to its constant shapeshifting, metamorphizing, and cannibalizing patterns. Subject to change through urban overdevelopment, gentrification, the far-reaching effects of climate change, and even positive development, the city's landscape is constantly changing.

The idea behind Mapping Miami is two-fold: one, to preserve the soul of our communities by celebrating personal stories and building an evolving cultural archive shaped by its people. Two, to use this archive as a blueprint for what Miamians value most as we chart the future of the city into a sustainable, equitable, and undeniably Miami one. 

Through pop-up workshops across Miami, participants create visual responses tied to places in the city that are meaningful to them, each one co-led by a different artist or expert to guide the experience. The art is then uploaded to this interactive map to become part of a community-driven & collaborative archive of Miami’s cultural memory. 
</span>

<span>
Visit Buen Provecho Collective's Instagram or website to find the next workshop near you and map your Miami. 
</span>

<span className="mainText">
Mapping Miami is a project by Miranda De Gasperi, supported by 8 80 Cities, the Knight Foundation, and Buen Provecho Collective. We are endlessly grateful for the institutional support that has made this project possible, and to the artists and experts that generously helped facilitate workshops and shared their expertise. For more information on each workshop visit <a href="https://buenprovechocollective.com" target="_blank">buenprovechocollective.com. </a>
<br></br>
<br></br>

<br></br>


About Miranda:
<br></br>
<br></br>
<br></br>

Miranda De Gasperi is a Peruvian-born, Miami-based interdisciplinary artist and educator, founder & director of BPC. Her lens is shaped by immigration, memory, and cultural heritage.
<br></br>
<br></br>

With a background in environmental science and GIS, the concept for Mapping Miami was born at the intersection of spatial data tools and her profound love, appreciation, and respect for the city she’s called home for a decade.
<br></br>
<br></br>

About Buen Provecho Collective
BPC is a Miami-based non-profit organization on a mission to make art accessible to everyone, to create a platform for local creatives, and to foster a genuine and supportive community. Visit their website to learn more. (link to website www.buenprovechocollective.com)
<br></br>
<br></br>

<a href="https://emergingcitychampions.org/" target="_blank">Learn more about 8 80 Cities and the Knight Foundation’s Emerging City Champions </a>
<br></br>
<br></br>

      <span className="imageBox" >
                  <img src={eight80} alt="880" height="60" />
        <img src={bpc} alt="BPC" height="80" />
        <img src={kecc} alt="Knight" height="80" />
                </span>
Interested in hosting, facilitating, or sponsoring a workshop? 
<br></br>
<a href="mailto:rhello@buenprovechocollective.com?subject=Mapping Miami">Send Us An Email</a>
<br></br>
<br></br>
<br></br>
Website developed by Rebecca Sell✨ 
</span>
      </p>

    </div>
  );
};

export default About;
