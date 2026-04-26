import {
  initialState,
  notificationFor,
  respond,
  type BotNotification,
  type BotState,
} from "./bot-engine";

type Msg =
  | { id: string; from: "user"; text: string }
  | { id: string; from: "bot"; text: string }
  | { id: string; from: "bot"; kind: "notif"; label: string; text: string };

const feedEl = document.querySelector<HTMLDivElement>("#demo-feed");
const inputEl = document.querySelector<HTMLInputElement>("#demo-input");
const formEl = document.querySelector<HTMLFormElement>("#demo-form");
const sendBtn = document.querySelector<HTMLButtonElement>("#demo-send");

if (feedEl && inputEl && formEl && sendBtn) {
  let state: BotState = { ...initialState, monitoring: [] };
  let counter = 0;
  const nextId = () => `m${counter++}`;
  const messages: Msg[] = [];
  let typing = false;

  function render() {
    feedEl!.innerHTML = "";
    if (messages.length === 0 && !typing) {
      const hint = document.createElement("div");
      hint.className = "empty-hint";
      hint.textContent = 'type "menu" to start →';
      feedEl!.appendChild(hint);
      return;
    }
    for (const msg of messages) {
      feedEl!.appendChild(renderBubble(msg));
    }
    if (typing) {
      const t = document.createElement("div");
      t.className = "typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      feedEl!.appendChild(t);
    }
    feedEl!.scrollTop = feedEl!.scrollHeight;
  }

  function renderBubble(msg: Msg): HTMLDivElement {
    const el = document.createElement("div");
    if ("kind" in msg && msg.kind === "notif") {
      el.className = "bubble from-bot notif";
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = msg.label;
      const text = document.createElement("span");
      text.className = "text";
      text.textContent = msg.text;
      el.append(label, text);
    } else {
      el.className = `bubble from-${msg.from}`;
      el.textContent = msg.text;
    }
    return el;
  }

  function setTyping(v: boolean) {
    typing = v;
    render();
  }

  function send(textOverride?: string) {
    const text = (textOverride ?? inputEl!.value).trim();
    if (!text) return;
    messages.push({ id: nextId(), from: "user", text });
    inputEl!.value = "";
    sendBtn!.disabled = true;
    setTyping(true);

    window.setTimeout(() => {
      const { state: newState, replies } = respond(text, state);
      state = newState;
      setTyping(false);
      for (const r of replies) {
        messages.push({ id: nextId(), from: "bot", text: r.text });
      }
      render();

      const notif: BotNotification | null = notificationFor(text, newState);
      if (notif) {
        window.setTimeout(() => {
          setTyping(true);
          window.setTimeout(() => {
            setTyping(false);
            messages.push({
              id: nextId(),
              from: "bot",
              kind: "notif",
              label: notif.label,
              text: notif.text,
            });
            render();
          }, 600);
        }, 1100);
      }
    }, 500 + Math.random() * 250);
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    send();
  });

  inputEl.addEventListener("input", () => {
    sendBtn!.disabled = !inputEl!.value.trim();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-tip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-tip");
      if (cmd) send(cmd);
    });
  });

  render();
}
