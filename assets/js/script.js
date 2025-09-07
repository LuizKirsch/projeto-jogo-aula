// Variáveis do jogo
let player = {
    x: 50,
    y: 70,
    width: 30,
    height: 30,
    speed: 5,
    onLadder: false,
    onPlatform: true
};

let game = {
    score: 0,
    lives: 3,
    gameOver: false,
    gameWon: false,
    barrelSpawnRate: 0.02,
    barrelSpeed: 2,
    lastBarrelTime: 0,
    barrelInterval: 3000  // 3 segundos em milissegundos
};

let barrels = [];
let keys = {};

// Plataformas do jogo (bottom, left, width)
const platforms = [
    { bottom: 50, left: 0, width: 800, slope: 'left' },      // 1ª: 100% = 800px
    { bottom: 150, left: 10, width: 752, slope: 'right' },   // 2ª: 94% de 800px = 752px
    { bottom: 250, left: 83, width: 712, slope: 'left' },    // 3ª: 89% de 800px = 712px
    { bottom: 350, left: 10, width: 720, slope: 'right' },   // 4ª: 90% de 800px = 720px
    { bottom: 450, left: 90, width: 704, slope: 'left' }     // 5ª: 88% de 800px = 704px
];


//teste


// Escadas do jogo (bottom, left, height)
const ladders = [
    { bottom: 50, left: 720, height: 100 },
    { bottom: 150, left: 80, height: 100 },
    { bottom: 250, left: 680, height: 100 },
    { bottom: 350, left: 120, height: 100 }
];

// Elementos DOM
const playerElement = document.getElementById('player');
const barrelsContainer = document.getElementById('barrels');
const scoreElement = document.getElementById('scoreValue');
const livesElement = document.getElementById('livesValue');
const gameArea = document.getElementById('gameArea');

// Event listeners para controles
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault(); // Prevenir comportamento padrão das setas
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    e.preventDefault(); // Prevenir comportamento padrão das setas
});

// Garantir foco quando clicar na área do jogo
gameArea.addEventListener('click', () => {
    document.body.focus();
});

// Função para verificar colisão com plataformas
function checkPlatformCollision(x, y) {
    for (let platform of platforms) {
        if (x >= platform.left &&
            x <= platform.left + platform.width - player.width &&
            y <= platform.bottom + 20 &&
            y >= platform.bottom) {
            return platform;
        }
    }
    return null;
}

// Função para verificar colisão com escadas
function checkLadderCollision(x, y) {
    for (let ladder of ladders) {
        if (x + player.width / 2 >= ladder.left &&
            x + player.width / 2 <= ladder.left + 30 &&
            y >= ladder.bottom &&
            y <= ladder.bottom + ladder.height) {
            return ladder;
        }
    }
    return null;
}

// Função para mover o jogador
function movePlayer() {
    if (game.gameOver || game.gameWon) return;

    let newX = player.x;
    let newY = player.y;

    // Movimento horizontal
    if (keys['ArrowLeft'] || keys['KeyA']) {
        newX -= player.speed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        newX += player.speed;
    }

    // Movimento vertical (escadas)
    if (keys['ArrowUp'] || keys['KeyW']) {
        let ladder = checkLadderCollision(player.x, player.y);
        if (ladder) {
            newY += player.speed;
            player.onLadder = true;
        }
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        let ladder = checkLadderCollision(player.x, player.y);
        if (ladder) {
            newY -= player.speed;
            player.onLadder = true;
        } else {
            player.onLadder = false;
        }
    }

    // Verificar limites da tela
    if (newX >= 0 && newX <= 770) {
        player.x = newX;
    }

    // Verificar colisão com plataforma para movimento vertical
    let platformCollision = checkPlatformCollision(player.x, newY);
    let ladderCollision = checkLadderCollision(player.x, newY);

    if (ladderCollision) {
        player.y = newY;
        player.onLadder = true;
        player.onPlatform = false;
    } else if (platformCollision && newY <= platformCollision.bottom + 20) {
        player.y = platformCollision.bottom + 20;
        player.onPlatform = true;
        player.onLadder = false;
    } else if (!player.onLadder) {
        // Gravidade
        player.y -= 3;
        player.onPlatform = false;

        // Verificar se caiu numa plataforma
        let fallPlatform = checkPlatformCollision(player.x, player.y);
        if (fallPlatform) {
            player.y = fallPlatform.bottom + 20;
            player.onPlatform = true;
        }
    }

    // Verificar se chegou na princesa
    if (player.x + player.width >= 720 && player.y >= 450) {
        game.gameWon = true;
        showGameWin();
    }

    // Atualizar posição visual
    playerElement.style.left = player.x + 'px';
    playerElement.style.bottom = player.y + 'px';
}

// Função para criar barril
function createBarrel() {
    const currentTime = Date.now();

    // Verificar se já passou o intervalo de 3 segundos
    if (currentTime - game.lastBarrelTime >= game.barrelInterval) {
        const barrel = {
            x: 650,  // Nova posição do Donkey Kong
            y: 490,
            width: 25,
            height: 25,
            speedX: -game.barrelSpeed,  // Velocidade negativa para ir para a esquerda
            speedY: 0,
            onPlatform: true,
            element: document.createElement('div')
        };

        barrel.element.className = 'barrel';
        barrel.element.style.left = barrel.x + 'px';
        barrel.element.style.bottom = barrel.y + 'px';
        barrelsContainer.appendChild(barrel.element);

        barrels.push(barrel);

        // Atualizar o tempo do último barril criado
        game.lastBarrelTime = currentTime;
    }
}

