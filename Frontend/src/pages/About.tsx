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
            <h1>About SparkHub</h1>
            <p>
                SparkHub is a youth development program aimed towards assisting young students in exploring 
                and developing their passion for STEM, business, and more through projects and competition. 
                SparkHub serves as a hub meant to connect these students together to develop projects of 
                their choice, and provides a multitude of resources from experienced mentors to detailed 
                lectures on a variety of topics.
            </p>

            <h2>Mission Statement</h2>
            <p>
                SparkHub aims to create the next generation of world-changers by providing a space for 
                like-minded students to connect, share, and develop their passions and interests.
            </p>

            <h2>Resources</h2>
            <p>
                SparkHub aims to provide a variety of resources for our members, including:
            </p>
            <ul>
                <li>Professional mentors with years of experience in their respective fields</li>
                <li>Unique "search and find" listings board for students aiming to join and create projects</li>
                <li>Detailed lectures on various subjects, all archived on the platform</li>
            </ul>
        </div>
    );
};

export default About;
