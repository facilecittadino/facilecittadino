// reservation.js — Universal Auto-Inject Version (Final Fixed)

const WHATSAPP_NUMBER = "393318358086";

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30",
  "11:00","11:30","15:00","15:30",
  "16:00","16:30","17:00","17:30"
];

// Detect page type
function getPageService() {
  const el = document.querySelector("[data-page]");
  if (!el) return "Servizio";
  const page = el.getAttribute("data-page").toLowerCase();
  if (page === "caf") return "Servizio CAF";
  if (page === "patronato") return "Patronato";
  if (page === "legal") return "Assistenza Legale";
  return "Servizio";
}

// Helpers
function isClosedDay(date) { 
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday + Saturday closed
}
function toInputDate(date) { return date.toISOString().split("T")[0]; }

// Auto-create form overlay
function injectReservationForm() {
  if (document.querySelector("#reservationFormContainer")) return;

  const overlay = document.createElement("div");
  overlay.id = "reservationFormContainer";
  overlay.className = "reservation-overlay";
  overlay.innerHTML = `
    <div class="reservation-box">
      <form id="reservationForm">
        <h2>Prenota un Appuntamento</h2>

        <label for="reservationService">Servizio</label>
        <input id="reservationService" type="text" readonly />

        <label for="reservationName">Nome</label>
        <input id="reservationName" type="text" placeholder="Il tuo nome" required />

        <label for="reservationPhone">Telefono</label>
        <input id="reservationPhone" type="tel" placeholder="Il tuo numero" required />

        <label for="reservationDate">Data</label>
        <input id="reservationDate" type="date" required inputmode="none" style="-webkit-appearance:none; appearance:none;" />

        <label for="reservationTime">Orario</label>
        <select id="reservationTime" required>
          <option value="">Seleziona un orario</option>
        </select>

        <button id="reservationWhatsAppBtn" class="btn btn-primary" type="submit">
          Invia su WhatsApp
        </button>
        <button id="reservationCloseBtn" class="btn btn-outline" type="button">
          Chiudi
        </button>
      </form>
    </div>`;
  document.body.appendChild(overlay);
}

// Main
document.addEventListener("DOMContentLoaded", () => {
  injectReservationForm();

  const serviceButtons = document.querySelectorAll(".js-reservation-btn");
  const formContainer = document.querySelector("#reservationFormContainer");

  const serviceField = document.querySelector("#reservationService");
  const nameField = document.querySelector("#reservationName");
  const phoneField = document.querySelector("#reservationPhone");
  const dateField = document.querySelector("#reservationDate");
  const timeField = document.querySelector("#reservationTime");
  const whatsappBtn = document.querySelector("#reservationWhatsAppBtn");
  const closeBtn = document.querySelector("#reservationCloseBtn");

  // Set date limits and prefill today's date
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14);
  const todayStr = toInputDate(today);
  dateField.min = todayStr;
  dateField.max = toInputDate(maxDate);
  dateField.value = todayStr;

  // Prevent manual past date entry (iPhone safe)
  dateField.addEventListener("input", () => {
    const selected = new Date(dateField.value + "T00:00");
    const todayMid = new Date(todayStr + "T00:00");
    if (selected < todayMid) {
      dateField.value = todayStr;
      // alert("Non puoi selezionare una data passata.");
    }
  });

  // Open form
  serviceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const btnService = btn.getAttribute("data-service");
      const pageService = getPageService();
      serviceField.value = btnService || pageService;
      nameField.value = "";
      phoneField.value = "";
      timeField.innerHTML = `<option value="">Seleziona un orario</option>`;
      formContainer.classList.add("is-visible");
    });
  });

  // Close form
  closeBtn.onclick = () => formContainer.classList.remove("is-visible");

  // Load time slots
  dateField.addEventListener("change", () => {
    const d = new Date(dateField.value + "T00:00");
    timeField.innerHTML = "";
    if (isClosedDay(d)) {
      timeField.innerHTML = `<option value="">Chiuso</option>`;
      return;
    }
    timeField.innerHTML = `<option value="">Seleziona un orario</option>`;
    TIME_SLOTS.forEach(t => {
      timeField.innerHTML += `<option value="${t}">${t}</option>`;
    });
  });

  // Send WhatsApp message
  whatsappBtn.addEventListener("click", e => {
    e.preventDefault();
    const service = serviceField.value.trim();
    const name = nameField.value.trim();
    const phone = phoneField.value.trim();
    const date = dateField.value;
    const time = timeField.value;

    if (!service || !name || !phone || !date || !time)
      return alert("Riempi tutti i campi.");

    const formatted = new Date(date).toLocaleDateString("it-IT");
    const msg = `Ciao, vorrei prenotare:%0A• Servizio: ${service}%0A• Nome: ${name}%0A• Telefono: ${phone}%0A• Data: ${formatted}%0A• Orario: ${time}%0A%0AGrazie`;
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(link, "_blank");
  });
});
