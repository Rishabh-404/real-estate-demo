// ---------- MIRAI AI Chatbot (Claude API) ----------
//
// SECURITY NOTE: this calls the Claude API directly from the visitor's
// browser, so the API key is visible to anyone who opens the page source
// or devtools. Suitable for private demos only — for a public launch,
// move the API call behind a small server-side proxy and keep the key there.
//
// Paste your Anthropic API key below (starts with "sk-ant-"). The chatbot
// works automatically for every visitor — no sign-in or key prompt.
const MIRAI_ANTHROPIC_API_KEY = 'PASTE-YOUR-ANTHROPIC-API-KEY-HERE';

const MIRAI_CHAT_MODEL = 'claude-opus-4-8';

// Knowledge base — all facts sourced from the MIRAI brochure (MIRAI-Brochure.pdf).
const MIRAI_SYSTEM_PROMPT = `You are the friendly virtual assistant for "Sree Sudha's MIRAI", a residential plot development by Sree Sudha Promoters & Developers. You are embedded on the official MIRAI website. Answer visitor questions using ONLY the brochure facts below.

## Project overview
- Name: Sree Sudha's MIRAI — "Where Legacy Begins", tagline "The Gateway of Future".
- Developer: Sree Sudha Promoters & Developers.
- Type: Residential plot (plotted land) development at Bathinapadu–Paritala, positioned at the gateway of the Amaravati Capital Region, Andhra Pradesh.
- Approvals: APCRDA-approved project; AP RERA registered, registration no. PO6060116570. Clear title with spot registration.
- Amaravati context: Amaravati is the capital of Andhra Pradesh, backed by roughly ₹1 lakh crore of investment and envisioned as a cluster of nine integrated cities.

## Layout
- 207 numbered plots. Plot sizes are listed in square yards; most plots are 183 sq. yds. Other sizes in the layout include 167, 180, 191, 196, 203, 209, 219, 222, 231, 234, 247, 249, 255, 259, 272, 284, 291, 313, 323, 352, 367, 733 and 1195 sq. yds.
- Internal roads: proposed 40 ft and 30 ft wide CC (cement concrete) roads; the frontage road (Devineni Venkataramana Road) is proposed to be widened to 60 ft.
- A utilities area of about Ac 13.22 cents is earmarked in the layout.
- 100% Vaastu-compliant layout.
- Flexibility: no limits on FSI; plots suit both residential and commercial use.

## Amenities
40 & 30 ft CC roads, avenue plantation, 100% Vaasthu layout, pure drinking water lines, water line from the Krishna River, 1.5 lakh litre overhead tank, 3-phase electricity, LED street lights, children's play area, lush green open spaces, grand entrance arch, name & number plot marking, clear title with spot registration, and 24x7 security.

## Location advantages (note: several are PROPOSED projects, not yet built — always say "proposed" where marked)
- 650 m from the existing NH-65 (Hyderabad–Vijayawada highway).
- 350 m from the proposed NH-65 bypass.
- 500 m from the Amaravati Gateway at Nakkalampeta–Battinapadu.
- 1.5 km from the proposed Paritala Railway Station.
- 3.5 km from the Vykuntapuram Reservoir Barrage.
- 2 km from the proposed Outer Ring Road.
- About 7 km / 15 minutes from the proposed Amaravati Sports City.
- About 20 minutes' drive to the AP High Court and Secretariat at Amaravati Capital City.
- About 20 minutes' drive to the proposed international airport at Ravela.
- Educational hub: surrounded by five engineering colleges — Amrita Sai, MIC, MVR, Nimra and RK — with a combined student strength of over 20,000.

## Contact
- Corporate office: #59A-16-3-9, Plot No. 101, 1st Floor, 3rd Road, RTC Colony, Vijayawada-7, Andhra Pradesh.
- Email: sreesudhapromoters@gmail.com
- The website has a "Request a Callback" form (the Enquire button) and a downloadable brochure PDF.

## Rules
- Answer only questions related to MIRAI, the brochure, Amaravati-area context above, or how to contact Sree Sudha. For anything else, politely say you can only help with questions about MIRAI.
- Pricing, payment plans, and plot availability are NOT in the brochure. Never invent prices. Direct such questions to the "Request a Callback" form on this page or to sreesudhapromoters@gmail.com.
- Be honest that items marked "proposed" (bypass, railway station, airport, ring road, sports city) are planned infrastructure, not completed.
- Never promise investment returns or appreciation figures.
- Keep answers short and conversational — 1 to 4 sentences for most questions.
- Reply in English.`;

