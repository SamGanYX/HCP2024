import React from 'react';
import './About.css';

const About = () => {
    return (
        <><div className="about-container">
            <section className="about-hero">
                <h1>
                    About
                    <span style={{ color: '#40B7C1', fontWeight: 'bold' }}> Dev</span>
                    <span style={{ color: '#4169E1', fontWeight: 'bold', fontStyle: 'italic' }}>Sync</span>
                </h1>
                <p className="tagline">Connecting college developers to projects and collaborators through a streamlined, swipe-based interface.</p>
            </section>

            <section className="about-mission">
            <h1 className="section-title">Our Mission</h1>
                <p>
                    Finding teammates as a student is hard—especially if you're new to tech spaces, introverted, or not plugged into a campus network.
                    DevSync was created to break down those barriers by making it:
                </p>
                <p>
                <ul className="mission-points">
                    <li><strong>Effortless</strong> to discover people and projects.</li>
                    <li><strong>Accessible</strong> to all college students—not just those at hackathons.</li>
                    <li><strong>Intentional</strong> by focusing on meaningful matches, not just resumes.</li>
                </ul>
                </p>
            </section>
            
            <section className="how-it-works">
                <h1 className="section-title">How It Works</h1>
                <div className="steps-list">
                    <div className="step">
                        <div className="step-number">1. </div>
                        <p className="step-content"><strong>Create an account</strong> with your school email.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2. </div>
                        <p className="step-content"><strong>Build your profile</strong> with a bio, resume, and tags.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3. </div>
                        <p className="step-content"><strong>Swipe</strong> on projects or people based on your interests.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">4. </div>
                        <p className="step-content"><strong>Match</strong> when there's mutual interest—and start building!</p>
                    </div>
                </div>
            </section>

            <section className="team-section">
                <h1 className="section-title"> Meet the Team</h1>
                <div className="team-members">
                    <div className="team-member">
                        <img src="/team/sam.png" alt="Sam Gan" className="team-member-photo" />
                        <h3>Sam Gan</h3>
                    </div>
                    <div className="team-member">
                        <img src="/team/elaine.JPEG" alt="Elaine Zhong" className="higher-up-photo" />
                        <h3>Elaine Zhong</h3>
                    </div>
                    <div className="team-member">
                        <img src="/team/huan.JPG" alt="Huan Nguyen" className="team-member-photo" />
                        <h3>Huan Nguyen</h3>
                    </div>
                    <div className="team-member">
                        <img src="/team/ben.png" alt="Ben Fukuzawa" className="team-member-photo" />
                        <h3>Ben Fukuzawa</h3>
                    </div>
                    <div className="team-member">
                        <img src="/team/seanna.JPG" alt="Seanna Qin" className="team-member-photo" />
                        <h3>Seanna Qin</h3>
                    </div>
                    <div className="team-member">
                        <img src="/team/anika.PNG" alt="Anika Rao" className="higher-up-photo" />
                        <h3>Anika Rao</h3>
                    </div>
                    <div className="team-member">
                        <img src="/team/sophia.JPG" alt="Sophia Zhang" className="team-member-photo" />
                        <h3>Sophia Zhang</h3>
                    </div>
                </div>
            </section>
        </div><footer className="about-footer">
                <p>Made with ❤️ by the DevSync Team</p>
            </footer></>
    );
};

export default About;