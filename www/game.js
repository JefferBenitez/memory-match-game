// --- Views y navegación ---
const views = document.querySelectorAll('.view');
const showView = (id) => {
  views.forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
};

// Mostrar pantalla principal después del splash
window.addEventListener("load", () => {
  setTimeout(() => showView('home'), 1500);
});

// Botones principales
document.getElementById('playBtn').onclick = () => showView('levelSelect');
document.getElementById('creditsBtn').onclick = () => showView('credits');
document.getElementById('backCredits').onclick = () => showView('home');
document.getElementById('homeBtn').onclick = () => showView('home');
document.getElementById('backToHome').onclick = () => showView('home');
document.getElementById('retryBtn').onclick = () => showView('levelSelect');

// Botón de ver puntajes (ahora apunta a scoreView)
document.getElementById('scoreBtn').onclick = () => {
  document.getElementById('scoreTitle').textContent = "🏆 Mejores Puntajes";
  document.getElementById('finalScore').textContent = "";
  updateBestScores();
  showView('scoreView');
};

// Asegura que al cargar la página no quede otra vista visible
window.addEventListener("DOMContentLoaded", () => {
  showView('splash');
});

// --- Sonidos ---
const sounds = {
  flip: new Audio('assets/sounds/flip.mp3'),
  match: new Audio('assets/sounds/match.mp3'),
  win: new Audio('assets/sounds/win.mp3'),
  lose: new Audio('assets/sounds/lose.mp3'),
};

// --- Imágenes ---
const cardImages = [
  'assets/images/1.jpg',
  'assets/images/2.png',
  'assets/images/3.png',
  'assets/images/4.png',
  'assets/images/5.jpg',
  'assets/images/6.png',
];

// --- Variables globales ---
let flipped = [];
let matches = 0;
let lives = 3;
let timer = 60;
let score = 0;
let level = 1;
let countdown;


const bgMusic = document.getElementById("bgMusic");

// Arranca la música al primer clic/tap del jugador, listo
function startMusic() {
  bgMusic.volume = 0.4; // volumen suave
  bgMusic.play().catch(() => {});
  document.removeEventListener("click", startMusic);
}
document.addEventListener("click", startMusic);

// Si quieres botón de silenciar:
const musicBtn = document.getElementById("musicToggle");
if (musicBtn) {
  musicBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.textContent = "🔊 Música ON";
    } else {
      bgMusic.pause();
      musicBtn.textContent = "🔇 Música OFF";
    }
  });
}


// --- Selección de nivel ---
document.querySelectorAll('#levelSelect button[data-level]').forEach(btn => {
  btn.onclick = () => startGame(parseInt(btn.dataset.level));
});

// --- Función principal ---
function startGame(lv) {
  showView('game');
  level = lv;
  document.getElementById('levelTitle').textContent = `Nivel ${lv}`;
  // actualizar el elemento de puntaje del juego
  document.getElementById('gameScore').textContent = `Puntaje: 0`;

  const board = document.getElementById('board');
  board.innerHTML = '';
  flipped = [];
  matches = 0;
  score = 0;
  lives = 3;
  timer = 60;

  // Determinar cantidad de pares según nivel
  const pairs = level === 1 ? 4 : level === 2 ? 6 : 8;
  // Escoger imágenes aleatorias
  const shuffled = [...cardImages].sort(() => Math.random() - 0.5);
  const images = shuffled.slice(0, pairs);
  const cards = [...images, ...images].sort(() => Math.random() - 0.5);

  // Ajuste del grid
  const gridCols = level === 1 ? 4 : level === 2 ? 5 : 6;
  board.style.gridTemplateColumns = `repeat(${gridCols}, 110px)`;

  // Crear cartas
  cards.forEach((src, i) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = src;

    const back = document.createElement('div');
    back.classList.add('back');
    back.style.backgroundImage = "url('assets/images/back.png')";

    const front = document.createElement('div');
    front.classList.add('front');
    front.style.backgroundImage = `url('${src}')`;

    card.appendChild(back);
    card.appendChild(front);
    card.onclick = () => flipCard(card);

    // Animación de aparición
    card.style.opacity = "0";
    setTimeout(() => {
      card.style.transition = "opacity 0.3s";
      card.style.opacity = "1";
    }, 100 * i);

    board.appendChild(card);
  });

  document.getElementById('lives').textContent = `Vidas: ${lives}`;
  startTimer();
}