(function initMiraiChat() {
  const API_URL = 'https://api.anthropic.com/v1/messages';

  const labels = {
    title: "MIRAI Assistant",
    sub: 'Ask about the project',
    placeholder: 'Ask about plots, location, amenities…',
    greeting: "Hello! I'm the MIRAI assistant. Ask me anything about the project — plots, location, amenities or approvals.",
    error: 'Sorry, something went wrong reaching the assistant. Please try again in a moment.',
    rateLimited: 'The assistant is receiving a lot of questions right now — please try again in a few seconds.',
    refused: "I can't help with that — but I'm happy to answer anything about MIRAI!",
    foot: 'AI assistant — answers are based on the MIRAI brochure. For pricing, request a callback.',
    chips: ['Where is MIRAI located?', 'What plot sizes are available?', 'What amenities are included?', 'Is it RERA approved?'],
  };

  function t() {
    return labels;
  }

  function apiKeyConfigured() {
    return MIRAI_ANTHROPIC_API_KEY.startsWith('sk-ant-');
  }

  // ---- Build widget DOM ----
  const toggle = document.createElement('button');
  toggle.className = 'mirai-chat-toggle';
  toggle.setAttribute('aria-label', 'Chat with the MIRAI assistant');
  toggle.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none"><path d="M21 12a8 8 0 0 1-8 8H4l2.4-2.9A8 8 0 1 1 21 12z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="9" cy="12" r="0.8" fill="currentColor"/><circle cx="13" cy="12" r="0.8" fill="currentColor"/><circle cx="17" cy="12" r="0.8" fill="currentColor"/></svg>';

  const panel = document.createElement('div');
  panel.className = 'mirai-chat-panel';
  panel.innerHTML = `
    <div class="mirai-chat-header">
      <div><span class="mc-title"></span><span class="mc-sub"></span></div>
      <button class="mirai-chat-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="mirai-chat-messages"></div>
    <div class="mirai-chat-suggestions"></div>
    <form class="mirai-chat-inputrow">
      <input type="text" autocomplete="off">
      <button type="submit" class="mirai-chat-send" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none"><path d="M3 12 L21 3 L14 21 L11 13 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
      </button>
    </form>
    <div class="mirai-chat-foot"></div>`;

  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector('.mirai-chat-messages');
  const suggestionsEl = panel.querySelector('.mirai-chat-suggestions');
  const form = panel.querySelector('.mirai-chat-inputrow');
  const input = form.querySelector('input');
  const sendBtn = form.querySelector('.mirai-chat-send');
  const closeBtn = panel.querySelector('.mirai-chat-close');

  let history = [];       // Claude API message history: {role, content}
  let busy = false;
  let greeted = false;

  function applyChatLanguage() {
    const L = t();
    panel.querySelector('.mc-title').textContent = L.title;
    panel.querySelector('.mc-sub').textContent = L.sub;
    panel.querySelector('.mirai-chat-foot').textContent = L.foot;
    input.placeholder = L.placeholder;
    suggestionsEl.innerHTML = '';
    L.chips.forEach((text) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'mc-chip';
      chip.textContent = text;
      chip.addEventListener('click', () => { input.value = text; form.requestSubmit(); });
      suggestionsEl.appendChild(chip);
    });
  }

  function addMessage(role, text, isError) {
    const el = document.createElement('div');
    el.className = 'mc-msg ' + role + (isError ? ' error' : '');
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'mc-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  async function askClaude(userText) {
    history.push({ role: 'user', content: userText });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': MIRAI_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        // Required for calling the Claude API from a browser (CORS opt-in).
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MIRAI_CHAT_MODEL,
        max_tokens: 1024,
        system: MIRAI_SYSTEM_PROMPT,
        messages: history,
      }),
    });

    if (!response.ok) {
      history.pop(); // keep history consistent on failure
      const err = new Error('API error ' + response.status);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    if (data.stop_reason === 'refusal') {
      history.pop();
      return null;
    }
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    history.push({ role: 'assistant', content: text });
    return text;
  }

  async function handleSend(userText) {
    const L = t();

    addMessage('user', userText);

    if (!apiKeyConfigured()) {
      // Site-owner misconfiguration — visitors just see a friendly error.
      addMessage('bot', L.error, true);
      console.error('MIRAI chatbot: set MIRAI_ANTHROPIC_API_KEY at the top of chatbot.js');
      return;
    }

    busy = true;
    sendBtn.disabled = true;
    const typing = showTyping();
    try {
      const reply = await askClaude(userText);
      typing.remove();
      addMessage('bot', reply === null ? L.refused : reply);
    } catch (err) {
      typing.remove();
      if (err.status === 429 || err.status === 529) {
        addMessage('bot', L.rateLimited, true);
      } else {
        addMessage('bot', L.error, true);
      }
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ---- Events ----
  toggle.addEventListener('click', () => {
    applyChatLanguage();
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      if (!greeted) {
        greeted = true;
        addMessage('bot', t().greeting);
      }
      input.focus();
    }
  });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = '';
    handleSend(text);
  });
})();
