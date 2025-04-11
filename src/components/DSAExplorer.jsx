import React, { useState, useEffect } from "react";
import { marked } from "marked";

const API_URL = "https://dsa-explorer-backend.vercel.app";


const correctPassword = "dsadsa";

const DSAExplorer = () => {
    const [categories, setCategories] = useState({});
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [allSelectedQuestions, setAllSelectedQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [revisionMode, setRevisionMode] = useState(false);
    const [revisionQuestions, setRevisionQuestions] = useState([]);
    const [checkedQuestions, setCheckedQuestions] = useState(new Set());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [checkedTopics, setCheckedTopics] = useState([]);


    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categories`);
            if (!response.ok) throw new Error("Failed to fetch categories.");

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Invalid API response format.");

            const formattedData = data.reduce((acc, category) => {
                acc[category.categoryName] = category.questions;
                return acc;
            }, {});

            setCategories(formattedData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async () => {
        const categoryName = prompt("Enter new category name:");
        if (!categoryName) return;

        const password = prompt("Enter admin password:");
        if (!password) {
            alert("❌ Password is required.");
            return;
        }
    
       
        if (password !== correctPassword) {
            alert("❌ Incorrect password. Access denied.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryName }),
            });

            if (!response.ok) throw new Error("Failed to add category.");
            fetchCategories();
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    };

    const addQuestion = async () => {
        const category = prompt("Enter category to add question:");
        if (!category || !categories[category]) {
            alert("❌ Invalid category.");
            return;
        }

        const password = prompt("Enter admin password:");
        if (!password) {
            alert("❌ Password is required.");
            return;
        }
    
        
        if (password !== correctPassword) {
            alert("❌ Incorrect password. Access denied.");
            return;
        }

        const title = prompt("Enter question title:");
        const description = prompt("Enter question description:");
        const markdown = prompt("Enter question markdown:");

        if (!title || !description || !markdown) {
            alert("❌ Please fill all fields.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/categories/${category}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, markdown }),
            });

            if (!response.ok) throw new Error("Failed to add question.");
            fetchCategories();
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    };

    const updateTopics = () => {
        if (checkedTopics.length === 0) {
            alert("❌ Please select at least one topic.");
            return;
        }

        setSelectedTopics(checkedTopics);
        const mergedQuestions = checkedTopics.flatMap((topic) => categories[topic] || []);
        setAllSelectedQuestions(mergedQuestions);
        setCurrentQuestionIndex(0);
    };

    const nextQuestion = () => {
        if (allSelectedQuestions.length > 0) {
            setCurrentQuestionIndex((prev) => (prev + 1) % allSelectedQuestions.length);
        }
    };

    const prevQuestion = () => {
        if (allSelectedQuestions.length > 0) {
            setCurrentQuestionIndex((prev) =>
                prev === 0 ? allSelectedQuestions.length - 1 : prev - 1
            );
        }
    };

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
        document.body.classList.toggle("dark-mode");
    };

    const startRevision = () => {
        if (checkedTopics.length === 0) {
            alert("❌ Please select at least one topic.");
            return;
        }

        const numQuestions = parseInt(prompt("Enter the number of questions to practice:"), 10);
        if (isNaN(numQuestions) || numQuestions <= 0) {
            alert("❌ Please enter a valid number.");
            return;
        }

        const selectedQuestions = checkedTopics.flatMap((topic) => categories[topic] || []);
        const shuffledQuestions = selectedQuestions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);

        if (shuffledQuestions.length === 0) {
            alert("❌ No questions available in the selected topics.");
            return;
        }

        setRevisionQuestions(shuffledQuestions);
        setCheckedQuestions(new Set());
        setRevisionMode(true);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };
    useEffect(() => {
        if (revisionMode && checkedQuestions.size === revisionQuestions.length && revisionQuestions.length > 0) {
            alert("🎉 Well done! You've completed your revision!");
            setRevisionMode(false);
        }
    }, [checkedQuestions, revisionQuestions, revisionMode]);
    const toggleCheckbox = (index) => {
        setCheckedQuestions((prev) => {
            const updatedChecked = new Set(prev);
            updatedChecked.has(index) ? updatedChecked.delete(index) : updatedChecked.add(index);
            return updatedChecked;
        });
    };
    // Swipe Navigation for Mobile
    // 🔥 FIXED: Swipe Navigation Now Works
    useEffect(() => {
        let startX = 0;

        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
        };

        const handleTouchEnd = (e) => {
            const endX = e.changedTouches[0].clientX;
            const swipeThreshold = 50;

            if (startX - endX > swipeThreshold) {
                nextQuestion();
            } else if (endX - startX > swipeThreshold) {
                prevQuestion();
            }
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [allSelectedQuestions.length]); // ✅ FIX: No need for `currentQuestionIndex`

    
   

    if (loading) return <h2>Loading categories...</h2>;
    if (error) return <h2 style={{ color: "red" }}>❌ {error}</h2>;

    if (revisionMode) {
        return (
            <div className={`container ${darkMode ? "dark" : ""}`}>
                <header className="revision-header">
                    <h1>Revise</h1>
                    <button className="exit-revision" onClick={() => setRevisionMode(false)}>🏠 Exit Revision</button>
                </header>

                <main className="revision-container">
                    {revisionQuestions.map((question, index) => (
                        <div key={index} className="revision-card">
                            <div className="revision-checkbox">
                                <input
                                    type="checkbox"
                                    checked={checkedQuestions.has(index)}
                                    onChange={() => toggleCheckbox(index)}
                                />
                            </div>
                            <div className="revision-content">
                                <h2>{question.title}</h2>
                                <p>{question.description}</p>
                                <div
                                    className="markdown"
                                    dangerouslySetInnerHTML={{ __html: marked.parse(question.markdown || "") }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        );
    }

    const currentQuestion = allSelectedQuestions[currentQuestionIndex] || {};

    return (
        <div className={`container ${darkMode ? "dark" : ""}`}>
            <header>
                <h1>DSA Explorer</h1>
                <button className="hamburger" onClick={toggleSidebar}>☰</button>
            </header>

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={toggleSidebar}>✖</button>
                <h2>Select Topics</h2>
                <div className="topic-list">
                    {Object.keys(categories).length === 0 ? (
                        <p>No topics available. Check API response.</p>
                    ) : (
                        Object.keys(categories).map((topic) => (
                            <div className="topic-item" key={topic}>
                                <input
                                    type="checkbox"
                                    id={topic}
                                    value={topic}
                                    onChange={(e) => {
                                        const updatedTopics = e.target.checked
                                            ? [...checkedTopics, e.target.value]
                                            : checkedTopics.filter(t => t !== e.target.value);
                                        setCheckedTopics(updatedTopics);
                                    }}
                                />
                                <label htmlFor={topic}>{topic.replace("_", " ")}</label>
                            </div>
                        ))
                    )}
                </div>
                <button onClick={updateTopics}>Load Questions</button>
                <button onClick={startRevision}>📖 For Revision</button>
                <button onClick={addCategory}>➕ Add Category</button>
                <button onClick={addQuestion}>➕ Add Question</button>
                <button onClick={toggleDarkMode}>
                    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
                
            </aside>

            {/* Question Display */}
            <main className="question-box">
                <h2>{currentQuestion.title || "Select topics to begin"}</h2>
                <p>{currentQuestion.description || ""}</p>
                <div
                    className="markdown"
                    id="markdown-content"
                    dangerouslySetInnerHTML={{ __html: marked.parse(currentQuestion.markdown || "") }}
                ></div>

                <div className="nav-buttons">
                    <button onClick={prevQuestion} disabled={allSelectedQuestions.length === 0}>Previous</button>
                    <button onClick={nextQuestion} disabled={allSelectedQuestions.length === 0}>Next</button>
                    
                </div>
            </main>
        </div>
    );
};

export default DSAExplorer;
