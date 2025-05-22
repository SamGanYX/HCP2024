const connection = require('./db');
const matching = require('./matching');

async function testMatching() {
    try {
        // Get all project seekers
        const seekers = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM users WHERE userType = 'Project Seeker'",
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        // Get all projects
        const projects = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM projects",
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        console.log('\n=== Testing Matching Algorithm ===\n');

        // Test matches for each project seeker
        for (const seeker of seekers) {
            console.log(`\nMatches for ${seeker.FullName} (${seeker.field}):`);
            const matches = await matching.getMatchesForUser(seeker.ID);
            
            matches.forEach(match => {
                console.log(`- Project: ${match.project.projectName}`);
                console.log(`  Score: ${match.score}`);
                console.log(`  Required Skills: ${match.project.requiredSkills}`);
                console.log(`  Field: ${match.project.field}\n`);
            });
        }

        // Test matches for each project
        for (const project of projects) {
            console.log(`\nMatches for ${project.projectName}:`);
            const matches = await matching.getMatchesForProject(project.projectID);
            
            matches.forEach(match => {
                console.log(`- User: ${match.user.FullName}`);
                console.log(`  Score: ${match.score}`);
                console.log(`  Skills: ${match.user.skills}`);
                console.log(`  Field: ${match.user.field}\n`);
            });
        }

    } catch (error) {
        console.error('Error testing matching:', error);
    } finally {
        connection.end();
    }
}

testMatching(); 