// Game configuration
// DIHAPUS: konstanta BOARD_SIZE yang sudah tidak terpakai
const COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
];

// Block definitions [row, col] offsets
const BLOCKS = [
  //   [[0, 0]],
  [
    [0, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ], // Bentuk L Panjang
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 2],
  ], // Bentuk C
];

// --- Game State ---
let board = [];
let nextBlocks = [];
let score = 0;
let highScore = localStorage.getItem("blockBlazeHighScore") || 0;
let combo = 0;
let gameActive = true;
let activeBlock = null;
let activeBlockPos = { row: 0, col: 0 };
let gameInterval = null;
let isPaused = false;
let isSoundOn = true;
// BARU: Variabel untuk level dan waktu
let level = 1;
let totalLinesCleared = 0;
let timeLeft = 90; // 90 menit * 90 detik
let timerInterval = null;

// --- DOM Elements ---
const startScreen = document.getElementById("start-screen");
const startGameBtn = document.getElementById("start-game-btn");
const gamePopup = document.getElementById("game-popup");
const gameBoard = document.getElementById("game-board");
const previewContainer = document.getElementById("preview-container");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const rotateBtn = document.getElementById("rotate-btn");
const gameOverScreen = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");
const finalHighScoreDisplay = document.getElementById("final-high-score");
const restartBtn = document.getElementById("restart-btn");
const mobileControls = document.getElementById("mobile-controls");
const leftBtn = document.getElementById("left-btn");
const downBtn = document.getElementById("down-btn");
const rightBtn = document.getElementById("right-btn");
// BARU: DOM elements untuk fitur baru
const soundBtn = document.getElementById("sound-btn");
const pauseBtn = document.getElementById("pause-btn");
const pauseMenu = document.getElementById("pause-menu");
const resumeBtn = document.getElementById("resume-btn");
const restartPauseBtn = document.getElementById("restart-pause-btn");
// BARU: DOM elements untuk level dan waktu
const levelDisplay = document.getElementById("level");
const timeDisplay = document.getElementById("time");
const homeBtn = document.getElementById("home-btn");
const shareBtn = document.getElementById("share-btn");
const levelUpPopup = document.getElementById("level-up-popup");
const newLevelDisplay = document.getElementById("new-level-display");
// ...

// Menambahkan DOM Elements baru
const infoBtnMain = document.getElementById("info-btn-main");
const infoBtnPause = document.getElementById("info-btn-pause");
const infoPopup = document.getElementById("info-popup");
const closeInfoBtn = document.getElementById("close-info-btn");
const homePauseBtn = document.getElementById("home-pause-btn");
// BARU: Tambahkan audio untuk musik latar
const bgSound = new Audio("sounds/bgsound.mp3");
const lockSound = new Audio("sounds/lock.mp3");
const clearSound = new Audio("sounds/clear.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");
const matchSound = new Audio("sounds/match.mp3");
const BOARD_COLS = 10;
const BOARD_ROWS = 10;
// BARU: Array untuk latar belakang dinamis per level
const LEVEL_BACKGROUNDS = [
  "url('assets/bg1.png')",
  "url('assets/bg2.png')",
  "url('assets/bg3.png')",
  "url('assets/bg4.png')",
  "url('assets/bg5.png')",
  "url('assets/bg6.png')",
];

// DIUBAH: Fungsi playSound dan tambahkan kontrol musik latar
bgSound.loop = true; // Agar musik latar berulang
function playSound(sound) {
  if (isSoundOn) {
    sound.currentTime = 0;
    sound.play().catch((e) => console.error("Audio play failed:", e));
  }
}
// --- Inisialisasi Game ---
function initGame() {
  board = Array(BOARD_ROWS)
    .fill()
    .map(() => Array(BOARD_COLS).fill(0));
  score = 0;
  combo = 0;
  gameActive = true;
  activeBlock = null;
  clearInterval(gameInterval);
  document.removeEventListener("keydown", handleKeyPress);
  // BARU: Reset level dan waktu
  level = 1;
  totalLinesCleared = 0;
  timeLeft = 90; // Reset waktu ke 90 menit
  clearInterval(timerInterval);
  levelDisplay.textContent = level;
  timeDisplay.textContent = formatTime(timeLeft);
  scoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
  nextBlocks = [generateRandomBlock(), generateRandomBlock()];

  renderBoard();
  renderPreviewBlocks();
  gameOverScreen.style.display = "none";
  isPaused = false; // Pastikan game tidak dalam mode jeda saat dimulai
  pauseMenu.classList.remove("show");
}

function generateRandomBlock() {
  const shape = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { shape, color };
}

