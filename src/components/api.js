const API_URL = "https://dsa-explorer-backend.vercel.app";

export const fetchQuestions = async () => {
    try {
        const response = await fetch(`${API_URL}/questions`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
};

export const addQuestion = async (question) => {
    try {
        const response = await fetch(`${API_URL}/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(question),
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding question:", error);
    }
};
