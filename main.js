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


// ============= BYRJUNAR PLATFORMS OG VEGGIR ===================

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


// ================== HLJÓÐ ============================
jump.src = 'sound/Jump2.wav';
death.src = 'sound/death_7_ian.wav';
song.src = 'sound/technicko.wav';

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

// ========================================================= //
// ==================== MAIN LOOP ========================== // 
// ========================================================= //

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
    // allt tengist numberOfPlatforms svo ekki sé sami hraði á leiknum allan tímann
    // engin sérstök ástæða fyrir constants hérna, bara prufað sig áfram
    if (player.y < 0) {
        gravity = 1.2 + numberOfPlatforms / 500;
        player.speed = 4;
        time = 340 - numberOfPlatforms;
    } else if (player.y < height / 4) {
        gravity = 1 + numberOfPlatforms / 500;
        player.speed = 3.75;
        time = 430 - numberOfPlatforms;
    } else if (player.y < height / 2) {
        gravity = 0.8 + numberOfPlatforms / 500;
        player.speed = 3.5;
        time = 520 - numberOfPlatforms;
    } else if (player.y < height * 3 / 4) {
        gravity = 0.6 + numberOfPlatforms / 500;
        player.speed = 3.25;
        time = 610 - numberOfPlatforms;
    } else {
        gravity = 0.4 + numberOfPlatforms / 500;
        player.speed += numberOfPlatforms / 350;
        time = 700 - numberOfPlatforms;
    }

    // ================ TEIKNA PLAYER OG SCORE =====================

    ctx.drawImage(robot, player.x, player.y, player.width, player.height);
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
    if (player.y + 50 > height) {
        death.play();
        song.pause();
        clearInterval(loop);
        clearInterval(platformDeleter);
        clearTimeout(loopPlatforms);
        scoreBoard();

    }
}

// ========================================================= //
// ================== MAIN LOOP LÝKUR ====================== // 
// ========================================================= //



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
            // - 1000 því þetta var að deleta öllum static byrjunarplatforms í einu
            outOfScreen += 1;
        }
    };
    platforms.splice(0, outOfScreen);
    score = (numberOfPlatforms - 4) * 10;
};

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

// ======================== HLUSTUN ===============================

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

