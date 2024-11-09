import React from 'react';
import './About.css'; // Make sure to create a CSS file for styling

const About = () => {
    return (
        <div className="about-container">
            <h2>Meet the Team</h2>
            <div className="team-members">
                <div className="team-member">
                    <h3>Yunxin Gan</h3>
                </div>
                <div className="team-member">
                    <h3>Daniel Wang</h3>
                </div>
                <div className="team-member">
                    <h3>Leon Sun</h3>
                </div>
                <div className="team-member">
                    <h3>Shulyn Ragland</h3>
                </div>
            </div>
            <h1>About Sparkhub</h1>
            <h2>How We Built It</h2>
            <p>
                Our team used React, TypeScript, JavaScript, and Python to develop a functional, user-friendly platform. 
                We combined our skills to integrate backend and frontend features, ensuring smooth and efficient user experiences.
            </p>
            
            <h2>Challenges We Faced</h2>
            <p>
                We encountered challenges while learning new skills on the fly, adapting to hidden roadblocks, and meeting tight deadlines. 
                Despite this, our collaboration and perseverance helped us overcome these hurdles.
            </p>
            
            <h2>What's Next</h2>
            <p>
                Looking ahead, we plan to expand the app's features to enhance the user experience, including integration with mobile devices. 
                We also aim to increase community engagement by introducing live interactions between users.
            </p>
        </div>
    );
};

export default About;
