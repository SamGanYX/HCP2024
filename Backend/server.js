const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors({
    origin: ['http://192.227.148.23:5173', 'http://frontend:5173'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const { calculateDiet, adjustDiet, calculateBMR } = require('./src/dietCalculator');
const { getResponse } = require('./src/Perplexity');
const { getRecipes } = require('./src/RecipeBot');
const { getWorkouts } = require('./src/WorkoutBot');
const { getQuote } = require('./src/MotivationalBot');

const connection = mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: 'fX5{vP2,eY4',
    database: 'devSync'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database!');
});

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'resume') {
            cb(null, 'uploads/resumes/'); // Save resumes to 'uploads/resumes/' directory
        } else if (file.fieldname === 'photo') {
            cb(null, 'uploads/photos/'); // Save photos to 'uploads/photos/' directory
        } else {
            cb(new Error('Unexpected field')); // Handle unexpected fields
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name with timestamp
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit per file
        files: 10 // Maximum 10 files
    }
});

app.post('/projects_with_image', upload.array('images', 10), (req, res) => {
    // console.log(req);
    const { userID, projectName, projectDescription, fundGoal, endDate } = req.body;
    const sql = `
    INSERT INTO projects (userID, projectName, projectDescription, fundGoal, startDate, endDate)
    VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [userID, projectName, projectDescription, fundGoal, new Date(), endDate];

    connection.query(sql, values, (err, result) => {
        console.log(err);
        console.log(result);
        const projectID = result.insertId;
        if (err) return res.status(500).json(err);
        if (req.files && req.files.length > 0) {
            const imageSQL = "INSERT INTO project_images (projectID, imageURL) VALUES ?";
            const imageValues = req.files.map(file => [projectID, file.filename]);
            connection.query(imageSQL, [imageValues], (imageErr) => {
                console.log("imageErr");
                console.log(imageErr);
                if (imageErr) return res.status(500).json(imageErr);
                else {
                    res.status(200).json({ message: "Project created successfully", projectID: result.insertId });
                }
            });
        } else {
            res.status(200).json({ message: "Project created successfully", projectID: result.insertId });
        }
    });
});

app.post('/users', upload.fields([{ name: 'resume' }, { name: 'photo' }]), (req, res) => {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    const { username, FullName, email, password, userType, bio, tags } = req.body;
    const resumePath = req.files['resume'] ? req.files['resume'][0].filename : null; // Accessing the resume file
    const photoPath = req.files['photo'] ? req.files['photo'][0].filename : null; // Accessing the photo file

    console.log('Processed data:', { username, FullName, email, userType, bio, tags });

    const sql1 = "SELECT * FROM users WHERE Username = ?";
    connection.query(sql1, [username], (err, result) => {
        if (err) {
            console.error('Error checking username:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.length !== 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const sql = `
            INSERT INTO users (username, FullName, email, password, userType, bio, resumePath, photoPath, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        // Generate username from email by removing @ and domain
        const usernameFromEmail = email.split('@')[0];
        const values = [usernameFromEmail, FullName, email, password, userType, bio, resumePath, photoPath, tags];

        console.log('Executing SQL with values:', values);

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                console.error('SQL Error:', err.sqlMessage);
                console.error('SQL State:', err.sqlState);
                console.error('Error Code:', err.code);
                return res.status(500).json({
                    error: err.message,
                    sqlMessage: err.sqlMessage,
                    sqlState: err.sqlState,
                    code: err.code
                });
            }

            const userId = result.insertId;

            res.status(201).json({
                message: "User created successfully",
                userID: userId
            });
        });
    });
});

// Static route to serve uploaded images
app.use('/uploads', express.static('uploads'));
app.use('/uploads/photos', express.static('uploads/photos'));
app.use('/uploads/resumes', express.static('uploads/resumes'));

// Rest of your Express setup...

const bcrypt = require('bcryptjs');

const saltRounds = 10;
const password = "password";
const hashedPassword = bcrypt.hashSync(password, saltRounds);

// Get

app.get('/', (req, res) => {
    return res.json("From Backend Side");
});

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.get('/projects', (req, res) => {
    const sql = "SELECT * FROM projects;"
    connection.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
});

