window.onload = function() {
    var playerNames = JSON.parse(localStorage.getItem('playerNames'));
    var gameForm = document.getElementById('gameForm');
    playerNames.forEach(function(name, index) {
        var div = document.createElement('div');
        div.innerHTML = '<label>' + name + '</label>' +
                        '<input type="radio" name="played" value="' + index + '"> Выбирал масть' +
                        '<input type="number" name="score' + index + '" placeholder="Очки">';
        gameForm.appendChild(div);
    });
    updateDealer();
    updateResults();
};

function recordScores() {
    var playerNames = JSON.parse(localStorage.getItem('playerNames'));
    var scoreTable = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
    var currentRound = Math.floor(scoreTable.rows.length / playerNames.length) + 1;
    var scores = [];

    playerNames.forEach(function(name, index) {
        var score = parseInt(document.querySelector('input[name="score' + index + '"]').value, 10) || 0;
        var played = document.querySelector('input[name="played"]:checked') ? (document.querySelector('input[name="played"]:checked').value == index ? 'Да' : 'Нет') : 'Нет';
        scores.push({ name: name, score: score, played: played });
    });

    scores.forEach(function(player, index) {
        var newRow = scoreTable.insertRow();

        var newCell = newRow.insertCell();
        newCell.innerText = currentRound;

        newCell = newRow.insertCell();
        newCell.innerText = player.name;

        newCell = newRow.insertCell();
        newCell.innerHTML = `<input type="number" value="${player.score}" class="editable" data-player="${player.name}" data-round="${currentRound}" onchange="handleInputChange(this)">`;

        newCell = newRow.insertCell(); // Итоговые очки
        newCell.innerText = ''; // Оставляем пустым, будет пересчитано позже

        newCell = newRow.insertCell();
        newCell.className = "beit";
        newCell.innerText = calculateBeit(scoreTable, player, scores, currentRound);

        newCell = newRow.insertCell();
        newCell.innerHTML = `<select class="editable" data-player="${player.name}" data-round="${currentRound}">
                                <option value="Да" ${player.played === 'Да' ? 'selected' : ''}>Да</option>
                                <option value="Нет" ${player.played === 'Нет' ? 'selected' : ''}>Нет</option>
                             </select>`;

        newCell = newRow.insertCell();
        newCell.innerHTML = `<button onclick="saveChanges(this)">Сохранить</button>`;
    });

    updateDealer();
    recalculateAllScores();
    updateResults();
    resetForm();
}

function resetForm() {
    var gameForm = document.getElementById('gameForm');
    gameForm.reset();
}

function calculateFinalScore(scoreTable, player, scores, currentRound) {
    var previousRoundScores = getPreviousRoundScores(scoreTable, player.name, currentRound);
    var previousScore = previousRoundScores.previousScore || 0;
    var currentScore = player.score;
    var beit = player.beit;

    if (beit > 0) {
        if (beit < 3) {
            return previousScore;
        } else {
            return previousScore - 100;
        }
    } else {
        var highestScore = Math.max(...scores.map(s => s.score));
        if (player.played === 'Нет') {
            if (player.score === highestScore) {
                var scoreWithBeit = scores.find(s => s.beit > 0)?.score || 0;
                return previousScore + currentScore + scoreWithBeit;
            } else {
                return previousScore + currentScore;
            }
        } else {
            return previousScore + currentScore;
        }
    }
}

function getPreviousRoundScores(scoreTable, playerName, currentRound) {
    for (var i = scoreTable.rows.length - 1; i >= 0; i--) {
        var row = scoreTable.rows[i];
        if (row.cells[1].innerText === playerName && parseInt(row.cells[0].innerText, 10) < currentRound) {
            return {
                previousScore: parseInt(row.cells[3].innerText, 10) || 0,
                previousBeit: row.cells[4].innerText
            };
        }
    }
    return {};
}

function saveChanges(button) {
    var row = button.parentElement.parentElement;
    var round = parseInt(row.cells[0].innerText, 10);
    var playerName = row.cells[1].innerText;
    var newScore = parseInt(row.cells[2].querySelector('input').value, 10);
    var newPlayed = row.cells[5].querySelector('select').value;

    updateRow(round, playerName, newScore, newPlayed);
    recalculateBeitFromRound(round);
    recalculateAllScores();
    updateResults();
}

function handleInputChange(input) {
    var row = input.parentElement.parentElement;
    var round = parseInt(row.cells[0].innerText, 10);
    recalculateBeitFromRound(round);
    recalculateAllScores();
    updateResults();
}