// DIUBAH: Fungsi startGame untuk memulai musik dan timer
function startGame() {
  startScreen.classList.add("hidden");
  gamePopup.classList.add("show");
  initGame();
  startTimer();
  if (isSoundOn) {
    bgSound.currentTime = 0;
    bgSound.play().catch((e) => console.error("Audio play failed:", e));
  }
  // Langsung jatuhkan blok pertama tanpa menunggu
  updateBackground(1); // Atur background awal untuk level 1
  spawnNextBlock();
}

// BARU: Fungsi untuk mengubah latar belakang
function updateBackground(level) {
  const bg = LEVEL_BACKGROUNDS[(level - 1) % LEVEL_BACKGROUNDS.length];
  // DIUBAH: property yang diubah adalah 'backgroundImage'
  document.body.style.backgroundImage = bg;
}

// BARU: Fungsi untuk memunculkan blok berikutnya secara otomatis
function spawnNextBlock() {
  if (!gameActive) return;

  const blockToSpawn = nextBlocks[0]; // Ambil blok dari antrean
  const blockWidth = Math.max(...blockToSpawn.shape.map((p) => p[1])) + 1;
  const startCol = Math.floor((BOARD_COLS - blockWidth) / 2);

  // Cek kondisi game over SEBELUM menempatkan blok
  if (!canPlaceBlock(blockToSpawn, 0, startCol)) {
    endGame("Papan Penuh!");
    return;
  }

  activeBlock = nextBlocks.shift(); // Gunakan blok pertama
  nextBlocks.push(generateRandomBlock()); // Tambah blok baru ke antrean

  activeBlockPos = { row: 0, col: startCol };

  renderPreviewBlocks(); // Perbarui tampilan pratinjau
  renderBoard();
  startGameLoop();
  document.addEventListener("keydown", handleKeyPress);
}

// DIUBAH: startGameLoop sekarang menggunakan kecepatan berdasarkan level
function startGameLoop() {
  clearInterval(gameInterval);
  // Kecepatan jatuh balok meningkat seiring level
  const fallSpeed = Math.max(200, 1000 - (level - 1) * 75);
  gameInterval = setInterval(() => moveBlock(1, 0), fallSpeed);
}

function moveBlock(dRow, dCol) {
  if (!activeBlock || isPaused) return; // BARU: Cek status jeda
  const newRow = activeBlockPos.row + dRow;
  const newCol = activeBlockPos.col + dCol;

  if (canPlaceBlock(activeBlock, newRow, newCol)) {
    activeBlockPos = { row: newRow, col: newCol };
  } else if (dRow > 0) {
    lockBlock();
  }
  renderBoard();
}

// DIUBAH TOTAL: Logika mengunci balok dan skor baru

function lockBlock() {
  if (!activeBlock) return;

  // ================================================================
  // DIHAPUS: Seluruh logika skor dari mencocokkan warna di bawah ini telah dihapus.
  /*
    let pointsFromMatch = 0;
    const bottomCells = {};
    // ... (loop dan kalkulasi poin warna) ...
    if (pointsFromMatch > 0) {
      score += pointsFromMatch;
      playSound(matchSound);
    } else {
      playSound(lockSound);
    }
    */
  // ================================================================

  // HANYA SUARA SAAT BALOK TERKUNCI YANG DISISAKAN
  playSound(lockSound);

  // Tempatkan balok secara permanen di papan
  activeBlock.shape.forEach(([r, c]) => {
    if (board[activeBlockPos.row + r]) {
      board[activeBlockPos.row + r][activeBlockPos.col + c] = activeBlock.color;
    }
  });

  activeBlock = null;
  clearInterval(gameInterval);
  document.removeEventListener("keydown", handleKeyPress);

  // Poin sekarang hanya berasal dari fungsi checkLines() di bawah ini
  checkLines();
  scoreDisplay.textContent = score;
  renderBoard();
  setTimeout(spawnNextBlock, 1000);
}

function rotateActiveBlock() {
  if (!activeBlock || isPaused) return; // BARU: Cek status jeda
  const originalShape = activeBlock.shape;
  const rotatedShape = rotateShape(activeBlock.shape);

  // Cek apakah bisa diputar di posisi sekarang
  if (
    canPlaceBlock(
      { shape: rotatedShape },
      activeBlockPos.row,
      activeBlockPos.col
    )
  ) {
    activeBlock.shape = rotatedShape;
  }
  renderBoard();
}

// --- Helper & Render Functions (Tidak ada perubahan signifikan) ---
function canPlaceBlock(block, row, col) {
  for (const [r, c] of block.shape) {
    const newRow = row + r;
    const newCol = col + c;
    if (
      newRow < 0 ||
      newRow >= BOARD_ROWS || // Menggunakan BOARD_ROWS
      newCol < 0 ||
      newCol >= BOARD_COLS || // Menggunakan BOARD_COLS
      (board[newRow] && board[newRow][newCol])
    ) {
      return false;
    }
  }
  return true;
}

