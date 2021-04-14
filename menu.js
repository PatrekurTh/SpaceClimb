// ================= DOM SKIPANIR =======================

const instructionsMenu = document.getElementById('instructionsMenu');
const instructionButton = document.getElementById('instructionsButton');
const menu = document.getElementById('menu');
const highscoreButton = document.getElementById('highscoreButton');
const highscoreMenu = document.getElementById('highscore');
const back = document.getElementById('back');
const instructionsback = document.getElementById('instructionsback');

instructionButton.addEventListener('click', () => {
    if (instructionsMenu.style.display === 'none') {
        instructionsMenu.style.display = 'flex';
    } else {
        instructionsMenu.style.display = 'none';
    }
});
instructionsback.addEventListener('click', () => {
    instructionsMenu.style.display = 'none';
})
highscoreButton.addEventListener('click', () => {
    if (highscoreMenu.style.display === 'none') {
        highscoreMenu.style.display = 'flex';
    }
    else {
        highscoreMenu.style.display = 'none';
    }
});
back.addEventListener('click', () => {
    highscoreMenu.style.display = 'none';
})