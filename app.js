let playerNames = [];
let scores = [];
let penalties = [];
let dealerIndex = 0;
let targetScore = 0;

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

    updateGameUI();
});

document.getElementById('nextRound').addEventListener('click', () => {
    const chooserIndex = parseInt(document.getElementById('chooser').value) - 1;
    const roundScores = [];
    for (let i = 0; i < playerNames.length; i++) {
        roundScores[i] = parseInt(document.getElementById(`score${i}`).value);
    }

    let chooserWon = true;
    let maxScore = roundScores[0];
    let maxIndex = 0;

    for (let i = 1; i < playerNames.length; i++) {
        if (roundScores[i] > maxScore) {
            maxScore = roundScores[i];
            maxIndex = i;
        }
        if (roundScores[i] >= roundScores[chooserIndex] && i !== chooserIndex) {
            chooserWon = false;
        }
    }

    if (!chooserWon) {
        penalties[chooserIndex]++;
        if (penalties[chooserIndex] >= 3) {
            scores[chooserIndex] -= 100;
        }
        scores[maxIndex] += roundScores[chooserIndex];
        roundScores[chooserIndex] = 0;
    }

    for (let i = 0; i < playerNames.length; i++) {
        scores[i] += roundScores[i];
    }

    dealerIndex = (dealerIndex + 1) % playerNames.length;

    updateGameUI();

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