app.get('/projects/:id', async (req, res) => {
    const projectId = req.params.id; // Get userID from URL params
    const sql = "SELECT * FROM projects WHERE projectID = ?"; // Query for specific user

    connection.query(sql, [projectId], (err, data) => {
        if (err) return res.status(500).json(err); // Handle SQL errors
        if (data.length === 0) return res.status(404).json({ message: 'Project not found' }); // Handle case when user not found
        return res.json(data[0]); // Return the first user stats object
    });
});

app.get('/project_images', (req, res) => {
    const sql = "SELECT * FROM project_images;"
    connection.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
});

app.get('/userstats/:userID', (req, res) => {
    const userID = req.params.userID; // Get userID from URL params
    const sql = "SELECT * FROM userstats WHERE userID = ?"; // Query for specific user

    connection.query(sql, [userID], (err, data) => {
        if (err) return res.status(500).json(err); // Handle SQL errors
        if (data.length === 0) return res.status(404).json({ message: 'User not found' }); // Handle case when user not found
        return res.json(data[0]); // Return the first user stats object
    });
});

app.get('/users/matchable/:id', async (req, res) => {
    const userID = req.params.id;
    try {
        // Get all users
        const [users] = await connection.promise().query('SELECT * FROM users WHERE ID != ?', [userID]);

        // Get swipes for the current user
        const [swipes] = await connection.promise().query('SELECT swiped_user_id FROM user_swipes WHERE user_id = ?', [userID]);

        // Create a set of swiped user IDs
        const swipedUserIds = new Set();
        swipes.forEach(swipe => {
            swipedUserIds.add(swipe.swiped_user_id);
        });
        console.log(swipedUserIds);

        // Filter users to exclude those who have been swiped on or matched
        const matchableUsers = users.filter(user => !swipedUserIds.has(user.ID));
        res.status(200).json(matchableUsers);
    } catch (error) {
        console.error('Error fetching matchable users:', error);
        res.status(500).json({ error: 'Failed to fetch matchable users' });
    }
});

// =============== Adding to Table ================ \\

app.post('/api/swipe', async (req, res) => {
    const { user_id, swiped_user_id, swipeType } = req.body; // Extracting the swiped user ID and swipe type from the request body
    const swiperID = req.userId; // Assuming you have middleware that sets the user ID in the request

    try {
        // Insert the swipe action into the database
        const insertSwipeSQL = `
            INSERT INTO user_swipes (user_id, swiped_user_id, swipe_type, matched)
            VALUES (?, ?, ?, 0)
        `;
        await connection.promise().query(insertSwipeSQL, [user_id, swiped_user_id, swipeType]);

        if (swipeType === 'right') {
            // Check for a match
            const swipeeSwipes = await connection.promise().query('SELECT swipe_type, matched FROM user_swipes WHERE user_id = ? AND swiped_user_id = ? AND swipe_type = "right"', [swiped_user_id, user_id]);
            // console.log(swipeeSwipes[0][0].swipe_type);
            if (swipeeSwipes.length == 0) {
                res.status(201).json({ message: 'Swipe recorded successfully.' });
            }
            else if (swipeeSwipes[0][0].swipe_type == "right") {
                // A match is found
                try {
                    // Update both users' matched arrays directly
                    const user_swipe_id = await connection.promise().query(
                        'SELECT id FROM user_swipes WHERE user_id = ? AND swiped_user_id = ?',
                        [user_id, swiped_user_id]
                    );

                    console.log(user_swipe_id);
                    const swiped_user_swipe_id = await connection.promise().query(
                        'SELECT id FROM user_swipes WHERE user_id = ? AND swiped_user_id = ?',
                        [swiped_user_id, user_id]
                    );

                    // Update both users' matched arrays in the database
                    await connection.promise().query(
                        'UPDATE user_swipes SET status = "Accepted", matched = 1 WHERE id = ?',
                        user_swipe_id[0][0].id
                    );
                    await connection.promise().query(
                        'UPDATE user_swipes SET status = "Accepted", matched = 1 WHERE id = ?',
                        swiped_user_swipe_id[0][0].id
                    );

                    return res.status(200).json({
                        message: 'Swipe accepted successfully, and a match was made!',
                        match: true
                    });
                } catch (error) {
                    console.error('Error accepting swipe:', error);
                    res.status(500).json({ error: 'Failed to accept swipe.' });
                }
            }
        }

        res.status(201).json({ message: 'Swipe recorded successfully.' });
    } catch (error) {
        console.error('Error processing swipe:', error);
        res.status(500).json({ error: 'Failed to record swipe.' });
    }
});

