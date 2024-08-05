let playerNames = [];
let scores = [];
let penalties = [];
let dealerIndex = 0;
let targetScore = 0;
let roundResults = [];
let chooserIndex = -1;

document.getElementById('startSetup').addEventListener('click', () => {
    targetScore = parseInt(document.getElementById('targetScore').value);
    const playerCount = parseInt(document.getElementById('playerCount').value);

    scores = Array(playerCount).fill(0);
    penalties = Array(playerCount).fill(0);

    const playerNamesDiv = document.getElementById('playerNames');
    playerNamesDiv.innerHTML = '';
    for (let i = 0; i < playerCount; i++) {
        const label = document.createElement('label');
        label.textContent = `Введите имя игрока ${i + 1}:`;
        const input = document.createElement('input');
        input.id = `playerName${i}`;
        playerNamesDiv.appendChild(label);
        playerNamesDiv.appendChild(input);
    }

    document.getElementById('setup').classList.add('hidden');
    document.getElementById('nameInput').classList.remove('hidden');
});

document.getElementById('startGame').addEventListener('click', () => {
    const playerCount = scores.length;
    for (let i = 0; i < playerCount; i++) {
        playerNames[i] = document.getElementById(`playerName${i}`).value;
    }

    document.getElementById('nameInput').classList.add('hidden');
    document.getElementById('gameTabs').classList.remove('hidden');
    document.getElementById('game').classList.add('active');

    updateGameUI();
});

document.getElementById('nextRound').addEventListener('click', () => {
    const chooserCheckboxes = document.querySelectorAll('.chooserCheckbox');
    chooserCheckboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            chooserIndex = index;
        }
    });

    const roundScores = [];
    for (let i = 0; i < playerNames.length; i++) {
        roundScores[i] = parseInt(document.getElementById(`score${i}`).value);
    }

    let maxScore = roundScores[0];
    let maxIndex = 0;

    for (let i = 1; i < playerNames.length; i++) {
        if (roundScores[i] > maxScore) {
            maxScore = roundScores[i];
            maxIndex = i;
        }
    }

    let currentRoundPenalties = Array(playerNames.length).fill(0);
    if (roundScores[chooserIndex] < maxScore) {
        penalties[chooserIndex]++;
        currentRoundPenalties[chooserIndex] = penalties[chooserIndex];
        if (penalties[chooserIndex] >= 3) {
            scores[chooserIndex] -= 100;
        }
        scores[maxIndex] += roundScores[chooserIndex];
    }

    for (let i = 0; i < playerNames.length; i++) {
        if (i !== chooserIndex || roundScores[chooserIndex] >= maxScore) {
            scores[i] += roundScores[i];
        }
    }

    dealerIndex = (dealerIndex + 1) % playerNames.length;

    roundResults.push({
        round: roundResults.length + 1,
        scores: [...roundScores],
        penalties: [...penalties],
        chooserIndex: chooserIndex
    });

    updateGameUI();
    updateResultsTable();

    for (let score of scores) {
        if (score >= targetScore) {
            alert(`Игрок ${playerNames[scores.indexOf(score)]} победил с ${score} очками!`);
            return;
        }
    }
});

function updateGameUI() {
    document.getElementById('dealerLabel').textContent = `Раздает игрок: ${playerNames[dealerIndex]} (${dealerIndex + 1})`;

    const scoreInputsDiv = document.getElementById('scoreInputs');
    scoreInputsDiv.innerHTML = '';
    for (let i = 0; i < playerNames.length; i++) {
        const label = document.createElement('label');
        label.textContent = `Введите количество очков для игрока ${playerNames[i]} (${i + 1}):`;
        const input = document.createElement('input');
        input.id = `score${i}`;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('chooserCheckbox');
        scoreInputsDiv.appendChild(label);
        scoreInputsDiv.appendChild(input);
        scoreInputsDiv.appendChild(checkbox);
    }

    const scoreBoardDiv = document.getElementById('scoreBoard');
    scoreBoardDiv.innerHTML = '';
    for (let i = 0; i < playerNames.length; i++) {
        const scoreLabel = document.createElement('label');
        scoreLabel.textContent = `${playerNames[i]} (${i + 1}) - Текущие очки: ${scores[i]}, Количество Б: ${penalties[i]}`;
        scoreBoardDiv.appendChild(scoreLabel);
    }
}

