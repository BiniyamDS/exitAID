// script.js

const quizData = [
    {
        "question": "What does HTML stand for?",
        "choices": [
            "Hyper Text Preprocessor",
            "Hyper Text Markup Language",
            "Hyper Terminal Motor Logic",
            "Hyperlink and Text Markup Language"
        ],
        "answer": "Hyper Text Markup Language",
        "explanation": "HTML stands for Hyper Text Markup Language. It is the standard markup language for creating web pages."
    },
    {
        "question": "Which of the following is not a JavaScript data type?",
        "choices": ["Undefined", "Number", "Boolean", "Float"],
        "answer": "Float",
        "explanation": "In JavaScript, 'Float' is not a separate data type. All numbers are 64-bit floating-point numbers, and the data type is simply 'Number'."
    },
    {
        "question": "What is the correct CSS syntax to change the background color?",
        "choices": [
            "body:color=yellow;",
            "body {background-color: yellow;}",
            "{body:color=yellow;}",
            "{body;color:yellow;}"
        ],
        "answer": "body {background-color: yellow;}",
        "explanation": "In CSS, the selector is followed by a declaration block in curly braces. The property 'background-color' is used to change the background color."
    }
];

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = new Array(quizData.length).fill(null); 
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

function loadQuestion() {
    const currentData = quizData[currentQuestionIndex];
    
    // Update UI Texts
    questionText.innerText = currentData.question;
    progressText.innerText = `${currentQuestionIndex + 1}/${quizData.length}`;
    explanationBox.innerText = currentData.explanation;
    explanationBox.style.display = "none";

    // Clear choices
    choicesContainer.innerHTML = "";

    const alreadyAnswered = userAnswers[currentQuestionIndex] !== null;

    // Generate choice buttons
    currentData.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.classList.add("choice-btn");
        btn.innerText = choice;
        
        if (alreadyAnswered) {
            btn.classList.add("disabled");
            const selectedChoice = userAnswers[currentQuestionIndex];
            
            if (choice === currentData.answer) {
                btn.classList.add("correct");
            } else if (choice === selectedChoice) {
                btn.classList.add("incorrect");
            } else {
                btn.classList.add("grayed");
            }
        } else {
            btn.onclick = () => selectChoice(btn, choice, currentData.answer);
        }

        choicesContainer.appendChild(btn);
    });

    if (alreadyAnswered) {
        explanationBox.style.display = "block";
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true; 
    }

    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === quizData.length - 1 && alreadyAnswered) {
        nextBtn.innerText = "Finish Quiz";
    } else {
        nextBtn.innerText = "Next";
    }
}

function selectChoice(selectedBtn, selectedChoice, correctAnswer) {
    const buttons = choicesContainer.querySelectorAll(".choice-btn");
    
    userAnswers[currentQuestionIndex] = selectedChoice;
    
    if (selectedChoice === correctAnswer) {
        score++;
        liveScore.innerText = score;
    }

    buttons.forEach(btn => {
        btn.classList.add("disabled"); 
        
        if (btn.innerText === correctAnswer) {
            btn.classList.add("correct");
        } else if (btn === selectedBtn) {
            btn.classList.add("incorrect");
        } else {
            btn.classList.add("grayed");
        }
    });

    explanationBox.style.display = "block";
    nextBtn.disabled = false;

    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.innerText = "Finish Quiz";
    }
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        showResults();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
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
    isReviewMode = true;
    resultsScreen.style.display = "none";
    quizScreen.classList.remove("hidden");
    currentQuestionIndex = 0; 
    loadQuestion();
}

// Initialize Quiz
loadQuestion();