app.post('/update_users', (req, res) => {
    const { username, email, password, id } = req.body;

    const sql = "UPDATE users SET Username = ?, Email = ?, Password = ? WHERE id = ?;";
    connection.query(sql, [username, email, password, id], (err, data) => {
        console.log(err);
        if (err) return res.status(500).json(err);
        if (data.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User updated successfully" });
    });
});

app.post('/delete_users', (req, res) => {
    const { id } = req.body;

    const sql = "DELETE FROM users WHERE id = ?;";
    connection.query(sql, [id], (err, data) => {
        console.log(err);
        if (err) return res.status(500).json(err);
        if (data.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User Deleted successfully" });
    });
});

app.post('/projects', (req, res) => {
    const { userID, projectName, projectDescription, fundGoal, endDate } = req.body;

    const startDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const sql = `
        INSERT INTO projects (userID, projectName, projectDescription, startDate, endDate, fundGoal, fundAmount)
        VALUES (?, ?, ?, ?, ?, ?, 0);
    `;
    connection.query(sql, [userID, projectName, projectDescription, startDate, endDate, fundGoal], (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        if (req.files && req.files.length > 0) {
            const imageSQL = "INSERT INTO project_images (projectID, imageURL) VALUES ?";
            const imageValues = req.files.map(file => [projectID, file.filename]);

            connection.query(imageSQL, [imageValues], (imageErr) => {
                if (imageErr) return res.status(500).json(imageErr);
            });
        }
        return res.status(201).json({ message: "Project added successfully" });
    });
});

app.post('/update_project', (req, res) => {
    const { projectID, projectName, projectDescription, startDate, endDate, fundGoal, fundAmount } = req.body;

    const sql = `
        UPDATE projects
        SET projectName = ?, projectDescription = ?, startDate = ?, endDate = ?, fundGoal = ?, fundAmount = ?
        WHERE projectID = ?;
    `;
    connection.query(sql, [projectName, projectDescription, startDate, endDate, fundGoal, fundAmount, projectID], (err, data) => {
        console.log(err);
        if (err) return res.status(500).json({ error: err.message });
        if (data.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json({ message: "Project updated successfully" });
    });
});

app.post('/delete_projects', (req, res) => {
    const { projectID } = req.body; // Extract projectID from request body

    // SQL query to delete the project
    const sql = "DELETE FROM projects WHERE projectID = ?;";

    // Execute the query
    connection.query(sql, [projectID], (err, data) => {
        if (err) {
            console.error("Error deleting project:", err);
            return res.status(500).json(err);
        }

        if (data.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json({ message: "Project deleted successfully" });
    });
});


// ========================= Auth ====================== \\

const jwt = require('jsonwebtoken');
const secretKey = "your_jwt_secret_key"; // You should keep this in an environment variable

// User login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE Username = ?";
    connection.query(sql, [username], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = result[0];

        // Compare the entered password with the hashed password stored in the database
        const passwordIsValid = password === user.Password;
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id }, secretKey, {
            expiresIn: 86400 // Token expires in 24 hours
        });

        return res.status(200).json({
            message: 'Login successful',
            userID: user.ID,
            token: token // Send the token back to the client
        });
    });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided.' });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token.' });
        // If the token is valid, save the decoded user ID for future use
        req.userId = decoded.id;
        next();
    });
};



// Protect a route by applying the middleware
app.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route.' });
});

app.listen(8081, '0.0.0.0', () => {
    console.log('Server is running on port 8081');
});