function updateResultsTable() {
    const resultsTableBody = document.getElementById('resultsTable').querySelector('tbody');
    resultsTableBody.innerHTML = '';

    recalculatePenalties();
    recalculateScoresAndPenalties();

    roundResults.forEach((result, roundIndex) => {
        result.scores.forEach((score, playerIndex) => {
            const finalScore = calculateFinalScore(score, result.penalties[playerIndex], roundIndex, playerIndex);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${roundIndex + 1}</td>
                <td>${playerNames[playerIndex]} (${playerIndex + 1})</td>
                <td><input type="text" value="${score}" data-round="${roundIndex}" data-player="${playerIndex}" class="scoreInput"></td>
                <td>${finalScore}</td>
                <td>${result.penalties[playerIndex]}</td>
                <td><button class="editButton" data-round="${roundIndex}" data-player="${playerIndex}">Редактировать</button></td>
            `;
            resultsTableBody.appendChild(row);
        });
    });

    document.querySelectorAll('.editButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const roundIndex = event.target.getAttribute('data-round');
            const playerIndex = event.target.getAttribute('data-player');
            const newScore = parseInt(document.querySelector(`input[data-round="${roundIndex}"][data-player="${playerIndex}"]`).value);

            roundResults[roundIndex].scores[playerIndex] = newScore;

            recalculateScoresAndPenalties();
            updateGameUI();
            updateResultsTable();
        });
    });
}

function calculateFinalScore(score, penalty, roundIndex, playerIndex) {
    let finalScore = calculateCumulativeScore(roundIndex, playerIndex);
    if (penalty >= 3) {
        finalScore -= 100;
    } else if (penalty > 0) {
        finalScore = 0;
    }
    return finalScore;
}

function calculateCumulativeScore(roundIndex, playerIndex) {
    let cumulativeScore = 0;
    for (let i = 0; i <= roundIndex; i++) {
        cumulativeScore += roundResults[i].scores[playerIndex];
    }
    return cumulativeScore;
}

function recalculateScoresAndPenalties() {
    scores = Array(playerNames.length).fill(0);
    penalties = Array(playerNames.length).fill(0);

    roundResults.forEach(result => {
        let maxScore = result.scores[0];
        let maxIndex = 0;

        for (let i = 1; i < playerNames.length; i++) {
            if (result.scores[i] > maxScore) {
                maxScore = result.scores[i];
                maxIndex = i;
            }
        }

        if (result.scores[result.chooserIndex] < maxScore) {
            penalties[result.chooserIndex]++;
            if (penalties[result.chooserIndex] >= 3) {
                scores[result.chooserIndex] -= 100;
            }
            scores[maxIndex] += result.scores[result.chooserIndex];
        }

        for (let i = 0; i < playerNames.length; i++) {
            if (i !== result.chooserIndex || result.scores[result.chooserIndex] >= maxScore) {
                scores[i] += result.scores[i];
            }
        }
    });
}

function recalculatePenalties() {
    penalties = Array(playerNames.length).fill(0);

    roundResults.forEach(result => {
        let maxScore = result.scores[0];
        let maxIndex = 0;

        for (let i = 1; i < playerNames.length; i++) {
            if (result.scores[i] > maxScore) {
                maxScore = result.scores[i];
                maxIndex = i;
            }
        }

        if (result.scores[result.chooserIndex] < maxScore) {
            penalties[result.chooserIndex]++;
        }
        result.penalties = [...penalties];
    });
}

// Вкладки для переключения
document.querySelectorAll('.tablink').forEach(button => {
    button.addEventListener('click', (event) => {
        document.querySelectorAll('.tablink').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tabcontent').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tabcontent').forEach(tab => tab.classList.add('hidden'));

        event.target.classList.add('active');
        document.getElementById(event.target.dataset.tab).classList.add('active');
        document.getElementById(event.target.dataset.tab).classList.remove('hidden');
    });
});
