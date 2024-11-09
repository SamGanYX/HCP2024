const OpenAI = require('openai');

const YOUR_API_KEY = "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";


const client = new OpenAI({ 
    apiKey: YOUR_API_KEY, 
    baseURL: "https://api.perplexity.ai"
});

async function getWorkouts(prompt) {
    try {
        const messages = [
            {
                "role": "system",
                "content": "You are a exercise scientist. Provide nothing, literally no header, no other characters, no ` charaters, but a sql table entry for a realistic workout you can do at the place the user provided that helps towards the desired goal (no markdown), with the date set to NOW(), and for the provided userID. The table is formatted like this: CREATE TABLE Workouts ( ID INT AUTO_INCREMENT PRIMARY KEY, userID INT NOT NULL, place VARCHAR(255) NOT NULL, workoutName VARCHAR(255) NOT NULL, exercises TEXT NOT NULL, instructions TEXT NOT NULL, dateGenerated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userID) REFERENCES Users(id) ON DELETE CASCADE );",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ];

        const response = await client.chat.completions.create({
            model: "llama-3.1-sonar-small-128k-online", // Using the latest model
            messages: messages,
        });
        console.log(response); // This logs the entire response object
        console.log(response.choices[0].message.content); // This logs just the response text
        // return response.choices[0].message.content;
        const sqlStatement = response.choices[0].message.content.trim();
        return sqlStatement.replace(/^```sql\n?|```$/g, '').trim();
    } catch (error) {
        console.error("Error:", error);
    }
}
// getRecipes("UserID: 3, Ingredients: rice, chicken, soy sauce, green onions, carrots, peas. eggs")

module.exports = {
    getWorkouts
};