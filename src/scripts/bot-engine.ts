// bot-engine.ts — simulates the lunafications bot's responses

export interface BotState {
  blocks: boolean;
  lists: boolean;
  monitoring: string[];
}

export interface BotReply {
  text: string;
}

export interface BotResponse {
  state: BotState;
  replies: BotReply[];
}

export interface BotNotification {
  kind: "notif";
  label: string;
  text: string;
}

export const initialState: BotState = {
  blocks: false,
  lists: false,
  monitoring: [],
};

function clone(s: BotState): BotState {
  return { blocks: s.blocks, lists: s.lists, monitoring: [...s.monitoring] };
}

export const MENU_TEXT =
  `Thanks for messaging me! I can notify you when you're blocked or added to lists.

Reply with one of the following options:
- 'notify blocks': Get notified when someone blocks you
- 'notify lists': Get notified when you're added to lists
- 'notify all': Get all notifications
- 'notify posts @username': Get notified when a specific user makes a post
- 'hide blocks': Turn off block notifications
- 'hide lists': Turn off list notifications
- 'hide posts @username': Stop monitoring a specific user's posts
- 'hide all': Turn off all notifications
- 'settings': View your current notification settings`;

function settingsText(s: BotState): string {
  const monitorLine = s.monitoring.length ? s.monitoring.join(", ") : "none";
  return `Your current settings:
- Notify blocks: ${s.blocks ? "on" : "off"}
- Notify lists: ${s.lists ? "on" : "off"}
- Notify posts: ${monitorLine}`;
}

function parseHandle(token: string | undefined): string | null {
  if (!token) return null;
  return token.replace(/^@/, "").trim().toLowerCase();
}

export function respond(input: string, state: BotState): BotResponse {
  const s = clone(state);
  const raw = (input || "").trim();
  if (!raw) return { state: s, replies: [] };
  const lower = raw.toLowerCase();
  const parts = lower.split(/\s+/);
  const cmd = parts[0];
  const arg1 = parts[1];
  const arg2 = parts[2];

  if (lower === "menu") {
    return { state: s, replies: [{ text: MENU_TEXT }] };
  }

  if (lower === "settings") {
    return { state: s, replies: [{ text: settingsText(s) }] };
  }

  if (cmd === "notify") {
    if (arg1 === "blocks") {
      s.blocks = true;
      return {
        state: s,
        replies: [{
          text: "You'll now receive notifications when someone blocks you.",
        }],
      };
    }
    if (arg1 === "lists") {
      s.lists = true;
      return {
        state: s,
        replies: [{
          text: "You'll now receive notifications when you're added to lists.",
        }],
      };
    }
    if (arg1 === "all") {
      s.blocks = true;
      s.lists = true;
      return {
        state: s,
        replies: [{ text: "You'll now receive all notifications." }],
      };
    }
    if (arg1 === "posts") {
      const handle = parseHandle(arg2);
      if (!handle) {
        return {
          state: s,
          replies: [{
            text:
              'Please provide a handle you want to monitor, e.g. "notify posts @imlunahey.com".',
          }],
        };
      }
      if (!s.monitoring.includes(handle)) s.monitoring.push(handle);
      return {
        state: s,
        replies: [{ text: `You will be notified when ${handle} makes a post.` }],
      };
    }
    return {
      state: s,
      replies: [{
        text:
          'I did not understand that. Please reply with "menu" to see the available options.',
      }],
    };
  }

  if (cmd === "hide") {
    if (arg1 === "blocks") {
      s.blocks = false;
      return {
        state: s,
        replies: [{
          text: "You'll no longer receive block notifications.",
        }],
      };
    }
    if (arg1 === "lists") {
      s.lists = false;
      return {
        state: s,
        replies: [{
          text: "You'll no longer receive list notifications.",
        }],
      };
    }
    if (arg1 === "all") {
      s.blocks = false;
      s.lists = false;
      s.monitoring = [];
      return {
        state: s,
        replies: [{ text: "You'll no longer receive any notifications." }],
      };
    }
    if (arg1 === "posts") {
      const handle = parseHandle(arg2);
      if (!handle) {
        return {
          state: s,
          replies: [{
            text:
              'Please provide a handle you want to stop monitoring, e.g. "hide posts @imlunahey.com".',
          }],
        };
      }
      s.monitoring = s.monitoring.filter((u) => u !== handle);
      return {
        state: s,
        replies: [{
          text: `You will no longer be notified when ${handle} makes a post.`,
        }],
      };
    }
    return {
      state: s,
      replies: [{
        text:
          'I did not understand that. Please reply with "menu" to see the available options.',
      }],
    };
  }

  if (lower.includes("thanks") || lower.includes("thank you")) {
    return { state: s, replies: [{ text: "You are welcome!" }] };
  }

  return {
    state: s,
    replies: [{
      text:
        'I did not understand that. Please reply with "menu" to see the available options.',
    }],
  };
}

export function notificationFor(
  triggerInput: string,
  _state: BotState,
): BotNotification | null {
  const lower = (triggerInput || "").trim().toLowerCase();
  const parts = lower.split(/\s+/);
  if (parts[0] !== "notify") return null;

  if (parts[1] === "blocks" || parts[1] === "all") {
    return {
      kind: "notif",
      label: "block notification",
      text: "You were blocked by bsky.app",
    };
  }
  if (parts[1] === "lists") {
    return {
      kind: "notif",
      label: "list notification",
      text:
        'darkswordsman.com has added you to the "Fake List List" moderation list.',
    };
  }
  if (parts[1] === "posts" && parts[2]) {
    const handle = parseHandle(parts[2]);
    return {
      kind: "notif",
      label: "post notification",
      text: `${handle} has made a post.`,
    };
  }
  return null;
}
