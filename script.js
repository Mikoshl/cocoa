// После публикации Google Apps Script вставьте сюда URL, оканчивающийся на /exec.
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7ujZTaAXkgOg8lhoDcLEavlcC2D7FjO72grZzTfjhhhYOe72vPe630LduBoTZTAFH9w/exec";

const inviteStep = document.querySelector("#invite-step");
const detailsStep = document.querySelector("#details-step");
const successStep = document.querySelector("#success-step");
const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
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
const romanticNo = document.querySelector("#romantic-no");

function showStep(stepToShow) {
  [inviteStep, detailsStep, successStep].forEach((step) => {
    step.classList.toggle("is-hidden", step !== stepToShow);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function animateNote(message) {
  playfulNote.textContent = message;
  playfulNote.classList.remove("is-active");
  playfulNote.getBoundingClientRect();
  playfulNote.classList.add("is-active");
}

function showRomanticToast() {
  romanticToast.classList.remove("is-hidden");
  document.body.classList.add("dialog-open");
  romanticYes.focus();
}

function hideRomanticToast() {
  romanticToast.classList.add("is-hidden");
  document.body.classList.remove("dialog-open");
}

noButton.addEventListener("click", () => {
  animateNote("Какао просит дать предложению ещё один шанс ☕");
  showRomanticToast();
});

romanticYes.addEventListener("click", () => {
  hideRomanticToast();
  yesButton.click();
});

romanticNo.addEventListener("click", () => {
  hideRomanticToast();
  animateNote("Принято без обид. Если передумаешь — предложение остаётся в силе ☕");
  noButton.focus();
});

yesButton.addEventListener("click", () => {
  hideRomanticToast();
  showStep(detailsStep);
  setTimeout(() => pickupHour.focus(), 450);
});

backButton.addEventListener("click", () => {
  showStep(inviteStep);
  animateNote("Любой ответ принимается. Но какао всё-таки надеется ☕");
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
