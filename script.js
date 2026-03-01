// script.js

let quizData = []; // Starts empty
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let isReviewMode = false;
let currentQuizId = null; // Store the local storage key

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

// New selection elements
const selectionScreen = document.getElementById("selection-screen");
const quizSelect = document.getElementById("quiz-select");
const loadQuizBtn = document.getElementById("load-quiz-btn");

// Bundled quizzes (add filenames that exist in the project)
const bundledQuizzes = [
    { name: 'Exit Honey', file: 'questions/exit_honey.json' },
    { name: 'Exit 01', file: 'questions/exit_01.json' },
    { name: 'Exit Feb', file: 'questions/exit_feb_1.json' },
    { name: 'Exit Jul', file: 'questions/exit_jul.json' }
    // Add more quizzes here if needed
];

// Populate the selection dropdown
function populateQuizOptions() {
    quizSelect.innerHTML = '';
    bundledQuizzes.forEach(q => {
        const opt = document.createElement('option');
        opt.value = q.file;
        opt.innerText = q.name;
        quizSelect.appendChild(opt);
    });
}

// 1. FETCH THE DATA (accepts only a URL string)
async function loadQuizData(source) {
    try {
        let data;

        if (!source) throw new Error('No quiz source provided.');

        const response = await fetch(source);
        if (!response.ok) throw new Error("Could not load questions.");
        data = await response.json();

        // Basic validation
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Quiz data is invalid or empty.');
        }

        quizData = data;
        currentQuizId = source; // Use source as unique quiz identifier

        // Check local storage for saved progress
        const savedData = localStorage.getItem(currentQuizId);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            currentQuestionIndex = parsed.currentQuestionIndex || 0;
            score = parsed.score || 0;
            userAnswers = parsed.userAnswers || new Array(quizData.length).fill(null);
        } else {
            currentQuestionIndex = 0;
            score = 0;
            userAnswers = new Array(quizData.length).fill(null);
        }

        liveScore.innerText = score;

        // Hide selection and show quiz
        selectionScreen.style.display = 'none';
        quizScreen.style.display = 'block';
        resultsScreen.style.display = 'none';

        // Start the quiz once data is ready
        renderQuestion();
    } catch (error) {
        questionText.innerText = "Error loading questions. Please ensure the JSON is valid and you are using a local server if loading bundled files.";
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

    // OPTIMIZATION 2: Use a DocumentFragment to batch DOM insertions
    const fragment = document.createDocumentFragment();

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

        fragment.appendChild(btn); // Append to the fragment instead of directly to the DOM
    });

    // Append all buttons to the DOM at once
    choicesContainer.appendChild(fragment);

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

    saveProgress();

    // OPTIMIZATION 1: Update the existing DOM elements instead of re-rendering everything
    const allChoiceBtns = choicesContainer.querySelectorAll('.choice-btn');

    allChoiceBtns.forEach(btn => {
        btn.classList.add("disabled"); // Disable all buttons to prevent multiple clicks
        btn.onclick = null; // Clean up event listeners

        const choiceText = btn.innerText;
        if (choiceText === correctAnswer) {
            btn.classList.add("correct");
        } else if (choiceText === selectedChoice) {
            btn.classList.add("incorrect");
        } else {
            btn.classList.add("grayed");
        }
    });

    explanationBox.style.display = "block";
    nextBtn.disabled = false;
}

// 4. NAVIGATION
function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        saveProgress();
        renderQuestion();
    } else {
        showResults();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        saveProgress();
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

    // Reset to single question view
    if (typeof isReviewListMode !== 'undefined') {
        isReviewListMode = false;
        document.getElementById("single-question-view").style.display = "block";
        document.getElementById("all-questions-view").style.display = "none";
    }

    currentQuestionIndex = 0;
    renderQuestion();
}

// Progress Management
function saveProgress() {
    if (!currentQuizId) return;
    const dataToSave = {
        currentQuestionIndex,
        score,
        userAnswers
    };
    localStorage.setItem(currentQuizId, JSON.stringify(dataToSave));
}

function resetProgress() {
    if (!currentQuizId) return;
    if (confirm("Are you sure you want to reset your progress for this quiz?")) {
        localStorage.removeItem(currentQuizId);
        currentQuestionIndex = 0;
        score = 0;
        liveScore.innerText = score;
        userAnswers = new Array(quizData.length).fill(null);

        if (typeof isReviewListMode !== 'undefined' && isReviewListMode) {
            renderAllQuestions();
        } else {
            renderQuestion();
        }
    }
}