function rotateShape(shape) {
  const matrix = shape;
  const N = Math.max(...matrix.map(([r, c]) => Math.max(r, c))) + 1;
  let newMatrix = matrix.map(([r, c]) => [c, N - 1 - r]);
  const minRow = Math.min(...newMatrix.map((p) => p[0]));
  const minCol = Math.min(...newMatrix.map((p) => p[1]));
  return newMatrix.map((p) => [p[0] - minRow, p[1] - minCol]);
}

function renderBoard() {
  gameBoard.innerHTML = "";
  const tempBoard = board.map((row) => [...row]);
  if (activeBlock) {
    activeBlock.shape.forEach(([r, c]) => {
      const row = activeBlockPos.row + r;
      const col = activeBlockPos.col + c;
      if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
        tempBoard[row][col] = activeBlock.color;
      }
    });
  }

  tempBoard.forEach((row) => {
    row.forEach((cellColor) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (cellColor) {
        cell.style.backgroundColor = cellColor;
        cell.classList.add("filled");
      }
      gameBoard.appendChild(cell);
    });
  });
}

function renderPreviewBlocks() {
  previewContainer.innerHTML = "";
  const nextBlock = nextBlocks[0]; // Hanya ambil blok pertama di antrean

  if (nextBlock) {
    const preview = document.createElement("div");
    preview.className = "block-preview";

    const previewGrid = Array(4)
      .fill()
      .map(() => Array(4).fill(0));
    nextBlock.shape.forEach(([r, c]) => {
      if (previewGrid[r]) previewGrid[r][c] = nextBlock.color;
    });

    previewGrid.forEach((row) => {
      row.forEach((color) => {
        const cell = document.createElement("div");
        cell.className = "block-preview-cell";
        if (color) cell.style.backgroundColor = color;
        preview.appendChild(cell);
      });
    });
    // Tidak ada lagi event listener klik
    previewContainer.appendChild(preview);
  }
}
// BARU: Event Listeners untuk Tombol Info
homePauseBtn.addEventListener("click", () => {
  // Hentikan semua proses game
  gameActive = false;
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  bgSound.pause();

  // Kembali ke menu utama
  pauseMenu.classList.remove("show");
  gamePopup.classList.remove("show");
  startScreen.classList.remove("hidden");

  // Reset background ke default
  document.body.style.backgroundImage = "url('assets/bghal1.png')";
});
function showInfoPopup() {
  infoPopup.classList.remove("hidden");
}

function hideInfoPopup() {
  infoPopup.classList.add("hidden");
}

infoBtnMain.addEventListener("click", showInfoPopup);
infoBtnPause.addEventListener("click", showInfoPopup);
closeInfoBtn.addEventListener("click", hideInfoPopup);
// DIUBAH: checkLines sekarang mengelola sistem level
function checkLines() {
  let linesCleared = 0;
  for (let r = BOARD_ROWS - 1; r >= 0; r--) {
    if (board[r] && board[r].every((cell) => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(Array(BOARD_COLS).fill(0));
      linesCleared++;
      r++;
    }
  }

  if (linesCleared > 0) {
    score += linesCleared * 10;
    playSound(clearSound);

    // BARU: Tambahan waktu 10 detik setiap clear
    timeLeft += linesCleared * 10;
    timeDisplay.textContent = formatTime(timeLeft); // Langsung update tampilan waktu

    totalLinesCleared += linesCleared;
    const newLevel = Math.floor(totalLinesCleared / 10) + 1;
    if (newLevel > level) {
      level = newLevel;
      levelDisplay.textContent = level;
      levelUpPopup.classList.add("show");
      setTimeout(() => {
        levelUpPopup.classList.remove("show");
      }, 2000); // Popup hilang setelah 2 detik
      timeLeft = 90; // Waktu di-reset saat naik level
      timeDisplay.textContent = formatTime(timeLeft);
      updateBackground(level);
      startGameLoop();
    }
  }
  return linesCleared;
}

function endGame(reason = "Permainan Berakhir") {
  console.log(`Game Over: ${reason}`);
  gameActive = false;
  clearInterval(gameInterval);
  document.removeEventListener("keydown", handleKeyPress);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("blockBlazeHighScore", highScore);
  }
  playSound(gameOverSound);
  finalScoreDisplay.textContent = score;
  finalHighScoreDisplay.textContent = highScore;
  bgSound.pause(); // Hentikan musik latar
  clearInterval(timerInterval); // Hentikan timer
  document.body.style.backgroundImage = "none";
  document.body.style.background = "#2c3e50";
  gameOverScreen.style.display = "flex";
}

// script.js

