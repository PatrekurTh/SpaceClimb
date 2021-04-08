(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = window.innerWidth / 2,
    height = window.innerHeight,

    // ============ PLAYER OBJECT =====================
    player = {
        x: width / 2,
        y: height - 200,
        width: 105,
        height: 150,
        speed: 3,
        velX: 0,
        velY: 0,
        grounded: false,
        jumping: false,
    },

    // ================ GLOBAL VARIABLES ======================
    keys = [],
    friction = 0.8,
    gravity = 0.4,
    boxes = [],
    platforms = [],
    platformWidth = Math.floor(width / 3),
    score = 0,
    time = 700,
    isPlayingCounter = 0,
    isPlaying = false,
    robot = new Image(),
    platformImg = new Image(),
    song = new Audio(),
    death = new Audio(),
    jump = new Audio(),
    loop,
    numberOfPlatforms = 0;

canvas.width = width;
canvas.height = height;


// ======== STATIC PLATFORMS OG VEGGIR ===================

//pusha nokkrum static platforms í byrjun til að hefja leik
function spawnStaticPlatforms() {
    let yForStaticPlatforms = 0;
    for (let i = 0; i < 4; i++) {
        numberOfPlatforms += 1;
        if (i === 0) {
            platforms.push({
                x: 0,
                y: height - 100,
                width: width,
                height: 100,
                velY: 0,
            });
        } else {
            platforms.push({
                x: Math.floor((Math.random() * (width - platformWidth))),
                y: yForStaticPlatforms,
                width: platformWidth,
                height: 60,
                velY: 0,
            });
        }
        yForStaticPlatforms += 150;
    };
}



//vinstri veggur
//auka hæð svo ekki sé hægt að hoppa yfir vegginn
boxes.push({
    x: -10,
    y: -200,
    width: 10,
    height: height + 200
});

//hægri veggur
boxes.push({
    x: width,
    y: -200,
    width: 10,
    height: height + 200
});




jump.src = 'sound/Jump2.wav';
death.src = 'sound/death_7_ian.wav';
song.src = 'sound/technicko.wav';

// music.addEventListener('click', musicCheck);
// sound.addEventListener('click', soundCheck);

function soundCheck() {
    let sound = document.getElementById('sound');
    if (sound.checked) {
        jump.volume = 0.1;
        death.volume = 0.1;
    } else {
        death.volume = 0;
        jump.volume = 0;
    }
}

function musicCheck() {
    let music = document.getElementById('music');
    if (music.checked) {
        song.volume = 0.1
    } else {
        song.volume = 0;
    }
}






function update() {
    //=========== PLAYER IMAGE MANAGEMENT =============
    robot.src = 'img/character_robot_idle.png';

    if (player.jumping && keys['ArrowRight']) {
        if (player.velY < 0) {
            robot.src = 'img/character_robot_jump_right.png';
        } else if (player.velY > 0) {
            robot.src = 'img/character_robot_fall_right.png';
        }
    }
    else if (player.jumping && keys['ArrowLeft']) {
        if (player.velY < 0) {
            robot.src = 'img/character_robot_jump_left.png';
        } else if (player.velY > 0) {
            robot.src = 'img/character_robot_fall_left.png';
        }
    }
    else if (player.velY < 0 || player.jumping) {
        robot.src = 'img/character_robot_jump.png';
    } else if (keys['ArrowRight']) {
        robot.src = 'img/character_robot_run_right.png';
    } else if (keys['ArrowLeft']) {
        robot.src = 'img/character_robot_run_left.png';
    }


    // ================= KEY INPUTS ==========================
    if (keys[' '] || keys['ArrowUp']) {
        // up arrow eða space
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false;
            player.velY = -player.speed * 4;// breyta constant hérna til að setja jump hæð
            jump.play();
        }
    }
    if (keys['ArrowRight']) {
        // right arrow
        if (player.velX < player.speed) {
            player.velX++;
        }
    }
    if (keys['ArrowLeft']) {
        // left arrow
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    // friction sér um smooth stop í staðinn fyrir full stop og gravity að toga
    player.velX *= friction;
    player.velY += gravity;

    // ============= ALLAR HREYFINGAR GERAST SVO HÉR ==================
    player.x += player.velX * 5; // constant til að hlaupa hraðar
    player.y += player.velY * 2; // constant til að falla hraðar

    // hreinsar fyrir updates
    ctx.clearRect(0, 0, width, height);
    player.grounded = false;

    // ================ TEIKNA VEGGI OG TJÉKKAR COLLISION VIÐ PLAYER ===============================

    for (let i = 0; i < boxes.length; i++) {
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        let dir = colCheck(player, boxes[i]);

        // í stað fyrir að spilari stoppi við a hitta á vegg
        // bouncear hann aðeins út og upp
        if (dir === "l") {
            player.velX = 9;
            player.velY -= 4;
            keys["ArrowLeft"] = false;
        } else if (dir === 'r') {
            player.velX = -9;
            player.velY -= 4;
            keys['ArrowRight'] = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        }
    }

    // ============= BÚA TIL PLATFORMS OG TJÉKKAR COLLISION VIÐ PLAYER =====================

    for (let i = 0; i < platforms.length; i++) {
        platformImg.src = 'img/platform.png'
        ctx.drawImage(platformImg, platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height)
        // passa að þeir byrji ekki að hreyfast fyrr en leikmaður hefur ákveðið að hoppa
        if (isPlaying) {
            platforms[i].velY = gravity * 5;
            platforms[i].y += platforms[i].velY * 2;
        }
        let dir = colCheck(player, platforms[i]);
        if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
            // setur player Y velocity í sama og pallarnir til að líkja eftir
            // að spilari sé standandi á honum
            player.velY = platforms[i].velY;
        }
    }

    // ======================== CAMERA OG GAMESPEED MAGIC ========================
    // engin sérstök ástæða fyrir constants hérna, bara prufað sig áfram
    if (player.y < 0) {
        gravity = 1.2 + numberOfPlatforms / 500;
        player.speed = 4 + numberOfPlatforms / 350;
        time = 500 - numberOfPlatforms;
    } else if (player.y < height / 4) {
        gravity = 0.85 + numberOfPlatforms / 500;
        player.speed = 3.75 + numberOfPlatforms / 350;
        time = 550 - numberOfPlatforms;
    } else if (player.y < height / 2) {
        gravity = 0.65 + numberOfPlatforms / 500;
        player.speed = 3.5 + numberOfPlatforms / 350;
        time = 600 - numberOfPlatforms;
    } else if (player.y < height * 3 / 4) {
        gravity = 0.5 + numberOfPlatforms / 500;
        player.speed = 3.25 + numberOfPlatforms / 350;
        time = 650 - numberOfPlatforms;
    } else {
        gravity = 0.4 + numberOfPlatforms / 500;
        player.speed += numberOfPlatforms / 350;
        time = 700 - numberOfPlatforms;
    }

    // ================ TEIKNA PLAYER =====================

    ctx.drawImage(robot, player.x, player.y, player.width, player.height);

    // ================ TEIKNA SCORE ======================
    ctx.fillStyle = "white";
    ctx.font = "40px 'Architects Daughter', cursive";
    ctx.fillText("Score: " + score, 30, 50);


    // ============== GANGSETNING OG LEIK LOKIÐ ======================
    if (isPlayingCounter === 1) {
        periodicall();
        platformDeleter;
        isPlayingCounter = 2;
        song.play();
    }
    if (player.y > height) {
        death.play();
        song.pause();
        clearInterval(loop);
        clearInterval(platformDeleter);
        clearTimeout(loopPlatforms);
        scoreBoard();

    }
}