// Função para mover barris
function moveBarrels() {
    for (let i = barrels.length - 1; i >= 0; i--) {
        let barrel = barrels[i];

        // Movimento horizontal
        barrel.x += barrel.speedX;

        // Verificar se está em alguma plataforma
        let currentPlatform = null;
        for (let platform of platforms) {
            // Verificar se o barril está na altura da plataforma e dentro dos limites horizontais
            if (barrel.y >= platform.bottom - 5 && barrel.y <= platform.bottom + 30 &&
                barrel.x >= platform.left - 10 &&
                barrel.x + barrel.width <= platform.left + platform.width + 10) {
                currentPlatform = platform;
                break;
            }
        }

        if (currentPlatform) {
            // Está numa plataforma - ajustar posição Y e parar queda
            barrel.y = currentPlatform.bottom + 20;
            barrel.speedY = 0;

            // Verificar se chegou no final da plataforma para cair
            if (
                barrel.x <= currentPlatform.left - 5 ||
                barrel.x + barrel.width >= currentPlatform.left + currentPlatform.width + 5
            ) {
                // Saiu da plataforma: permitir queda
                currentPlatform = null;
            }
        }

        if (!currentPlatform) {
            // Não está em nenhuma plataforma - aplicar gravidade
            barrel.y -= 5;
            barrel.speedY = -5;

            // Verificar se vai pousar numa plataforma abaixo
            for (let platform of platforms) {
                if (barrel.y <= platform.bottom + 25 && barrel.y >= platform.bottom - 5 &&
                    barrel.x + barrel.width / 2 >= platform.left &&
                    barrel.x + barrel.width / 2 <= platform.left + platform.width) {
                    barrel.y = platform.bottom + 20;
                    barrel.speedY = 0;
                    // Define direção conforme inclinação
                    if (platform.slope === 'right') {
                        barrel.speedX = Math.abs(game.barrelSpeed);
                    } else {
                        barrel.speedX = -Math.abs(game.barrelSpeed);
                    }
                    break;
                }
            }
        }

        // Verificar se pode descer por uma escada
        for (let ladder of ladders) {
            if (barrel.x + barrel.width / 2 >= ladder.left &&
                barrel.x + barrel.width / 2 <= ladder.left + 30 &&
                Math.abs(barrel.y - ladder.bottom) < 30 &&
                Math.random() < 0.01) {
                barrel.y -= 2;
                barrel.speedX = 0;
            }
        }

        // Remover barris que saíram da tela
        if (barrel.y < -50) {
            barrel.element.remove();
            barrels.splice(i, 1);
            continue;
        }

        // Atualizar posição visual
        barrel.element.style.left = barrel.x + 'px';
        barrel.element.style.bottom = barrel.y + 'px';

        // Verificar colisão com jogador
        if (checkCollision(player, barrel)) {
            hitPlayer();
        }
    }
}

// Função para verificar colisão
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

// Função quando jogador é atingido
function hitPlayer() {
    game.lives--;
    livesElement.textContent = game.lives;

    playerElement.classList.add('player-hit');
    setTimeout(() => {
        playerElement.classList.remove('player-hit');
    }, 300);

    if (game.lives <= 0) {
        game.gameOver = true;
        showGameOver();
    } else {
        // Resetar posição do jogador
        player.x = 50;
        player.y = 70;
    }
}

// Função para mostrar game over
function showGameOver() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>Game Over!</h2>
        <p>Score Final: ${game.score}</p>
        <p>Pressione F5 para jogar novamente</p>
    `;
    document.body.appendChild(gameOverDiv);
}

// Função para mostrar vitória
function showGameWin() {
    const gameWinDiv = document.createElement('div');
    gameWinDiv.className = 'game-win';
    gameWinDiv.innerHTML = `
        <h2>Você Venceu!</h2>
        <p>Parabéns! Você salvou a princesa!</p>
        <p>Score Final: ${game.score}</p>
        <p>Pressione F5 para jogar novamente</p>
    `;
    document.body.appendChild(gameWinDiv);
}

// Função para atualizar score
function updateScore() {
    game.score += 10;
    scoreElement.textContent = game.score;
}

// Loop principal do jogo
function gameLoop() {
    if (!game.gameOver && !game.gameWon) {
        movePlayer();
        createBarrel();
        moveBarrels();
        updateScore();
    }
    requestAnimationFrame(gameLoop);
}

// Inicializar o jogo
function initGame() {
    console.log('Donkey Kong Game iniciado!');
    console.log('Use as setas do teclado para mover');
    console.log('Suba nas escadas para chegar até a princesa!');

    // Garantir que o foco esteja na página
    window.focus();
    document.body.focus();

    // Adicionar tabindex para garantir que pode receber foco
    document.body.setAttribute('tabindex', '0');

    gameLoop();
}

// Iniciar o jogo quando a página carregar
window.addEventListener('load', initGame);