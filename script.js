// script.js

let quizData = []; // Starts empty
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let isReviewMode = false;

// DOM Elements
const questionText = document.getElementById("question-text");
const choicesContainer = document.getElementById("choices-container");
const explanationBox = document.getElementById("explanation-box");
const progressText = document.getElementById("progress-text");
const liveScore = document.getElementById("live-score");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const quizScreen = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");

// 1. FETCH THE DATA
async function loadQuizData() {
    try {
        const response = await fetch('exit_honey.json');
        if (!response.ok) throw new Error("Could not load questions.");
        
        quizData = await response.json();
        userAnswers = new Array(quizData.length).fill(null);
        
        // Start the quiz once data is ready
        renderQuestion();
    } catch (error) {
        questionText.innerText = "Error loading questions. Please ensure you are using a local server.";
        console.error(error);
    }
}

// 2. RENDER QUESTION
function renderQuestion() {
    const currentData = quizData[currentQuestionIndex];
    
    questionText.innerText = currentData.question;
    progressText.innerText = `${currentQuestionIndex + 1}/${quizData.length}`;
    explanationBox.innerText = currentData.explanation;
    explanationBox.style.display = "none";
    choicesContainer.innerHTML = "";

    const alreadyAnswered = userAnswers[currentQuestionIndex] !== null;

    currentData.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.classList.add("choice-btn");
        btn.innerText = choice;
        
        if (alreadyAnswered) {
            btn.classList.add("disabled");
            const selectedChoice = userAnswers[currentQuestionIndex];
            if (choice === currentData.answer) btn.classList.add("correct");
            else if (choice === selectedChoice) btn.classList.add("incorrect");
            else btn.classList.add("grayed");
        } else {
            btn.onclick = () => handleSelection(btn, choice, currentData.answer);
        }
        choicesContainer.appendChild(btn);
    });

    if (alreadyAnswered) explanationBox.style.display = "block";
    
    nextBtn.disabled = !alreadyAnswered;
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.innerText = (currentQuestionIndex === quizData.length - 1) ? "Finish Quiz" : "Next";
}

// 3. HANDLE USER SELECTION
function handleSelection(selectedBtn, selectedChoice, correctAnswer) {
    userAnswers[currentQuestionIndex] = selectedChoice;
    
    if (selectedChoice === correctAnswer) {
        score++;
        liveScore.innerText = score;
    }

    renderQuestion(); // Re-render to apply "already answered" styles
}

// 4. NAVIGATION
function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function showResults() {
    quizScreen.classList.add("hidden");
    resultsScreen.classList.remove("hidden");
    resultsScreen.style.display = "block";
    document.getElementById("final-score").innerText = score;
    document.getElementById("total-questions").innerText = quizData.length;
}

function reviewQuiz() {
    resultsScreen.style.display = "none";
    quizScreen.classList.remove("hidden");
    currentQuestionIndex = 0; 
    renderQuestion();
}

// Initial Call
loadQuizData();