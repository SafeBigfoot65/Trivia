import React, {useEffect, useState} from 'react';

function Score({selectedAnswers, data, shuffledAnswers}){

    if (!data || !Array.isArray(data) || !shuffledAnswers) return null;

    let correctCount = 0;
    let numQuestions = data.length;

    data.forEach((q, idx) => {
        const userIdx = selectedAnswers[idx];
        if (shuffledAnswers[idx][userIdx] === q.correct_answer) {
            correctCount++;
        }
    });

    const [openDropdowns, setOpenDropdowns] = useState(Array(numQuestions).fill(false));

    function toggleDropdown(idx) {
        setOpenDropdowns(prev => {
            const updated = [...prev];
            updated[idx] = !updated[idx];
            return updated;
        });
    }

    function scoreColor(){
        const percent = Number(correctCount/numQuestions) * 100;

        if (percent <= 69) {
            return "red";
        } else if (percent <= 89) {
            return "darkorange";
        } else {
            return "green";
        }
    }
    function answerColor(isCorrect){return isCorrect ? "green" : "red";}

    return (
        <div className="score">
            <h2>Your Score: <span style = {{color: scoreColor()}}>{correctCount} / {numQuestions}</span></h2>
            <ul>
                {data.map((q, idx) => {
                    const userIdx = selectedAnswers[idx];
                    const userAnswer = shuffledAnswers[idx][userIdx];
                    const isCorrect = userAnswer === q.correct_answer;
                    return (
                        <li key={idx}>
                            <button onClick={() => toggleDropdown(idx)}
                                style = {
                                    {
                                        boxShadow: `2px 2px 2px ${answerColor(isCorrect)}`,
                                        border: `3px solid ${answerColor(isCorrect)}`
                                    }
                                }>
                                {isCorrect ? "✅" : "❌"} Question {idx + 1}
                                {openDropdowns[idx] ? " ▲" : " ▼"}
                            </button>
                            {openDropdowns[idx] && (
                                <div className='answers-display-for-score'>
                                    
                                    <hr></hr>
                                    
                                    <div id = "text">
                                        <strong>Question:</strong> <span dangerouslySetInnerHTML={{ __html: q.question }} />
                                    </div>
                                    <div id = "text">
                                        <strong style = {{color: `${answerColor(isCorrect)}`}}>Your answer:</strong> <span dangerouslySetInnerHTML={{ __html: userAnswer }} />
                                    </div>
                                    <div id = "text">
                                        <strong>Correct answer:</strong> <span dangerouslySetInnerHTML={{ __html: q.correct_answer }} />
                                    </div>

                                    <hr></hr>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
export default Score;