// Add this after your existing table creation queries
app.post('/investors', upload.array('images', 5), (req, res) => {
    const { name, email, description, expertise, investmentRange, userId, qualifications, location, certifications, tags, contactInfo } = req.body;
    console.log(req.body);
    // First, insert the investor details
    const sql = `
        INSERT INTO investors (name, email, description, expertise, investmentRange, userId, Qualifications, Location, Certifications, Tags, ContactInfo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(sql, [name, email, description, expertise, investmentRange, userId, qualifications, location, certifications, tags, contactInfo], (err, result) => {
        if (err) return res.status(500).json(err);

        const investorId = result.insertId;

        // If there are images, insert them into investor_images table
        if (req.files && req.files.length > 0) {
            const imageSQL = "INSERT INTO investor_images (investorId, imageURL) VALUES ?";
            const imageValues = req.files.map(file => [investorId, file.filename]);

            connection.query(imageSQL, [imageValues], (imageErr) => {
                if (imageErr) return res.status(500).json(imageErr);
                res.status(201).json({
                    message: "Investor created successfully",
                    investorId: investorId
                });
            });
        } else {
            res.status(201).json({
                message: "Investor created successfully",
                investorId: investorId
            });
        }
    });
});

// Get all investors
app.get('/investors', (req, res) => {
    const sql = "SELECT * FROM investors";
    connection.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// Get investor images
app.get('/investor_images/:investorId', (req, res) => {
    const sql = "SELECT * FROM investor_images WHERE investorId = ?";
    connection.query(sql, [req.params.investorId], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT * FROM users WHERE ID = ?";

    connection.query(sql, [userId], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json({ message: 'User not found' });
        return res.json(data[0]);
    });
});

// Add this new endpoint to get projects by userID
app.get('/investors/:id', (req, res) => {
    const investorID = req.params.id;
    const sql = "SELECT * FROM investors WHERE ID = ?";

    connection.query(sql, [investorID], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json({ message: 'Investor not found' });
        return res.json(data[0]);
    });
});

app.post('/collaborators', (req, res) => {
    const { projectID, userID } = req.body;
    const sql = `
        INSERT INTO collaborators (projectID, userID)
        VALUES (?, ?)
    `;

    connection.query(sql, [projectID, userID], (err, result) => {
        if (err) {
            console.error("Error adding collaborator:", err);
            return res.status(500).json({ error: err.message });
        }
        return res.status(201).json({ message: "Collaborator added successfully", collaboratorID: result.insertId });
    });
});

// Add this new endpoint
app.post('/invest', (req, res) => {
    const { projectID, amount } = req.body;

    const sql = `
        UPDATE projects 
        SET fundAmount = fundAmount + ? 
        WHERE projectID = ?
    `;

    connection.query(sql, [amount, projectID], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json({ message: "Investment successful" });
    });
});

// Add this new endpoint to get projects by userID
app.get('/projects/user/:userID', (req, res) => {
    const userID = req.params.userID;
    const sql = "SELECT * FROM projects WHERE userID = ?";

    connection.query(sql, [userID], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Application endpoint
app.post('/applications', (req, res) => {
    const { userID, projectID } = req.body;

    // SQL query to insert a new application
    const sql = `
        INSERT INTO applications (userID, projectID)
        VALUES (?, ?)
    `;

    connection.query(sql, [userID, projectID], (err, result) => {
        if (err) {
            console.error("Error inserting application:", err);
            return res.status(500).json({ error: err.message });
        }
        // console.log("success");
        return res.status(201).json({ message: "Application submitted successfully", applicationID: result.insertId });
    });
});

app.get('/projects/:id/applicants', (req, res) => {
    const projectId = req.params.id; // Get project ID from URL params
    const sql = `
        SELECT *
        FROM applications 
        WHERE projectID = ${projectId}
    `; // Query to get applicants for the specific project
    // console.log(projectId);
    connection.query(sql, (err, data) => {
        if (err) return res.status(500).json(err); // Handle SQL errors
        console.log(data);
        return res.status(201).json(data); // Return the list of applicants
    });
});

// Add this new endpoint to delete an application
app.delete('/applicants/:projectId/:id', (req, res) => {
    const applicantID = req.params.id; // Get applicant ID from URL params
    const projectID = req.params.projectId

    // SQL query to delete the application
    const sql = "DELETE FROM applications WHERE userID = ? AND projectID = ?";

    connection.query(sql, [applicantID, projectID], (err, result) => {
        if (err) {
            console.error("Error deleting application:", err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Application not found" });
        }
        console.log("success");
        return res.status(200).json({ message: "Application deleted successfully" });
    });
});

app.get('/projects/:id/collaborators', (req, res) => {
    const projectId = req.params.id; // Get project ID from URL params

    // SQL query to get collaborators for the specific project
    const sql = `
        SELECT u.ID, u.FullName, u.username
        FROM collaborators c
        JOIN users u ON c.userID = u.ID
        WHERE c.projectID = ?
    `;

    connection.query(sql, [projectId], (err, data) => {
        if (err) {
            console.error("Error fetching collaborators:", err);
            return res.status(500).json(err); // Handle SQL errors
        }
        return res.json(data); // Return the list of collaborators
    });
});


const matching = require('./matching');

// Get matches for a user
app.get('/matches/user/:userId', (req, res) => {
    const userId = req.params.userId;

    matching.getMatchesForUser(userId)
        .then(matches => {
            res.json(matches);
        })
        .catch(err => {
            console.error('Error getting matches:', err);
            res.status(500).json({ error: err.message });
        });
});

// Get matches for a project
app.get('/matches/project/:projectId', (req, res) => {
    const projectId = req.params.projectId;

    matching.getMatchesForProject(projectId)
        .then(matches => {
            res.json(matches);
        })
        .catch(err => {
            console.error('Error getting matches:', err);
            res.status(500).json({ error: err.message });
        });
});

const swipeService = require('./swipeService');
app.post('/api/swipe', async (req, res) => { // Replace 'authenticate' with your auth middleware
    try {
        const { swipedUserId, swipeType } = req.body;
        const userId = req.user.id; // Assuming auth middleware sets user info

        await swipeService.recordSwipe(userId, swipedUserId, swipeType);

        // If it's a right swipe, check for a match
        if (swipeType === 'right') {
            const isMatch = await swipeService.checkForMatch(userId, swipedUserId);

            if (isMatch) {
                // You could implement match notification logic here
                return res.json({
                    success: true,
                    message: 'Swipe recorded successfully',
                    match: true
                });
            }
        }

        res.json({
            success: true,
            message: 'Swipe recorded successfully'
        });
    } catch (error) {
        console.error('Swipe API error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Route to get all users that the current user has swiped right on
app.get('/api/right-swipes', async (req, res) => { // Replace 'authenticate' with your auth middleware
    try {
        const userId = req.user.id;
        const rightSwipedUsers = await swipeService.getRightSwipedUsers(userId);

        res.json({
            success: true,
            users: rightSwipedUsers
        });
    } catch (error) {
        console.error('Get right swipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch right-swiped users'
        });
    }
});

app.put('/users', upload.fields([{ name: 'resume' }, { name: 'photo' }]), async (req, res) => {
    const { userID, FullName, userType, bio, tags } = req.body;
    const resumePath = req.files['resume'] ? req.files['resume'][0].filename : null; // Accessing the resume file
    const photoPath = req.files['photo'] ? req.files['photo'][0].filename : null; // Accessing the photo file

    try {
        // Update user information in the database
        const sql = `
        UPDATE users
        SET FullName = ?, userType = ?, bio = ?, resumePath = COALESCE(?, resumePath), photoPath = COALESCE(?, photoPath), tags = ?
        WHERE ID = ?`;
        const values = [FullName, userType, bio, resumePath, photoPath, tags, userID];

        const [result] = await connection.promise().query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get mutual matches for a user
app.get('/api/matches/mutual/:userId', (req, res) => {
    const userId = req.params.userId;

    // Query to get all mutual matches from the swipes table
    const query = `
    SELECT u.ID, u.FullName, u.Email, u.userType, u.photoPath,
      s.matched_at AS matchDate, 
      COALESCE(s.status, 'Pending') AS status
    FROM user_swipes s
    JOIN users u ON JSON_CONTAINS(s.matched, CAST(u.ID AS JSON))
    WHERE s.user_id = ?
    ORDER BY s.matched_at DESC
  `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching mutual matches:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

// Update match status
app.patch('/api/matches/status/:userId/:matchedUserId', (req, res) => {
    const { userId, matchedUserId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const query = `
    UPDATE user_swipes 
    SET status = ? 
    WHERE user_id = ? AND JSON_CONTAINS(matched, ?)
  `;

    connection.query(query, [status, userId, JSON.stringify(parseInt(matchedUserId))], (err) => {
        if (err) {
            console.error('Error updating match status:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ success: true });
    });
});

// Get users who swiped right on a specific user
app.get('/api/swiped-right-on/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // Get all users who swiped right on the current user
        const [swipes] = await connection.promise().query(
            'SELECT user_id FROM user_swipes WHERE swipe_type = "right" AND status = "Pending" AND swiped_user_id = ?',
            [JSON.stringify(parseInt(userId))]
        );

        console.log('Found swipes:', swipes); // Debug log

        if (swipes.length === 0) {
            console.log('No swipes found for user:', userId); // Debug log
            res.json();
            // return;
        } else {
            // Get the user details for each swiper
            const swiperIds = swipes.map(swipe => swipe.user_id);
            console.log('Swiper IDs:', swiperIds); // Debug log

            const [users] = await connection.promise().query(
                'SELECT ID, Username, FullName, Email, userType, photoPath, bio, tags FROM users WHERE ID IN (?)',
                [swiperIds]
            );

            console.log('Found users:', users); // Debug log

            // Format the response
            const formattedUsers = users.map(user => ({
                ID: user.ID,
                FullName: user.FullName || user.Username,
                Email: user.Email,
                userType: user.userType,
                profileImage: user.photoPath || 'default-avatar.png',
                bio: user.bio || 'No bio available',
                tags: user.tags ? JSON.parse(user.tags) : [],
                matchDate: new Date().toISOString(),
                status: 'Pending'
            }));

            console.log('Sending formatted users:', formattedUsers); // Debug log
            res.json(formattedUsers);
        }
    } catch (error) {
        console.error('Error fetching users who swiped right:', error);
        res.status(500).json({ error: 'Failed to fetch users who swiped right' });
    }
});

// New endpoint to accept a swipe
app.post('/api/accept-swipe', async (req, res) => {
    const { userId, swipedUserId } = req.body;

    try {
        // Update both users' matched arrays directly
        const user_swipe_id = await connection.promise().query(
            'SELECT id FROM user_swipes WHERE user_id = ? AND swiped_user_id = ?',
            [userId, swipedUserId]
        );

        console.log(user_swipe_id);
        const swiped_user_swipe_id = await connection.promise().query(
            'SELECT id FROM user_swipes WHERE user_id = ? AND swiped_user_id = ?',
            [swipedUserId, userId]
        );

        // Update both users' matched arrays in the database
        await connection.promise().query(
            'UPDATE user_swipes SET status = "Accepted", matched = 1 WHERE id = ?',
            user_swipe_id[0][0].id
        );
        await connection.promise().query(
            'UPDATE user_swipes SET status = "Accepted", matched = 1 WHERE id = ?',
            swiped_user_swipe_id[0][0].id
        );

        return res.status(200).json({
            message: 'Swipe accepted successfully, and a match was made!',
            match: true
        });
    } catch (error) {
        console.error('Error accepting swipe:', error);
        res.status(500).json({ error: 'Failed to accept swipe.' });
    }
});

// New reject function to handle swipe left
app.post('/api/reject-swipe', async (req, res) => {
    const { userId, swipedUserId } = req.body;

    try {
        // Insert the swipe action into the database
        const insertSwipeSQL = `
            INSERT INTO user_swipes (user_id, swiped_user_id, swipe_type, matched, status)
            VALUES (?, ?, 'left', -1, "Rejected")
        `;
        await connection.promise().query(insertSwipeSQL, [userId, swipedUserId]);

        // Update the status of the existing swipe to "Rejected"
        const user_swipe_id = await connection.promise().query(
            'SELECT id FROM user_swipes WHERE user_id = ? AND swiped_user_id = ?',
            [swipedUserId, userId]
        );

        await connection.promise().query(
            'UPDATE user_swipes SET status = "Rejected", matched = -1 WHERE id = ?',
            user_swipe_id[0][0].id
        );

        return res.status(200).json({
            message: 'Swipe rejected successfully.',
            match: false
        });
    } catch (error) {
        console.error('Error rejecting swipe:', error);
        res.status(500).json({ error: 'Failed to reject swipe.' });
    }
});

// New endpoint to get matched users for a specific user
app.get('/finished_matches/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const sql = `
            SELECT u.ID, u.FullName, u.Username, u.Email, u.photoPath
            FROM user_swipes s
            JOIN users u ON s.swiped_user_id = u.ID
            WHERE s.user_id = ? AND s.matched = 1
        `;

        const [matches] = await connection.promise().query(sql, [userId]);

        if (matches.length === 0) {
            return res.status(404).json({ message: 'No matches found' });
        }

        res.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});