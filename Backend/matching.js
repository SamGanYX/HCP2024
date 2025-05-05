const connection = require('./db');

// Function to calculate similarity score between user and project
function calculateMatchScore(user, project) {
    let score = 0;
    
    // Convert skills to arrays for comparison
    const userSkills = user.skills ? JSON.parse(user.skills) : [];
    const projectSkills = project.requiredSkills ? project.requiredSkills.split(',').map(s => s.trim()) : [];
    
    // Calculate skill match score
    const matchingSkills = userSkills.filter(skill => projectSkills.includes(skill));
    score += (matchingSkills.length / projectSkills.length) * 50; // Skills contribute 50% to total score
    
    // Add score based on user type match
    if (user.userType === 'Project Seeker' && project.status === 'Open') {
        score += 25;
    }
    
    // Add score based on field match if available
    if (user.field && project.field && user.field === project.field) {
        score += 25;
    }
    
    return Math.min(score, 100); // Cap score at 100
}

// Function to get matches for a user
async function getMatchesForUser(userId) {
    return new Promise((resolve, reject) => {
        // First get the user's details
        connection.query('SELECT * FROM users WHERE ID = ?', [userId], (err, users) => {
            if (err) return reject(err);
            if (users.length === 0) return resolve([]);
            
            const user = users[0];
            
            // Then get all open projects
            connection.query('SELECT * FROM projects WHERE status = "Open"', (err, projects) => {
                if (err) return reject(err);
                
                // Calculate match scores for each project
                const matches = projects.map(project => ({
                    project,
                    score: calculateMatchScore(user, project)
                }));
                
                // Sort by score in descending order
                matches.sort((a, b) => b.score - a.score);
                
                // Only return matches with score > 50
                const goodMatches = matches.filter(match => match.score > 50);
                
                resolve(goodMatches);
            });
        });
    });
}

// Function to get matches for a project
async function getMatchesForProject(projectId) {
    return new Promise((resolve, reject) => {
        // First get the project details
        connection.query('SELECT * FROM projects WHERE projectID = ?', [projectId], (err, projects) => {
            if (err) return reject(err);
            if (projects.length === 0) return resolve([]);
            
            const project = projects[0];
            
            // Then get all project seekers
            connection.query('SELECT * FROM users WHERE userType = "Project Seeker"', (err, users) => {
                if (err) return reject(err);
                
                // Calculate match scores for each user
                const matches = users.map(user => ({
                    user,
                    score: calculateMatchScore(user, project)
                }));
                
                // Sort by score in descending order
                matches.sort((a, b) => b.score - a.score);
                
                // Only return matches with score > 50
                const goodMatches = matches.filter(match => match.score > 50);
                
                resolve(goodMatches);
            });
        });
    });
}

module.exports = {
    getMatchesForUser,
    getMatchesForProject,
    calculateMatchScore
}; 