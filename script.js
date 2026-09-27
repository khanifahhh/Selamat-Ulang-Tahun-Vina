const screens = ["opening", "cakes", "personality", "name", "game", "gift"];
let current = "opening";
let selectedCake = "";
let score = 0;
let gameLives = 3;
let gameRunning = false;
let gameFrame = null;
let gameObjects = [];
let playerX = 50;
let pressedKeys = {};

const openingCat = document.querySelector("#openingCat");
function petOpeningCat() {
  openingCat.classList.remove("petted");
  void openingCat.offsetWidth;
  openingCat.classList.add("petted");
  showToast("Mew! A birthday kiss for Vina ♡");
}
openingCat.addEventListener("click", petOpeningCat);
openingCat.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    petOpeningCat();
  }
});

const personality = {
  Cupcake: {
    title: "The Cupcake kind",
    lead: "You carry a little sparkle wherever you go — soft-hearted, thoughtful, and quietly unforgettable.",
    traits: ["Warm-hearted", "Creative soul", "Joyful energy", "Thoughtful"],
    quote: "Small joys are never really small when you know how to share them."
  },
  "Red Velvet": {
    title: "The Red Velvet kind",
    lead: "You are wonderfully bold: sincere with your feelings, loyal to your people, and full of graceful confidence.",
    traits: ["Brave heart", "Deeply loyal", "Confident", "Passionate"],
    quote: "There is a beautiful strength in being exactly as vibrant as your heart wants to be."
  },
  "Cinnamon Roll": {
    title: "The Cinnamon Roll kind",
    lead: "You make people feel safe. Gentle, comforting, and warm — your presence is a favourite kind of home.",
    traits: ["Kind spirit", "Comforting", "Patient", "Sweetly funny"],
    quote: "The world feels a little softer around people who bring warmth with them."
  }
};

function goTo(id) {
  document.querySelector(`#${current}`).classList.remove("active");
  current = id;
  const nextScreen = document.querySelector(`#${id}`);
  nextScreen.classList.remove("cakes-enter");
  nextScreen.classList.add("active");
  if (id === "cakes") {
    requestAnimationFrame(() => nextScreen.classList.add("cakes-enter"));
  }
  const index = Math.min(screens.indexOf(id) + 1, 5);
  document.querySelector("#stepCounter").textContent = `${String(index).padStart(2, "0")} / 05`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => goTo(button.dataset.next));
});

document.querySelectorAll(".cake-card").forEach((card) => {
  card.addEventListener("click", () => {
    selectedCake = card.dataset.cake;
    const details = personality[selectedCake];
    document.querySelector("#personalityTitle").textContent = details.title;
    document.querySelector("#personalityLead").textContent = details.lead;
    document.querySelector("#personalityQuote").textContent = details.quote;
    document.querySelector("#selectedStamp").textContent = selectedCake === "Red Velvet" ? "♥" : selectedCake === "Cinnamon Roll" ? "☼" : "♡";
    document.querySelector("#traitList").innerHTML = details.traits.map((trait) => `<span class="trait">${trait}</span>`).join("");
    goTo("personality");
  });
});

document.querySelector("#nameForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#nameInput");
  const error = document.querySelector("#nameError");
  if (input.value.trim().toLowerCase() !== "elvina nasri") {
    error.textContent = "Hmm, that is not quite right — try your full name.";
    input.focus();
    return;
  }
  error.textContent = "";
  goTo("game");
  startWishDash();
});

function startWishDash() {
  cancelAnimationFrame(gameFrame);
  gameRunning = false;
  score = 0;
  gameLives = 3;
  playerX = 50;
  gameObjects = [];
  document.querySelector("#score").textContent = "0";
  document.querySelector("#lives").textContent = "♥ ♥ ♥";
  document.querySelector("#gameInstruction").innerHTML = "Move the kitty and catch <b>8 wishes</b>.<br /><span>Use ← → or A / D · On mobile, drag the kitty</span>";
  document.querySelector("#gameBoard").querySelectorAll(".falling-object").forEach((item) => item.remove());
  const player = document.querySelector("#gamePlayer");
  player.style.left = "50%";
  const hint = document.querySelector("#gameHint");
  hint.classList.remove("hidden");
  let count = 3;
  hint.innerHTML = `get ready...<br /><strong>${count}</strong>`;
  const countdown = setInterval(() => {
    count -= 1;
    if (count > 0) hint.innerHTML = `get ready...<br /><strong>${count}</strong>`;
    else {
      clearInterval(countdown);
      hint.classList.add("hidden");
      gameRunning = true;
      gameFrame = requestAnimationFrame(gameLoop);
    }
  }, 650);
}

