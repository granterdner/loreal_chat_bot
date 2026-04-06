/* =========================
   DOM ELEMENTS
========================= */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

/* =========================
   CONFIG
========================= */
const WORKER_URL = "https://chatbotbuddy.grant-erdner.workers.dev/";
//const API_URL = "https://api.openai.com/v1/chat/completions";
/* =========================
   CHAT STATE
========================= */
const messages = [
  {
    role: "system",
    content:
      "You are a refined, helpful product advisor. Keep responses clear, polished, and concise. Offer thoughtful product guidance and routines in an elegant tone.",
  },
];

/* =========================
   HELPERS
========================= */
function addMessage(text, sender) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("msg", sender);
  messageEl.textContent = text;
  chatWindow.appendChild(messageEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setLoadingState(isLoading) {
  const sendBtn = document.getElementById("sendBtn");

  if (isLoading) {
    userInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.7";
  } else {
    userInput.disabled = false;
    sendBtn.disabled = false;
    sendBtn.style.opacity = "1";
  }
}

function removeWelcomeCard() {
  const welcomeCard = chatWindow.querySelector(".welcome-card");
  if (welcomeCard) {
    welcomeCard.remove();
  }
}

/* =========================
   INITIAL UI
========================= */
addMessage("Welcome. Ask me about products, comparisons, or routines.", "ai");

/* =========================
   FORM SUBMIT
========================= */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = userInput.value.trim();
  if (!prompt) return;

  removeWelcomeCard();

  addMessage(prompt, "user");
  messages.push({ role: "user", content: prompt });

  userInput.value = "";
  setLoadingState(true);

  const thinkingEl = document.createElement("div");
  thinkingEl.classList.add("msg", "ai");
  thinkingEl.textContent = "Thinking…";
  chatWindow.appendChild(thinkingEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    /*const response = await fetch(API_URL, {
      method: "POST",
       headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_completion_tokens: 300,
      }),
    });*/
   const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    thinkingEl.remove();

    if (!response.ok) {
      console.error("Worker error:", data);
      addMessage("Sorry, something went wrong while contacting the assistant.", "ai");
      return;
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    addMessage(reply, "ai");
    messages.push({ role: "assistant", content: reply });
  } catch (error) {
    thinkingEl.remove();
    console.error("Fetch error:", error);
    addMessage("Sorry, I couldn’t connect to the server.", "ai");
  } finally {
    setLoadingState(false);
    userInput.focus();
  }
});
