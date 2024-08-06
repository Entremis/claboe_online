function addPlayer() {
    var newInput = document.createElement("input");
    newInput.type = "text";
    newInput.name = "playerName";
    newInput.placeholder = "Имя игрока";
    document.getElementById("playerNames").appendChild(newInput);
}

document.getElementById('gameSetup').onsubmit = function(event) {
    event.preventDefault();
    var gameSize = document.querySelector('input[name="gameSize"]:checked').value;
    var playerNames = Array.from(document.querySelectorAll('input[name="playerName"]'))
                           .map(input => input.value)
                           .filter(name => name.trim() !== '');
    localStorage.setItem('gameSize', gameSize);
    localStorage.setItem('playerNames', JSON.stringify(playerNames));
    window.location.href = 'game_page.html'; // Переход на страницу игры
};
