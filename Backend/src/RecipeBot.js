const OpenAI = require('openai');

const YOUR_API_KEY = "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";


const client = new OpenAI({ 
    apiKey: YOUR_API_KEY, 
    baseURL: "https://api.perplexity.ai"
});

async function getRecipes(prompt) {
    try {
        const messages = [
            {
                "role": "system",
                "content": "You are a nutrition expert. Provide nothing, literally no header, no other characters, no ` charaters, but a sql table entry for a realistic meal you can cook with the ingredients the user provided that helps towards the desired goal (no markdown), with the date set to NOW(), and for the provided userID. The table is formatted like this: CREATE TABLE Recipes (recipeID INT AUTO_INCREMENT PRIMARY KEY, userID INT NOT NULL, calories INT NOT NULL, recipeName VARCHAR(255) NOT NULL, ingredients TEXT NOT NULL, instructions TEXT NOT NULL, dateGenerated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userID) REFERENCES Users(id) ON DELETE CASCADE); I should be able to run your output in sql with no modifications nor problems.",
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
    getRecipes
};