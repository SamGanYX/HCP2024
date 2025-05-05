const connection = require('./db');

const testUsers = [
    // Project Seekers
    {
        username: 'tech_seeker1',
        FullName: 'Alice Johnson',
        email: 'alice@test.com',
        password: 'password123',
        userType: 'Project Seeker',
        bio: 'Full stack developer looking for exciting tech projects',
        skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'Python', 'SQL']),
        field: 'Technology'
    },
    {
        username: 'health_seeker1',
        FullName: 'Bob Smith',
        email: 'bob@test.com',
        password: 'password123',
        userType: 'Project Seeker',
        bio: 'Healthcare professional interested in health tech projects',
        skills: JSON.stringify(['Healthcare', 'Data Analysis', 'Python', 'Machine Learning']),
        field: 'Health'
    },
    {
        username: 'design_seeker1',
        FullName: 'Carol White',
        email: 'carol@test.com',
        password: 'password123',
        userType: 'Project Seeker',
        bio: 'UI/UX designer with frontend development skills',
        skills: JSON.stringify(['Figma', 'UI/UX', 'HTML', 'CSS', 'JavaScript']),
        field: 'Design'
    },
    // Project Owners
    {
        username: 'tech_owner1',
        FullName: 'David Lee',
        email: 'david@test.com',
        password: 'password123',
        userType: 'Project Owner',
        bio: 'Tech entrepreneur with multiple projects',
        skills: JSON.stringify(['Project Management', 'JavaScript', 'Business']),
        field: 'Technology'
    },
    {
        username: 'health_owner1',
        FullName: 'Eve Brown',
        email: 'eve@test.com',
        password: 'password123',
        userType: 'Project Owner',
        bio: 'Healthcare startup founder',
        skills: JSON.stringify(['Healthcare', 'Business', 'Management']),
        field: 'Health'
    }
];

const testProjects = [
    {
        projectName: 'HealthTech App',
        projectDescription: 'A mobile app for tracking health metrics',
        startDate: '2024-03-01',
        endDate: '2024-09-01',
        fundGoal: 50000,
        field: 'Health',
        requiredSkills: 'JavaScript, React, Healthcare, Data Analysis',
        status: 'Open'
    },
    {
        projectName: 'E-commerce Platform',
        projectDescription: 'Modern e-commerce solution with AI recommendations',
        startDate: '2024-04-01',
        endDate: '2024-10-01',
        fundGoal: 75000,
        field: 'Technology',
        requiredSkills: 'JavaScript, React, Node.js, Python, SQL',
        status: 'Open'
    },
    {
        projectName: 'Design System',
        projectDescription: 'Comprehensive design system for enterprise applications',
        startDate: '2024-05-01',
        endDate: '2024-11-01',
        fundGoal: 30000,
        field: 'Design',
        requiredSkills: 'Figma, UI/UX, HTML, CSS, JavaScript',
        status: 'Open'
    }
];

// Function to insert test users
async function insertTestUsers() {
    for (const user of testUsers) {
        const sql = `
            INSERT INTO users (username, FullName, email, password, userType, bio, skills, field)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            user.username,
            user.FullName,
            user.email,
            user.password,
            user.userType,
            user.bio,
            user.skills,
            user.field
        ];

        await new Promise((resolve, reject) => {
            connection.query(sql, values, (err, result) => {
                if (err) {
                    console.error(`Error inserting user ${user.username}:`, err);
                    reject(err);
                } else {
                    console.log(`Inserted user: ${user.username}`);
                    resolve(result);
                }
            });
        });
    }
}

// Function to insert test projects
async function insertTestProjects() {
    // First get the project owner IDs
    const ownerIds = await new Promise((resolve, reject) => {
        connection.query(
            "SELECT ID FROM users WHERE userType = 'Project Owner'",
            (err, results) => {
                if (err) reject(err);
                else resolve(results.map(r => r.ID));
            }
        );
    });

    for (let i = 0; i < testProjects.length; i++) {
        const project = testProjects[i];
        const ownerId = ownerIds[i % ownerIds.length]; // Distribute projects among owners

        const sql = `
            INSERT INTO projects (
                projectName, projectDescription, userID, startDate, endDate,
                fundGoal, field, requiredSkills, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            project.projectName,
            project.projectDescription,
            ownerId,
            project.startDate,
            project.endDate,
            project.fundGoal,
            project.field,
            project.requiredSkills,
            project.status
        ];

        await new Promise((resolve, reject) => {
            connection.query(sql, values, (err, result) => {
                if (err) {
                    console.error(`Error inserting project ${project.projectName}:`, err);
                    reject(err);
                } else {
                    console.log(`Inserted project: ${project.projectName}`);
                    resolve(result);
                }
            });
        });
    }
}

// Run the test data insertion
async function createTestData() {
    try {
        console.log('Creating test users...');
        await insertTestUsers();
        
        console.log('Creating test projects...');
        await insertTestProjects();
        
        console.log('Test data creation completed successfully!');
    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        connection.end();
    }
}

createTestData(); 