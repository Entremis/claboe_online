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
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('results').classList.remove('hidden');

    updateGameUI();
});

document.getElementById('nextRound').addEventListener('click', () => {
    chooserIndex = parseInt(document.getElementById('chooser').value) - 1;
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

    if (roundScores[chooserIndex] < maxScore) {
        penalties[chooserIndex]++;
        if (penalties[chooserIndex] >= 3) {
            scores[chooserIndex] -= 100;
        }
        scores[maxIndex] += roundScores[chooserIndex]; // Добавляем очки chooser к maxIndex
    }

    for (let i = 0; i < playerNames.length; i++) {
        if (i !== chooserIndex || roundScores[chooserIndex] >= maxScore) {
            scores[i] += roundScores[i]; // добавляем очки, кроме случая, когда chooser набрал меньше очков
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
        scoreInputsDiv.appendChild(label);
        scoreInputsDiv.appendChild(input);
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

    roundResults.forEach((result, roundIndex) => {
        result.scores.forEach((score, playerIndex) => {
            const finalScore = calculateFinalScore(score, result.penalties[playerIndex], result, playerIndex);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${roundIndex + 1}</td>
                <td>${playerNames[playerIndex]} (${playerIndex + 1})</td>
                <td><input type="text" value="${score}" data-round="${roundIndex}" data-player="${playerIndex}" class="scoreInput"></td>
                <td>${finalScore}</td>
                <td>${penalties[playerIndex]}</td>
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

function calculateFinalScore(score, penalty, result, playerIndex) {
    let finalScore = scores[playerIndex]; // изменил здесь для использования итогового счета
    if (penalty >= 3) {
        finalScore -= 100;
    }
    if (result.chooserIndex === playerIndex && result.scores[playerIndex] < Math.max(...result.scores)) {
        finalScore = 0;
    }
    return finalScore;
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
            scores[maxIndex] += result.scores[result.chooserIndex]; // добавляем очки chooser к maxIndex
        }

        for (let i = 0; i < playerNames.length; i++) {
            if (i !== result.chooserIndex || result.scores[result.chooserIndex] >= maxScore) {
                scores[i] += result.scores[i]; // добавляем очки, кроме случая, когда chooser набрал меньше очков
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
    });
}