function updateRow(round, playerName, newScore, newPlayed) {
    var scoreTable = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
    for (var i = 0; i < scoreTable.rows.length; i++) {
        var row = scoreTable.rows[i];
        if (parseInt(row.cells[0].innerText, 10) === round && row.cells[1].innerText === playerName) {
            row.cells[2].querySelector('input').value = newScore;
            row.cells[5].querySelector('select').value = newPlayed;
            break;
        }
    }
}

function recalculateBeitFromRound(fromRound) {
    var scoreTable = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
    var playerNames = JSON.parse(localStorage.getItem('playerNames'));

    for (var i = fromRound - 1; i < scoreTable.rows.length; i++) {
        var row = scoreTable.rows[i];
        var round = parseInt(row.cells[0].innerText, 10);
        var playerName = row.cells[1].innerText;
        var score = parseInt(row.cells[2].querySelector('input').value, 10);
        var played = row.cells[5].querySelector('select').value;

        var scores = playerNames.map(name => {
            var playerRow = Array.from(scoreTable.rows).find(r => r.cells[0].innerText == round && r.cells[1].innerText == name);
            var playerScore = parseInt(playerRow.cells[2].querySelector('input').value, 10);
            return { name: name, score: playerScore, beit: playerRow.cells[4].innerText === '-' ? 0 : parseInt(playerRow.cells[4].innerText, 10) };
        });

        row.cells[4].innerText = calculateBeit(scoreTable, { name: playerName, score: score, played: played }, scores, round);
    }
}

function recalculateAllScores() {
    var scoreTable = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
    var playerNames = JSON.parse(localStorage.getItem('playerNames'));

    for (var i = 0; i < scoreTable.rows.length; i++) {
        var row = scoreTable.rows[i];
        var round = parseInt(row.cells[0].innerText, 10);
        var playerName = row.cells[1].innerText;
        var score = parseInt(row.cells[2].querySelector('input').value, 10);
        var played = row.cells[5].querySelector('select').value;
        var beit = row.cells[4].innerText === '-' ? 0 : parseInt(row.cells[4].innerText, 10);

        var scores = playerNames.map(name => {
            var playerRow = Array.from(scoreTable.rows).find(r => r.cells[0].innerText == round && r.cells[1].innerText == name);
            var playerScore = parseInt(playerRow.cells[2].querySelector('input').value, 10);
            return { name: name, score: playerScore, beit: playerRow.cells[4].innerText === '-' ? 0 : parseInt(playerRow.cells[4].innerText, 10) };
        });

        row.cells[3].innerText = calculateFinalScore(scoreTable, { name: playerName, score: score, played: played, beit: beit }, scores, round);
    }
}

function calculateBeit(scoreTable, player, scores, currentRound) {
    if (player.played === 'Да' && player.score < Math.max(...scores.map(s => s.score))) {
        var lastBeitValue = 0;
        for (var i = 0; i < scoreTable.rows.length; i++) {
            var row = scoreTable.rows[i];
            if (row.cells[1].innerText === player.name && parseInt(row.cells[0].innerText, 10) < currentRound) {
                var beitValue = row.cells[4].innerText;
                if (beitValue !== '-') {
                    lastBeitValue = parseInt(beitValue, 10);
                }
            }
        }
        return lastBeitValue + 1;
    }
    return '-';
}

function updateDealer() {
    var playerNames = JSON.parse(localStorage.getItem('playerNames'));
    var currentDealer = (parseInt(localStorage.getItem('currentDealer')) || 0) % playerNames.length;
    document.getElementById('dealerName').innerText = playerNames[currentDealer];
    localStorage.setItem('currentDealer', currentDealer + 1);
}

function openTab(tabName) {
    var i;
    var x = document.getElementsByClassName("tab-content");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
}

function updateResults() {
    var scoreTable = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
    var playerNames = JSON.parse(localStorage.getItem('playerNames'));
    var resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    playerNames.forEach(function(name, index) {
        var lastScore = 0;
        var maxBeit = 0;

        for (var i = 0; i < scoreTable.rows.length; i++) {
            var row = scoreTable.rows[i];
            if (row.cells[1].innerText === name) {
                lastScore = parseInt(row.cells[3].innerText, 10);
                var beit = row.cells[4].innerText === '-' ? 0 : parseInt(row.cells[4].innerText, 10);
                if (beit > maxBeit) {
                    maxBeit = beit;
                }
            }
        }

        var resultItem = document.createElement('div');
        resultItem.innerText = name + ' Очки: ' + lastScore + ', Бейт: ' + maxBeit;
        resultsDiv.appendChild(resultItem);
    });
}