// 5. REVIEW MODE LIST
let isReviewListMode = false;

function toggleReviewMode() {
    isReviewListMode = !isReviewListMode;
    const singleView = document.getElementById("single-question-view");
    const allView = document.getElementById("all-questions-view");
    const quizContainer = document.getElementById("quiz-screen");

    if (isReviewListMode) {
        singleView.style.display = "none";
        allView.style.display = "block";
        quizContainer.classList.add("review-mode");
        renderAllQuestions();
    } else {
        singleView.style.display = "block";
        allView.style.display = "none";
        quizContainer.classList.remove("review-mode");
    }
}

function renderAllQuestions() {
    const allView = document.getElementById("all-questions-view");
    allView.innerHTML = "";
    const fragment = document.createDocumentFragment();

    quizData.forEach((data, index) => {
        const qDiv = document.createElement("div");
        qDiv.className = "review-question-card";

        const qHeader = document.createElement("div");
        qHeader.className = "review-question-header";

        const qTitle = document.createElement("div");
        qTitle.className = "question";
        qTitle.innerText = `${index + 1}. ${data.question}`;

        const maxBtn = document.createElement("button");
        maxBtn.className = "icon-btn maximize-btn";
        maxBtn.title = "Go to question";
        maxBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
        maxBtn.onclick = () => goToQuestion(index);

        qHeader.appendChild(qTitle);
        qHeader.appendChild(maxBtn);
        qDiv.appendChild(qHeader);

        const choicesDiv = document.createElement("div");
        choicesDiv.className = "choices";

        const alreadyAnswered = userAnswers[index] !== null;
        const selectedChoice = userAnswers[index];

        data.choices.forEach(choice => {
            const btn = document.createElement("button");
            btn.className = "choice-btn";
            btn.innerText = choice;
            // Only allow selection if not already answered
            if (!alreadyAnswered) {
                btn.onclick = () => {
                    userAnswers[index] = choice;
                    // Recalculate score
                    score = quizData.reduce((acc, q, i) => acc + (userAnswers[i] === q.answer ? 1 : 0), 0);
                    liveScore.innerText = score;
                    saveProgress();
                    renderAllQuestions();
                };
            } else {
                btn.classList.add("disabled");
            }
            // Visual state
            if (alreadyAnswered) {
                if (choice === data.answer) {
                    btn.classList.add("correct");
                } else if (choice === selectedChoice) {
                    btn.classList.add("incorrect");
                } else {
                    btn.classList.add("grayed");
                }
            } else if (selectedChoice === choice) {
                btn.classList.add("selected");
            }
            choicesDiv.appendChild(btn);
        });
        qDiv.appendChild(choicesDiv);

        if (alreadyAnswered && data.explanation) {
            const exp = document.createElement("div");
            exp.className = "explanation";
            exp.style.display = "block";
            exp.innerText = data.explanation;
            qDiv.appendChild(exp);
        }

        fragment.appendChild(qDiv);
    });

    allView.appendChild(fragment);
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    isReviewListMode = false;
    document.getElementById("single-question-view").style.display = "block";
    document.getElementById("all-questions-view").style.display = "none";
    document.getElementById("quiz-screen").classList.remove("review-mode");
    renderQuestion();
}

// 6. RETURN TO HOME
function returnToHome() {
    quizScreen.style.display = "none";
    resultsScreen.style.display = "none";
    selectionScreen.style.display = "block";

    // Reset review list mode
    if (typeof isReviewListMode !== 'undefined') {
        isReviewListMode = false;
        document.getElementById("single-question-view").style.display = "block";
        document.getElementById("all-questions-view").style.display = "none";
        document.getElementById("quiz-screen").classList.remove("review-mode");
    }

    // Optional cleanup
    quizData = [];
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
}

// Wire up selection UI
loadQuizBtn.addEventListener('click', () => {
    const selected = quizSelect.value;
    if (selected) loadQuizData(selected);
});

// Initial setup: populate options and show selection
populateQuizOptions();
selectionScreen.style.display = 'block';
quizScreen.style.display = 'none';
resultsScreen.style.display = 'none';