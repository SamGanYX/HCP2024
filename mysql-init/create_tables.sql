DROP TABLE Likes, Matches, projects, project_images, roles, userProjectRoles, users;

CREATE TABLE users ( 
    ID INT NOT NULL AUTO_INCREMENT, 
    Username VARCHAR(255) NOT NULL, 
    Email VARCHAR(255) NOT NULL, 
    Password VARCHAR(255) NOT NULL, 
    userType ENUM('Project Seeker', 'Project Owner', 'Mentor/Advisor') NOT NULL,
    resumePath VARCHAR(255), -- Path to the uploaded resume
    
    bio TEXT,
    PRIMARY KEY (ID) 
);

CREATE TABLE projects (
    projectID INT AUTO_INCREMENT PRIMARY KEY,
    projectName VARCHAR(255) NOT NULL,
    projectDescription TEXT,
    userID INT, -- User who owns/created the project
    startDate VARCHAR(255) NOT NULL,
    endDate VARCHAR(255) NOT NULL,
    fundGoal INT NOT NULL,  -- Required funding goal for the project
    fundAmount INT DEFAULT 0,  -- Current funding amount, starts at 0
    field VARCHAR(255), -- e.g., "Technology", "Health", etc.
    requiredSkills TEXT, -- List of skills needed for the project
    location VARCHAR(255), -- If relevant, e.g., "Remote" or "Onsite"
    status ENUM('Open', 'Closed') DEFAULT 'Open',
    FOREIGN KEY (userID) REFERENCES users(ID)
);

CREATE TABLE project_images (
    imageID INT NOT NULL AUTO_INCREMENT,
    projectID INT NOT NULL,  -- Foreign key for the project
    imageURL VARCHAR(255) NOT NULL,  -- URL or path to the image
    PRIMARY KEY (imageID),
    FOREIGN KEY (projectID) REFERENCES projects(projectID) ON DELETE CASCADE
);

CREATE TABLE investors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    description TEXT,
    expertise VARCHAR(255),
    investmentRange VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(ID)
);

CREATE TABLE investor_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investorId INT,
    imageURL VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investorId) REFERENCES investors(id) ON DELETE CASCADE
);

CREATE TABLE Roles (
    roleId INT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(255) NOT NULL, -- e.g., "Mentor", "Advisor", "Developer"
    description TEXT
);

CREATE TABLE UserProjectRoles (
    userProjectRoleId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    projectId INT,
    roleId INT,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(ID),
    FOREIGN KEY (projectId) REFERENCES projects(projectId),
    FOREIGN KEY (roleId) REFERENCES Roles(roleId)
);

CREATE TABLE Likes (
    likeId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    projectId INT,
    likedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(ID),
    FOREIGN KEY (projectId) REFERENCES projects(projectId),
    UNIQUE (userId, projectId) -- Prevents duplicate likes from the same user to the same project
);

CREATE TABLE Matches (
    matchId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    projectId INT,
    matchedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(ID),
    FOREIGN KEY (projectId) REFERENCES projects(projectId)
);

CREATE TABLE applications (
    userID INT,
    projectID INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userID, projectID),  -- Composite primary key
    FOREIGN KEY (userID) REFERENCES users(ID),
    FOREIGN KEY (projectID) REFERENCES projects(projectID)
);

CREATE TABLE collaborators (
    collaboratorId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    projectId INT NOT NULL,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(ID) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(projectID) ON DELETE CASCADE,
    UNIQUE (userId, projectId) -- Prevents duplicate collaborations
);

CREATE TABLE user_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    skill VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(ID)
); 

ALTER TABLE investors
ADD Qualifications VARCHAR(255),
ADD Location VARCHAR(255),
ADD Certifications TEXT,
ADD Tags TEXT, -- Assuming Tags will be stored as a comma-separated list
ADD ContactInfo VARCHAR(255);

ALTER TABLE users
ADD skills TEXT,
ADD FullName VARCHAR(255);

ALTER TABLE projects
ADD category VARCHAR(255);

CREATE PROCEDURE create_match(IN user1_id INT, IN user2_id INT)
BEGIN
    -- Check if both users have swiped right on each other
    DECLARE user1_swiped_right BOOLEAN;
    DECLARE user2_swiped_right BOOLEAN;
    
    SELECT JSON_CONTAINS(swipe_right, CAST(user2_id AS JSON)) INTO user1_swiped_right
    FROM user_swipes WHERE user_id = user1_id;
    
    SELECT JSON_CONTAINS(swipe_right, CAST(user1_id AS JSON)) INTO user2_swiped_right
    FROM user_swipes WHERE user_id = user2_id;
    
    -- If both have swiped right, add them to each other's matched array
    IF user1_swiped_right AND user2_swiped_right THEN
        -- Add user2 to user1's matched array if not already there
        UPDATE user_swipes 
        SET matched = IF(
            JSON_CONTAINS(matched, CAST(user2_id AS JSON)),
            matched,
            JSON_ARRAY_APPEND(matched, '$', user2_id)
        ),
        updated_at = NOW()
        WHERE user_id = user1_id;
        
        -- Add user1 to user2's matched array if not already there
        UPDATE user_swipes 
        SET matched = IF(
            JSON_CONTAINS(matched, CAST(user1_id AS JSON)),
            matched,
            JSON_ARRAY_APPEND(matched, '$', user1_id)
        ),
        updated_at = NOW()
        WHERE user_id = user2_id;
        
        SELECT TRUE AS match_created;
    ELSE
        SELECT FALSE AS match_created;
    END IF;
END 
