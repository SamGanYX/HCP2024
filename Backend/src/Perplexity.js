const OpenAI = require('openai');

const YOUR_API_KEY = "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";


const client = new OpenAI({ 
    apiKey: YOUR_API_KEY, 
    baseURL: "https://api.perplexity.ai"
});

async function getResponse(prompt) {
    try {
        const messages = [
            {
                "role": "system",
                "content": "You are a fitness expert. If you encounter a query not fitness/health related, start by saying 'I am a fitness expert not a [topic] expert', but answer anyways. Provide helpful and detailed responses that maximally benefits the user in raw text.",
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
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error:", error);
    }
}


module.exports = {
    getResponse
};