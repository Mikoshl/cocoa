// После публикации Google Apps Script вставьте сюда URL, оканчивающийся на /exec.
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7ujZTaAXkgOg8lhoDcLEavlcC2D7FjO72grZzTfjhhhYOe72vPe630LduBoTZTAFH9w/exec";

const inviteStep = document.querySelector("#invite-step");
const detailsStep = document.querySelector("#details-step");
const successStep = document.querySelector("#success-step");
const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
const inviteActions = document.querySelector("#invite-actions");
const backButton = document.querySelector("#back-button");
const form = document.querySelector("#details-form");
const formStatus = document.querySelector("#form-status");
const playfulNote = document.querySelector("#playful-note");
const submitButton = form.querySelector("button[type='submit']");
const pickupHour = document.querySelector("#pickup-hour");
const pickupMinute = document.querySelector("#pickup-minute");
const pickupTime = document.querySelector("#pickup-time");
const romanticToast = document.querySelector("#romantic-toast");
const romanticYes = document.querySelector("#romantic-yes");

const escapeMessages = [
  "Кнопка всё-таки заметила твой курсор",
  "Кажется, «Нет» сегодня немного стесняется тебя",
  "Почти получилось… но какао убедительнее",
  "У этой кнопки свои планы на понедельник",
  "Может, всё-таки горячее какао? ☕",
];

let escapeCount = 0;
let hoverTimer = null;
let isMoving = false;
let romanticShown = false;

