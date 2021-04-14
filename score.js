// ==================== SCOREBOARD =============================

function scoreBoard() {
    let first = document.getElementById('first');
    let second = document.getElementById('second');
    let third = document.getElementById('third');
    let fName = document.getElementById('name');
    let sName = document.getElementById('name2');
    let tName = document.getElementById('name3');
    let highScoreNameBox = document.getElementById('highscoreName');
    let highscoreName = document.getElementById('pName');
    let submithighScore = document.getElementById('submitName');
    let tooLong = document.getElementById('toolong');
    let loopRunner = 0;
    if (score >= first.innerText || score >= second.innerText || score >= third.innerText) {
        document.querySelector('#welcome').style.display = 'none';
        document.querySelector('#menu').style.display = 'none';
        highScoreNameBox.style.display = 'flex';
    } else {
        alert(`Game Over \n Score: ${score}`);
        document.querySelector('#welcome').style.display = '';
        document.querySelector('#menu').style.display = '';
    }

    // passar að notandanafn sé ekki of langt fyrir listann
    submithighScore.addEventListener('click', () => {
        let name = highscoreName.value;
        if (name.length > 6) {
            highscoreName.value = '';
            tooLong.style.display = 'flex';
        } else {
            tooLong.style.display = 'none';
            if (loopRunner === 0) {
                scoreFinder();
            }
        }
    })

    function scoreFinder() {
        let name = highscoreName.value;
        if (score > first.innerText) {
            third.innerText = second.innerText;
            tName.innerText = sName.innerText;
            second.innerText = first.innerText;
            sName.innerText = fName.innerText;
            fName.innerText = '=> ' + name;
            first.innerText = score;
            highScoreNameBox.style.display = 'none';
            document.querySelector('#welcome').style.display = '';
            document.querySelector('#menu').style.display = '';
        } else if (score >= second.innerText && score < first.innerText) {
            third.innerText = second.innerText;
            tName.innerText = sName.innerText;
            sName.innerText = '=> ' + name;
            second.innerText = score;
            highScoreNameBox.style.display = 'none';
            document.querySelector('#welcome').style.display = '';
            document.querySelector('#menu').style.display = '';
        } else if (score >= third.innerText && score < second.innerText) {
            tName.innerText = '=> ' + name;
            third.innerText = score;
            highScoreNameBox.style.display = 'none';
            document.querySelector('#welcome').style.display = '';
            document.querySelector('#menu').style.display = '';
        }
        else {
            alert(`Reyndu Aftur! \n Score: ${score}`);
            document.querySelector('#welcome').style.display = '';
            document.querySelector('#menu').style.display = '';
        }
        loopRunner++;
    }
}