// --- Voltear carta ---
function flipCard(card) {
  if (flipped.length < 2 && !card.classList.contains('flipped')) {
    sounds.flip.play();
    card.classList.add('flipped');
    flipped.push(card);
    if (flipped.length === 2) checkMatch();
  }
}

// --- Verificar coincidencia ---
function checkMatch() {
  const [a, b] = flipped;
  if (a.dataset.value === b.dataset.value) {
    matches++;
    score += 10;
    sounds.match.play();
    flipped = [];
    // actualizar puntaje del juego
    document.getElementById('gameScore').textContent = `Puntaje: ${score}`;

    if (matches === a.parentElement.childElementCount / 2) {
      endGame(true);
    }
  } else {
    lives--;
    document.getElementById('lives').textContent = `Vidas: ${lives}`;
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      flipped = [];
    }, 800);
    if (lives === 0) endGame(false);
  }
}

// --- Temporizador ---
function startTimer() {
  clearInterval(countdown);
  document.getElementById('timer').textContent = `Tiempo: ${timer}s`;
  countdown = setInterval(() => {
    timer--;
    document.getElementById('timer').textContent = `Tiempo: ${timer}s`;
    if (timer <= 0) endGame(false);
  }, 1000);
}

// --- Overlay de final ---
function showEndMessage(result) {
  const endOverlay = document.createElement("div");
  endOverlay.id = "endOverlay";
  endOverlay.innerHTML = `
    <div class="endMessage ${result}">
      <h2>${result === "win" ? "🎉 ¡Has ganado!" : "💀 Has perdido"}</h2>
      <button onclick="restartGame()">Jugar de nuevo</button>
    </div>
  `;
  document.body.appendChild(endOverlay);
}

// --- Reiniciar ---
function restartGame() {
  const overlay = document.getElementById('endOverlay');
  if (overlay) overlay.remove();
  showView('levelSelect');
}

// --- Fin del juego ---
function endGame(win) {
  clearInterval(countdown);
  const board = document.getElementById('board');
  board.style.pointerEvents = "none";

  showEndMessage(win ? "win" : "lose");

  setTimeout(() => {
    const msg = win
      ? `🎉 ¡Ganaste el nivel ${level}!\nPuntaje final: ${score}`
      : `💀 Perdiste en el nivel ${level}.\nPuntaje final: ${score}`;
    document.getElementById('finalScore').textContent = msg;

    (win ? sounds.win : sounds.lose).play();

    // Guardar mejor puntaje
    const bestKey = `bestScore_Level${level}`;
    const prevBest = parseInt(localStorage.getItem(bestKey) || 0);
    if (score > prevBest) {
      localStorage.setItem(bestKey, score);
    }

    // Actualizar vista de mejores puntajes
    updateBestScores();

    showView('scoreView');

    board.innerHTML = '';
    board.style.pointerEvents = "auto";
  }, 2000);
}

// --- Mostrar mejores puntajes ---
function updateBestScores() {
  const scoreList = document.getElementById('scoreList');
  if (!scoreList) return;

  scoreList.innerHTML = '';
  [1, 2, 3].forEach(lv => {
    const best = localStorage.getItem(`bestScore_Level${lv}`) || 0;
    const li = document.createElement('li');
    li.textContent = `Nivel ${lv}: ${best} puntos`;
    scoreList.appendChild(li);
  });
}

// --- Inicializar puntajes al cargar ---
window.addEventListener('DOMContentLoaded', updateBestScores);