// ============ PLATFORM SPAWN OG DELETE ========================

// pushar nýjum platform á (time) fresti
// telur líka hversu margir platforms hafa orðið til, fyrir score og scaling á tíma
function periodicall() {
    numberOfPlatforms += 1;
    platforms.push({
        x: (Math.random() * (width - platformWidth)),
        y: 0,
        width: platformWidth,
        height: 60,
        velY: 0,
    });
    loopPlatforms = setTimeout(periodicall, time);
}
// tjékkar hvort ehv platforms séu útaf skjánum á og deletar þeim fyrir langtíma performance
let platformDeleter = () => {
    let outOfScreen = 0;
    for (let i = 0; i < platforms.length; i++) {
        if (platforms[i].y - 1000 > height) {
            // - 1000 því þetta var að deleta öllum static platforms í einu
            outOfScreen += 1;
        }
    };
    platforms.splice(0, outOfScreen);
    score = (numberOfPlatforms - 4) * 10;
};

// ===================== COLLISION CHECK ÚTREIKNINGUR =====================

function colCheck(shapeA, shapeB) {
    // nær í vektora til að bera saman
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // bætir við hálfri vídd og breidd hlutsins
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;


    // ef vektor x og y eru minna en helmingur af vídd eða breidd hljóta þeir að vera inní hlutnum, sem triggerar collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // finnur út hvaða hlið collision á sér stað og skilar
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);

        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                if (boxes.indexOf(shapeB) > 0) {
                    shapeA.y += oY;
                }
            } else {
                if (shapeA.velY > 0) {
                    colDir = "b";
                    shapeA.y -= oY;
                }
            }
        } else {
            // bara athugað collision hægri/vinstri við veggi ekki platforms
            if (vX > 0) {
                //indexOf skilar -1 ef hlutur finnst ekki í array
                // af eitthverjum ástæðum vildi þetta ekki virka fyrir index 0
                if (boxes.indexOf(shapeB) !== -1) {
                    colDir = "l";
                    shapeA.x += oX;
                }
            } else {
                if (boxes.indexOf(shapeB) > 0) {
                    colDir = "r";
                    shapeA.x -= oX;
                }
            }
        }
    }
    return colDir;
}

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

// ====================== BYRJA LEIK ==========================

function startGame() {
    document.querySelector('#menu').style.display = 'none';
    document.querySelector('#welcome').style.display = 'none';
    soundCheck();
    musicCheck();
    numberOfPlatforms = 0;
    score = 0;
    player.x = width / 2;
    player.y = height - 200;
    platforms = [];
    keys = [];
    isPlayingCounter = 0;
    spawnStaticPlatforms();
    setInterval(platformDeleter, 15);
    isPlaying = false;

    loop = setInterval(update, 15);
}

document.body.addEventListener("keydown", function (e) {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'ArrowUp') {
        isPlaying = true;
        isPlayingCounter += 1;
    }
});

document.body.addEventListener("keyup", function (e) {
    keys[e.key] = false;
});


document.getElementById('spila').addEventListener('click', () => {
    startGame();
})