// DIUBAH: Fungsi shareScore ditulis ulang untuk generate gambar
async function shareScore() {
  const elementToCapture = document.querySelector(".game-over-content");

  // Tampilkan pesan loading atau nonaktifkan tombol untuk mencegah klik ganda
  const shareButton = document.getElementById("share-btn");
  shareButton.textContent = "sync"; // Ganti ikon menjadi 'loading'
  shareButton.disabled = true;

  try {
    const canvas = await html2canvas(elementToCapture, {
      useCORS: true, // Diperlukan jika ada gambar eksternal
      backgroundColor: "#34495e", // Beri background solid untuk gambar
    });

    canvas.toBlob(async (blob) => {
      // Buat file dari blob
      const file = new File([blob], "blockblaze-score.png", {
        type: "image/png",
      });
      const filesArray = [file];

      // Cek apakah browser mendukung Web Share API untuk file
      if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        await navigator.share({
          files: filesArray,
          title: "Skor Block Blaze-ku!",
          text: `Aku mendapatkan skor ${score} di Level ${level}. Kalahkan aku!`,
        });
      } else {
        // Fallback jika tidak bisa share file: download gambar
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "blockblaze-score.png";
        link.click();
        alert("Browser tidak mendukung fitur berbagi, gambar telah diunduh.");
      }
    }, "image/png");
  } catch (err) {
    console.error("Gagal membuat atau berbagi gambar:", err);
    alert("Maaf, terjadi kesalahan saat mencoba berbagi skor.");
  } finally {
    // Kembalikan tombol ke keadaan semula
    shareButton.textContent = "share";
    shareButton.disabled = false;
  }
}

// --- BARU: Fungsi untuk Waktu ---
function formatTime(seconds) {
  const min = Math.floor(seconds / 90);
  const sec = seconds % 90;
  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame("Waktu Habis!");
    }
  }, 1000);
}
// --- DIUBAH: Fungsi Jeda, Suara & Lanjutkan ---
function toggleSound() {
  isSoundOn = !isSoundOn;
  soundBtn.textContent = isSoundOn ? "volume_up" : "volume_off";
  // DIUBAH: Juga mengontrol musik latar
  if (isSoundOn) {
    bgSound.play().catch((e) => console.error("Audio play failed:", e));
  } else {
    bgSound.pause();
  }
}

function pauseGame() {
  if (!gameActive) return;
  isPaused = true;
  clearInterval(gameInterval);
  clearInterval(timerInterval); // Jeda timer
  bgSound.pause(); // Jeda musik
  pauseMenu.classList.add("show");
}

function resumeGame() {
  if (!gameActive || !isPaused) return;
  isPaused = false;
  pauseMenu.classList.remove("show");
  startGameLoop(); // Lanjutkan jatuhnya balok
  startTimer(); // Lanjutkan timer
  if (isSoundOn) {
    // Lanjutkan musik jika suara aktif
    bgSound.play().catch((e) => console.error("Audio play failed:", e));
  }
}
// --- Event Listeners ---
function handleKeyPress(e) {
  if (!activeBlock || !gameActive || isPaused) return;
  switch (e.key) {
    case "ArrowLeft":
      moveBlock(0, -1);
      break;
    case "ArrowRight":
      moveBlock(0, 1);
      break;
    case "ArrowDown":
      moveBlock(1, 0);
      break;
    case "ArrowUp":
    case " ":
      e.preventDefault();
      rotateActiveBlock();
      break;
  }
}

// Event listener untuk tombol Start
startGameBtn.addEventListener("click", startGame);

// Event listener untuk tombol kontrol
soundBtn.addEventListener("click", toggleSound);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);
rotateBtn.addEventListener("click", rotateActiveBlock);
restartBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  startGame();
});
// BARU: Event listener untuk tombol home dan share
homeBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  gamePopup.classList.remove("show");
  startScreen.classList.remove("hidden");
});
shareBtn.addEventListener("click", shareScore);
// Event listener untuk tombol mobile
leftBtn.addEventListener("click", () => moveBlock(0, -1));
rightBtn.addEventListener("click", () => moveBlock(0, 1));
downBtn.addEventListener("click", () => moveBlock(1, 0));

// Initialize
highScoreDisplay.textContent = highScore;

// Tambahkan di bagian akhir file script.js, sebelum event listeners
function createParticles() {
  const particlesContainer = document.createElement("div");
  particlesContainer.className = "particles";
  gamePopup.appendChild(particlesContainer);

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("span");
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.width = `${Math.random() * 5 + 2}px`;
    particle.style.height = particle.style.width;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
    particlesContainer.appendChild(particle);
  }
}

// Panggil fungsi ini saat game dimulai
startGameBtn.addEventListener("click", () => {
  // Hapus partikel lama jika ada
  const oldParticles = document.querySelector(".particles");
  if (oldParticles) oldParticles.remove();

  // Buat partikel baru
  createParticles();
});
