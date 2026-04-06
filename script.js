/* =========================
   DOM ELEMENTS
========================= */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

/* =========================
   CONFIG
========================= */
const WORKER_URL = "https://chatbotbuddy.grant-erdner.workers.dev/";

/* =========================
   CHAT STATE
========================= */
const messages = [
  {
    role: "system",
    content: `
You are a refined beauty advisor specializing exclusively in L’Oréal products.

Your role:
Help users choose the right L’Oréal products, build routines, and understand how to use them effectively.

You ONLY answer questions related to:
- L’Oréal products
- skincare, haircare, and beauty routines using L’Oréal products
- product recommendations and comparisons within L’Oréal

You MUST NOT:
- recommend or mention non-L’Oréal brands
- answer unrelated questions such as math, coding, trivia, politics, or general knowledge

If a question is outside your scope, politely respond with:
"I’m here to help with L’Oréal products, routines, and recommendations. Let’s focus on finding what works best for you."

Tone:
- elegant
- confident
- helpful
- concise

Guidelines:
- prioritize clear, personalized recommendations
- explain why a product is a good fit
- keep responses clean and not overly long
- when relevant, ask brief follow-up questions about skin type, hair type, goals, or concerns
`
  }
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

function removeWelcomeCard() {
  const welcomeCard = chatWindow.querySelector(".welcome-card");
  if (welcomeCard) {
    welcomeCard.remove();
  }
}

function setLoadingState(isLoading) {
  userInput.disabled = isLoading;
  sendBtn.disabled = isLoading;
  sendBtn.style.opacity = isLoading ? "0.7" : "1";
  sendBtn.style.cursor = isLoading ? "not-allowed" : "pointer";
}

function createThinkingMessage() {
  const thinkingEl = document.createElement("div");
  thinkingEl.classList.add("msg", "ai");
  thinkingEl.textContent = "Thinking…";
  chatWindow.appendChild(thinkingEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return thinkingEl;
}

/* =========================
   OPTIONAL STARTER MESSAGE
========================= */
addMessage(
  "Welcome. I can help you with L’Oréal product recommendations, routines, and comparisons.",
  "ai"
);

/* =========================
   FORM SUBMIT
========================= */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = userInput.value.trim();
  if (!prompt) return;

  removeWelcomeCard();
  addMessage(prompt, "user");

  messages.push({
    role: "user",
    content: prompt
  });

  userInput.value = "";
  setLoadingState(true);

  const thinkingEl = createThinkingMessage();

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();
    thinkingEl.remove();

    if (!response.ok) {
      console.error("Worker/API error:", data);
      addMessage(
        "Sorry, I ran into an issue connecting to the assistant. Please try again.",
        "ai"
      );
      return;
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I wasn’t able to generate a response.";

    addMessage(reply, "ai");

    messages.push({
      role: "assistant",
      content: reply
    });
  } catch (error) {
    thinkingEl.remove();
    console.error("Network error:", error);
    addMessage(
      "Sorry, I couldn’t connect right now. Please check your setup and try again.",
      "ai"
    );
  } finally {
    setLoadingState(false);
    userInput.focus();
  }
});