function createFallingObject() {
  const board = document.querySelector("#gameBoard");
  const isBomb = Math.random() < 0.18;
  const object = document.createElement("button");
  object.className = `falling-object ${isBomb ? "bomb" : "wish"}`;
  object.type = "button";
  object.innerHTML = isBomb ? "✹" : "✦";
  object.setAttribute("aria-label", isBomb ? "Avoid the bomb" : "Catch a birthday wish");
  const item = { element: object, x: 7 + Math.random() * 86, y: -10, speed: 0.17 + Math.random() * 0.09, bomb: isBomb, caught: false };
  object.style.left = `${item.x}%`;
  board.appendChild(object);
  object.addEventListener("click", () => {
    if (!gameRunning || item.caught) return;
    item.caught = true;
    if (item.bomb) loseLife(item);
    else collectWish(item);
  });
  gameObjects.push(item);
}

function gameLoop(time) {
  if (!gameRunning) return;
  const board = document.querySelector("#gameBoard");
  const player = document.querySelector("#gamePlayer");
  const boardHeight = board.clientHeight;
  if (pressedKeys.ArrowLeft || pressedKeys.a) playerX = Math.max(9, playerX - 0.65);
  if (pressedKeys.ArrowRight || pressedKeys.d) playerX = Math.min(91, playerX + 0.65);
  player.style.left = `${playerX}%`;
  if (Math.random() < 0.025) createFallingObject();
  gameObjects.forEach((item) => {
    if (item.caught) return;
    item.y += item.speed * (1 + score * 0.04);
    item.element.style.top = `${item.y}%`;
    const closeX = Math.abs(item.x - playerX) < 8;
    const closeY = item.y > 78 && item.y < 94;
    if (closeX && closeY) item.bomb ? loseLife(item) : collectWish(item);
    else if (item.y > 105) removeObject(item);
  });
  gameFrame = requestAnimationFrame(gameLoop);
}

function removeObject(item) {
  item.caught = true;
  item.element.remove();
  gameObjects = gameObjects.filter((object) => object !== item);
}

function collectWish(item) {
  removeObject(item);
  score += 1;
  document.querySelector("#score").textContent = score;
  showToast(score === 8 ? "All wishes collected! ✦" : "Wish caught! ✦");
  if (score >= 8) finishGame();
}

function loseLife(item) {
  removeObject(item);
  gameLives -= 1;
  document.querySelector("#lives").textContent = `${"♥ ".repeat(gameLives)}${"♡ ".repeat(3 - gameLives)}`.trim();
  document.querySelector("#gameBoard").classList.add("shake");
  setTimeout(() => document.querySelector("#gameBoard").classList.remove("shake"), 350);
  showToast(gameLives ? "Oops! Watch out for the spark bombs." : "The kitty needs a tiny restart.");
  if (!gameLives) setTimeout(startWishDash, 800);
}

function finishGame() {
  gameRunning = false;
  cancelAnimationFrame(gameFrame);
  document.querySelector("#gameInstruction").innerHTML = "You caught every wish for Vina! <b>Gift unlocked ✦</b>";
  setTimeout(() => goTo("gift"), 1300);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1000);
}

document.querySelector("#giftBox").addEventListener("click", () => {
  document.querySelector("#giftBox").classList.add("open");
  setTimeout(() => document.querySelector("#letter").classList.add("visible"), 550);
});

document.querySelector("#restartButton").addEventListener("click", () => {
  cancelAnimationFrame(gameFrame);
  gameRunning = false;
  document.querySelector("#gameBoard").querySelectorAll(".falling-object").forEach((item) => item.remove());
  document.querySelector("#giftBox").classList.remove("open");
  document.querySelector("#letter").classList.remove("visible");
  goTo("opening");
});

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
    event.preventDefault();
    pressedKeys[event.key] = true;
  }
});
window.addEventListener("keyup", (event) => { pressedKeys[event.key] = false; });
document.querySelectorAll(".control-button").forEach((button) => {
  const key = button.dataset.direction === "left" ? "ArrowLeft" : "ArrowRight";
  button.addEventListener("pointerdown", () => { pressedKeys[key] = true; });
  ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => button.addEventListener(eventName, () => { pressedKeys[key] = false; }));
});
document.querySelector("#gameBoard").addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" && !event.buttons) return;
  const board = event.currentTarget.getBoundingClientRect();
  playerX = Math.max(9, Math.min(91, ((event.clientX - board.left) / board.width) * 100));
});