function showStep(stepToShow) {
  [inviteStep, detailsStep, successStep].forEach((step) => {
    step.classList.toggle("is-hidden", step !== stepToShow);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function findNewButtonPosition(rect) {
  const viewport = window.visualViewport;
  const padding = 18;
  const viewportLeft = viewport?.offsetLeft || 0;
  const viewportTop = viewport?.offsetTop || 0;
  const viewportWidth = viewport?.width || window.innerWidth;
  const viewportHeight = viewport?.height || window.innerHeight;
  const minX = viewportLeft + padding;
  const minY = viewportTop + padding;
  const maxX = Math.max(minX, viewportLeft + viewportWidth - rect.width - padding);
  const maxY = Math.max(minY, viewportTop + viewportHeight - rect.height - padding);
  const yesRect = yesButton.getBoundingClientRect();
  let x = minX;
  let y = minY;
  let attempts = 0;

  do {
    const angle = Math.random() * Math.PI * 2;
    const distance = 150 + Math.random() * 150;
    x = Math.min(maxX, Math.max(minX, rect.left + Math.cos(angle) * distance));
    y = Math.min(maxY, Math.max(minY, rect.top + Math.sin(angle) * distance));
    attempts += 1;
  } while (
    attempts < 18 &&
    (Math.hypot(x - rect.left, y - rect.top) < 115 ||
      (x < yesRect.right + 38 &&
        x + rect.width > yesRect.left - 38 &&
        y < yesRect.bottom + 38 &&
        y + rect.height > yesRect.top - 38))
  );

  return { x: Math.round(x), y: Math.round(y) };
}

function moveNoButton(event) {
  if (event) event.preventDefault();
  if (isMoving) return;

  clearTimeout(hoverTimer);
  noButton.classList.remove("is-preparing");
  isMoving = true;

  const rect = noButton.getBoundingClientRect();
  const destination = findNewButtonPosition(rect);

  // Выносим кнопку из карточки, чтобы overflow: hidden не мог её обрезать.
  if (noButton.parentElement !== document.body) {
    document.body.appendChild(noButton);
  }

  // Сначала фиксируем кнопку там, где она была, а затем плавно перемещаем.
  noButton.classList.add("is-running");
  noButton.style.left = `${Math.round(rect.left)}px`;
  noButton.style.top = `${Math.round(rect.top)}px`;
  noButton.style.transform = "rotate(0deg)";
  noButton.getBoundingClientRect();

  requestAnimationFrame(() => {
    noButton.style.left = `${destination.x}px`;
    noButton.style.top = `${destination.y}px`;
    noButton.style.transform = `rotate(${Math.round(Math.random() * 10 - 5)}deg)`;
  });

  playfulNote.textContent = escapeMessages[escapeCount % escapeMessages.length];
  playfulNote.classList.remove("is-active");
  playfulNote.getBoundingClientRect();
  playfulNote.classList.add("is-active");
  escapeCount += 1;

  if (escapeCount >= 10 && !romanticShown) {
    romanticShown = true;
    window.setTimeout(showRomanticToast, 620);
  }

  window.setTimeout(() => { isMoving = false; }, 560);
}

function showRomanticToast() {
  if (inviteStep.classList.contains("is-hidden")) return;
  romanticToast.classList.remove("is-hidden");
  document.body.classList.add("dialog-open");
  romanticYes.focus();
}

function hideRomanticToast() {
  romanticToast.classList.add("is-hidden");
  document.body.classList.remove("dialog-open");
}

function scheduleNoButtonMove(event, delay = 430) {
  if (event) event.preventDefault();
  if (isMoving || hoverTimer) return;
  noButton.classList.add("is-preparing");
  hoverTimer = window.setTimeout(() => {
    hoverTimer = null;
    moveNoButton();
  }, delay);
}

function resetNoButton() {
  clearTimeout(hoverTimer);
  hoverTimer = null;
  isMoving = false;
  noButton.classList.remove("is-running", "is-preparing");
  noButton.removeAttribute("style");
  inviteActions.appendChild(noButton);
  playfulNote.classList.remove("is-active");
  playfulNote.textContent = "Кажется, у этого предложения есть только один верный ответ";
}

noButton.addEventListener("pointerenter", (event) => scheduleNoButtonMove(event, 430));
noButton.addEventListener("pointerdown", (event) => scheduleNoButtonMove(event, 80));
noButton.addEventListener("focus", (event) => scheduleNoButtonMove(event, 320));
noButton.addEventListener("click", moveNoButton);

// После первого побега кнопка чувствует приближение курсора и ускользает снова.
document.addEventListener("pointermove", (event) => {
  if (!noButton.classList.contains("is-running") || isMoving || hoverTimer) return;

  const rect = noButton.getBoundingClientRect();
  const nearestX = Math.max(rect.left, Math.min(event.clientX, rect.right));
  const nearestY = Math.max(rect.top, Math.min(event.clientY, rect.bottom));
  const distance = Math.hypot(event.clientX - nearestX, event.clientY - nearestY);

  if (distance < 90) scheduleNoButtonMove(null, 170);
});

romanticYes.addEventListener("click", () => {
  hideRomanticToast();
  yesButton.click();
});

yesButton.addEventListener("click", () => {
  resetNoButton();
  showStep(detailsStep);
  setTimeout(() => pickupHour.focus(), 450);
});

backButton.addEventListener("click", () => {
  showStep(inviteStep);
  resetNoButton();
});

function updatePickupTime() {
  pickupTime.value = `${pickupHour.value}:${pickupMinute.value}`;
}

pickupHour.addEventListener("change", updatePickupTime);
pickupMinute.addEventListener("change", updatePickupTime);

function getPayload() {
  updatePickupTime();
  const data = new FormData(form);
  return {
    answer: "Да",
    pickupTime: data.get("pickupTime"),
    cocoa: data.get("cocoa"),
    wishes: data.get("wishes")?.trim() || "Без особых пожеланий",
    submittedAt: new Date().toISOString(),
  };
}

async function sendToGoogleSheet(payload) {
  if (!GOOGLE_SCRIPT_URL) {
    localStorage.setItem("cocoaInvitationLastAnswer", JSON.stringify(payload));
    await new Promise((resolve) => setTimeout(resolve, 650));
    return;
  }

  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const payload = getPayload();
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  formStatus.textContent = "";

  try {
    await sendToGoogleSheet(payload);
    document.querySelector("#answer-summary").textContent =
      `${payload.pickupTime} · ${payload.cocoa.toLowerCase()}`;
    showStep(successStep);
  } catch (error) {
    formStatus.textContent = "Не получилось отправить. Проверь интернет и попробуй ещё раз.";
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
  }
});

window.addEventListener("resize", () => {
  if (noButton.classList.contains("is-running") && !isMoving) moveNoButton();
});
