import { useEffect, useState } from "react";
import Score from './Score';

function Trivia() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [difficulty, setDifficulty] = useState('medium');
    const [questionAmount, setQuestionAmount] = useState(10);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [shuffledAnswers, setShuffledAnswers] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState([]);

    const [pendingDifficulty, setPendingDifficulty] = useState('medium');
    const [pendingQuestionAmount, setPendingQuestionAmount] = useState(10);
    const [pendingCategory, setPendingCategory] = useState('');
    
    const [showScore, setShowScore] = useState(false); 
    const [fadeOutQuiz, setFadeOutQuiz] = useState(false);

    // Fetch available categories once
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("https://opentdb.com/api_category.php");
                const json = await res.json();
                setCategories(json.trivia_categories || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch quiz questions
    const fetchQuiz = async (opts) => {
        setIsLoading(true);
        setData(null);
        setShuffledAnswers([]);
        setSelectedAnswers([]);
        setShowScore(false); // Reset score view when starting new quiz

        const { difficulty, questionAmount, category } = opts;
        const cacheKey = `triviaData-${difficulty}-${questionAmount}-${category || 'any'}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setData(parsed);
                setIsLoading(false);
                return;
            } catch (error) {
                console.error("Failed to parse cached trivia data:", error);
                sessionStorage.removeItem(cacheKey);
            }
        }

        try {
            let url = `https://opentdb.com/api.php?amount=${questionAmount}&difficulty=${difficulty}`;
            if (category) {
                url += `&category=${category}`;
            }

            const response = await fetch(url);
            const json = await response.json();
            if (json.results && json.results.length > 0) {
                setData(json.results);
                sessionStorage.setItem(cacheKey, JSON.stringify(json.results));
            } else {
                console.warn("No questions found for this combination:", { difficulty, questionAmount, category });
                setData(null);
            }
        } catch (error) {
            console.error(`Error fetching trivia data: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Shuffle answers once per data change
    useEffect(() => {
        if (data && Array.isArray(data)) {
            const shuffled = data.map(q =>
                shuffleArray([...q.incorrect_answers, q.correct_answer])
            );
            setShuffledAnswers(shuffled);
            setSelectedAnswers([]);
        } else {
            setShuffledAnswers([]);
            setSelectedAnswers([]);
        }
    }, [data]);

    function handleNewQuiz(e) {
        e.preventDefault();
        setDifficulty(pendingDifficulty);
        setQuestionAmount(pendingQuestionAmount);
        setCategory(pendingCategory);
        fetchQuiz({
            difficulty: pendingDifficulty,
            questionAmount: pendingQuestionAmount,
            category: pendingCategory
        });
    }

    function handleSelectAnswer(questionIdx, answerIdx) {
        const updated = [...selectedAnswers];
        updated[questionIdx] = answerIdx;
        setSelectedAnswers(updated);
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function handleSubmitQuiz(e) {
    e.preventDefault();
    if (selectedAnswers.length === data.length) {
        setFadeOutQuiz(true);
        setTimeout(() => {
            setShowScore(true);
            setFadeOutQuiz(false);
        }, 500); // match this with the CSS transition time
    } else {
        alert("Please answer all questions before submitting!");
    }
}
    return (
        <div className="trivia-container">
            <form>
                <h1>Toby's Trivia</h1>

                <div className="selections">
                    <label htmlFor="questionNum">Number of Questions:</label><br />
                    <input
                        type="number"
                        id="questionNum"
                        min="1"
                        max="50"
                        value={pendingQuestionAmount}
                        onChange={e => setPendingQuestionAmount(Number(e.target.value))}
                    />
                </div>

                <div className="selections">
                    <label htmlFor="difficulty">Select a difficulty:</label><br />
                    <select
                        id="difficulty"
                        value={pendingDifficulty}
                        onChange={e => setPendingDifficulty(e.target.value)}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div className="selections">
                    <label htmlFor="category">Select a category:</label><br />
                    <select
                        id="category"
                        value={pendingCategory}
                        onChange={e => setPendingCategory(e.target.value)}
                    >
                        <option value="">Any Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <button onClick={handleNewQuiz}>New Quiz</button>
            </form>

            {showScore ? (
                <div className="score-container fade-in">
                    <Score
                        selectedAnswers={selectedAnswers}
                        data={data}
                        shuffledAnswers={shuffledAnswers}
                    />
                </div>
            ) : isLoading ? (
                <p id="loading-and-generate">Loading questions...</p>
            ) : !data || data.length === 0 ? (
                <p id="loading-and-generate">Please generate a new Quiz!</p>
            ) : (
                <div className={`display-container ${fadeOutQuiz ? 'fade-out' : 'fade-in'}`}>
                    <ol className="display">
                        {data.map((q, index) => (
                            <li key={index}>
                                <span className="question-number">{index + 1}. </span>
                                <span className="question" dangerouslySetInnerHTML={{ __html: q.question }} />
                                <ul className="answer-choices">
                                    {shuffledAnswers[index] && shuffledAnswers[index].map((answer, i) => (
                                        <li key={i}>
                                            <button
                                                dangerouslySetInnerHTML={{ __html: answer }}
                                                onClick={() => handleSelectAnswer(index, i)}
                                                style={{
                                                    backgroundColor:
                                                        selectedAnswers[index] === i ? '#cce5ff' : ''
                                                }}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ol>

                    <button className="submit-quiz" onClick={handleSubmitQuiz}>
                        Submit Quiz
                    </button>
                </div>
            )}
        </div>
    );
}

export default Trivia;

