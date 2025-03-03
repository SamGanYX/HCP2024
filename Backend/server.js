require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const PORT = process.env.PORT || 8081;

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://frontend:5173'],
    credentials: true
}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());

// Database configuration
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ' ',
    database: process.env.DB_NAME || 'devsync',
    port: parseInt(process.env.DB_PORT) || 3306
});

// Handle connection errors and reconnection
function handleDisconnect() {
    console.log('Attempting to connect to database...');
    
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            console.log('Retrying in 2 seconds...');
            setTimeout(handleDisconnect, 2000);
            return;
        }
        console.log('Connected to the database successfully!');
    });

    connection.on('error', (err) => {
        console.error('Database error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

// Initial database connection
handleDisconnect();

// Basic route to test server
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const { calculateDiet, adjustDiet, calculateBMR } = require('./src/dietCalculator');
const { getResponse } = require('./src/Perplexity');
const { getRecipes } = require('./src/RecipeBot');
const { getWorkouts } = require('./src/WorkoutBot');
const { getQuote } = require('./src/MotivationalBot');

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files to 'uploads/' directory
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

app.post('/signup', (req, res) => {
    //console.log("skdjhskdfhs");
    const { email, password, userType, bio } = req.body;

    console.log('Received email:', email);
    console.log('Received password:', password);

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check if user already exists
    const checkUserSQL = "SELECT * FROM users WHERE Email = ?";
    connection.query(checkUserSQL, email, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        
        if (result.length > 0) {
            return res.status(400).json({ message: "mail already exists" });
        }

        // Insert new user
        const insertSQL = `
            INSERT INTO users (Email, Password, userType, bio)
            VALUES (?, ?, ?, ?)
        `;
        const values = [email, password, userType || 'Project Seeker', bio || ''];

        connection.query(insertSQL, values, (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ message: "Error creating user" });
            }
            res.status(201).json({ 
                message: "User created successfully",
                userId: result.insertId 
            });
        });
    });
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


app.post('/users', upload.single('resume'), (req, res) => {
    const { username, FullName, email, password, userType, bio } = req.body;
    const resumePath = req.file ? req.file.filename : null;
    const sql1 = "SELECT * FROM users WHERE Username = ?";
    connection.query(sql1, [username], (err, result) => {
        if(result.length !== 0) {
            console.log(result);
            return res.status(500).json("User already exists");
        } else {
            const sql = `
                INSERT INTO users (username, FullName, email, password, userType, bio, resumePath)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const values = [username, FullName, email, password, userType, bio, resumePath];
        
            connection.query(sql, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }
            res.status(201).json({ message: "User created successfully", userID: result.insertId });
            });
        }
    });
});


// Static route to serve uploaded images
app.use('/uploads', express.static('uploads'));

const bcrypt = require('bcryptjs');

const saltRounds = 10;
const password = "password";
const hashedPassword = bcrypt.hashSync(password, saltRounds);

// Get

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users;"
    connection.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
});

app.get('/projects', (req, res) => {
    const sql = "SELECT * FROM projects;"
    connection.query(sql, (err, data) => {
        if(err) return res.json(err);
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
        if(err) return res.json(err);
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

// =============== Adding to Table ================ \\

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
        if(err) return res.json(err);
        return res.json(data);
    });
});

// Get investor images
app.get('/investor_images/:investorId', (req, res) => {
    const sql = "SELECT * FROM investor_images WHERE investorId = ?";
    connection.query(sql, [req.params.investorId], (err, data) => {
        if(err) return res.json(err);
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

