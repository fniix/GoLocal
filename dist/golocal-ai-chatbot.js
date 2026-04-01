/**
 * GoLocal AI Chatbot Widget — vanilla JS (no frameworks)
 * OpenAI: set OPENAI_API_KEY below. Browser calls are often blocked by CORS;
 * if the request fails, a built-in fallback answers using the same rules.
 *
 * Optional context from your React app:
 *   window.GoLocalChatContext = { isLoggedIn: true, hasActiveBooking: false, userName: 'Sara' };
 */
(function () {
  'use strict';

  // ============ CONFIG ============
  // Set from index.html: window.__GLOCAL_OPENAI_KEY__ (Vite injects VITE_OPENAI_API_KEY at dev/build)
  var _k = typeof window !== 'undefined' ? window.__GLOCAL_OPENAI_KEY__ : '';
  if (!_k || _k === '%VITE_OPENAI_API_KEY%') _k = '';
  var OPENAI_API_KEY = _k || 'YOUR_API_KEY';
  var OPENAI_MODEL = 'gpt-4o-mini';
  var OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

  // ============ CONTEXT HELPERS ============
  function getContext() {
    var c = window.GoLocalChatContext || {};
    return {
      isLoggedIn: !!c.isLoggedIn,
      hasActiveBooking: !!c.hasActiveBooking,
      userName: c.userName || '',
    };
  }

  function isArabicText(text) {
    return /[\u0600-\u06FF]/.test(text || '');
  }

  function contextHint() {
    var ctx = getContext();
    var parts = [];
    if (!ctx.isLoggedIn) {
      parts.push('User is NOT logged in: gently suggest signing in for booking and live tracking.');
    } else {
      parts.push('User is logged in as: ' + (ctx.userName || 'customer') + '.');
    }
    if (ctx.hasActiveBooking) {
      parts.push('User has an active booking/order: mention they can open Live tracking / driver matching in the app.');
    } else {
      parts.push('No active booking is flagged in context (user may still have history).');
    }
    return parts.join(' ');
  }

  // ============ SYSTEM PROMPT (OpenAI) ============
  function buildSystemPrompt() {
    var arabicMode = 'User might speak Arabic. Answer in the same language the user used.';
    return [
      'You are the friendly GoLocal assistant for a transport and delivery app in Bahrain (like Uber).',
      arabicMode,
      'Keep every reply short (2–5 sentences), warm, and clear. No markdown unless necessary.',
      '',
      'Context for this session:',
      contextHint(),
      '',
      'Behavior:',
      '- Booking: explain simple steps — pick service, set pickup/drop-off on the Bahrain map, confirm payment/notes, then match with a driver.',
      '- Driver / where is my driver: say live tracking is available in the app after a driver accepts; they can open the ride screen to follow on the map.',
      '- Price / how much: explain fare depends on distance, route, and vehicle type; exact price shows before or when booking confirms.',
      '- Complaints: acknowledge, stay calm, suggest Help/Support or complaint section in app; offer to summarize what to include (order details, time).',
      '- If unsure: give a helpful generic answer and suggest "Book ride", "Track driver", or Help.',
      '- Respect login state from context: if guest, mention login unlocks booking and tracking.',
    ].join('\n');
  }

  // ============ LOCAL FALLBACK (keyword + rules) ============
  function localFallbackReply(text) {
    var t = (text || '').toLowerCase();
    var ctx = getContext();
    var arabic = isArabicText(text);

    // ---- Login gating (Arabic + English keywords) ----
    var wantsBooking =
      t.indexOf('book') >= 0 ||
      t.indexOf('ride') >= 0 ||
      t.indexOf('order') >= 0 ||
      t.indexOf('حجز') >= 0 ||
      t.indexOf('حجز') >= 0 ||
      t.indexOf('اطلب') >= 0 ||
      t.indexOf('طلب') >= 0;

    var wantsDriver =
      t.indexOf('driver') >= 0 ||
      t.indexOf('track') >= 0 ||
      t.indexOf('where') >= 0 ||
      t.indexOf('أين') >= 0 ||
      t.indexOf('اين') >= 0 ||
      t.indexOf('وين') >= 0 ||
      t.indexOf('سائق') >= 0 ||
      t.indexOf('تتبع') >= 0 ||
      t.indexOf('وصل') >= 0;

    if (!ctx.isLoggedIn && (wantsBooking || wantsDriver)) {
      return arabic
        ? 'عشان تحجز وتتابع السائق في GoLocal لازم تسجل دخول أولاً. لما تدخل، اختر الخدمة وحدد الاستلام والتوصيل على الخريطة ثم أكد الحجز. تحتاج مساعدة؟ اضغط Login.'
        : 'To book rides and track your driver in GoLocal, please sign in first — then you can choose a service, pin pickup and drop-off on the map, and confirm. Need help with login? Tap Login on the welcome screen.';
    }

    // ---- Booking ----
    if (
      t.indexOf('book') >= 0 ||
      (t.indexOf('how do') >= 0 && t.indexOf('ride') >= 0) ||
      t.indexOf('how to book') >= 0 ||
      t.indexOf('حجز') >= 0 ||
      t.indexOf('كيف') >= 0 ||
      t.indexOf('كيف احجز') >= 0 ||
      t.indexOf('اطلب') >= 0 ||
      t.indexOf('حجز سيارة') >= 0 ||
      t.indexOf('احجز') >= 0
    ) {
      return arabic
        ? 'الحجز سهل: اختر Ride أو Delivery، حدد الاستلام والتوصيل على خريطة البحرين، اختر عدد الركاب والدفع، ثم اضغط Confirm. بعد التأكيد بنطابقك مع سائق متاح.'
        : 'Booking is easy: pick Ride or Delivery, enter pickup and drop-off on the map (Bahrain), choose passengers and payment, then tap Confirm. We will match you with an available driver.';
    }

    // ---- Driver tracking ----
    if (wantsDriver || (t.indexOf('تتبع') >= 0 || t.indexOf('tracking') >= 0)) {
      if (ctx.hasActiveBooking) {
        return arabic
          ? 'عندك طلب/رحلة فعّالة. افتح Live tracking أو Driver matching في التطبيق عشان تشوف السائق يتحرك على الخريطة لحظيًا.'
          : 'You have an active trip — open Live tracking or Driver matching in the app to see your driver moving on the map in real time.';
      }
      return arabic
        ? 'التتبع يصير شغال أول ما السائق يقبل الطلب. إذا ما عندك حجز بعد، اعمل حجز أولاً ثم راح تقدر تتابع السائق في التطبيق.'
        : 'Once a driver accepts your request, live tracking turns on in the app so you can see them approach you on the map. Create a booking first if you have not yet.';
    }

    // ---- Price / fare ----
    var wantsPrice =
      t.indexOf('price') >= 0 ||
      t.indexOf('cost') >= 0 ||
      t.indexOf('how much') >= 0 ||
      t.indexOf('fare') >= 0 ||
      t.indexOf('bd') >= 0 ||
      t.indexOf('سعر') >= 0 ||
      t.indexOf('كم') >= 0 ||
      t.indexOf('كم السعر') >= 0 ||
      t.indexOf('بتكلف') >= 0 ||
      t.indexOf('تكلفة') >= 0 ||
      t.indexOf('التكلفة') >= 0;

    if (wantsPrice) {
      return arabic
        ? 'السعر يعتمد على المسافة والمسار وحركة المرور وعدد المقاعد. غالبًا يظهر لك تقدير/سعر الحجز داخل خطوات الحجز قبل التأكيد أو عند تأكيد الحجز.'
        : 'Fares depend on distance, the route, traffic, and how many seats you need. You will see the estimate or final fare in the booking flow before you confirm — we keep it transparent.';
    }

    // ---- Complaints ----
    var wantsComplaint =
      t.indexOf('complaint') >= 0 ||
      t.indexOf('problem') >= 0 ||
      t.indexOf('refund') >= 0 ||
      t.indexOf('شكوى') >= 0 ||
      t.indexOf('مشكلة') >= 0 ||
      t.indexOf('تأخير') >= 0 ||
      t.indexOf('سيء') >= 0 ||
      t.indexOf('سيئة') >= 0;

    if (wantsComplaint) {
      return arabic
        ? 'آسف إن صار معك هذا. استخدم قسم Help أو Complaints داخل التطبيق واذكر وقت الطلب وتفاصيله عشان فريقنا يساعد بسرعة.'
        : 'I am sorry you had trouble — please use Help or Complaints in the app and share your trip time and order details so our team can help quickly.';
    }

    // ---- Greetings ----
    if (t.indexOf('hello') >= 0 || t.indexOf('hi') >= 0 || t.indexOf('hey') >= 0 || t.indexOf('مرحبا') >= 0 || t.indexOf('هلا') >= 0) {
      return arabic
        ? 'هلا! أنا مساعد GoLocal. اسألني عن الحجز، السعر، تتبع السائق، أو الشكاوى—أو استخدم الأزرار السريعة.'
        : 'Hi! I am GoLocal Help. Try the quick buttons below or ask me about booking, prices, your driver, or complaints.';
    }

    return arabic
      ? 'أنا موجود عشان أساعدك في GoLocal. تقدر تسأل عن: كيف تحجز، كيف يتحدد السعر، وين السائق، أو كيف تقدم شكوى. استخدم الأزرار السريعة للسرعة.'
      : 'I am here to help with GoLocal. You can ask how to book, how pricing works, where your driver is, or how to send a complaint. Use the quick buttons for shortcuts.';
  }

  // ============ SMART ROUTER (before AI) ============
  // If question matches required categories, answer with deterministic rules (always works).
  // Otherwise, try OpenAI. This guarantees "smart" behavior even if OpenAI is blocked by CORS.
  function ruleBasedRouter(userText) {
    var t = (userText || '').toLowerCase();
    // If it contains English keywords, fallback reply should already match.
    // Use a quick category check to reduce calls to OpenAI.
    var likelyBooking =
      t.indexOf('book') >= 0 ||
      t.indexOf('ride') >= 0 ||
      t.indexOf('delivery') >= 0 ||
      t.indexOf('order') >= 0 ||
      t.indexOf('حجز') >= 0 ||
      t.indexOf('احجز') >= 0 ||
      t.indexOf('اطلب') >= 0;

    var likelyDriver =
      t.indexOf('driver') >= 0 ||
      t.indexOf('track') >= 0 ||
      t.indexOf('where') >= 0 ||
      t.indexOf('تتبع') >= 0 ||
      t.indexOf('وين') >= 0 ||
      t.indexOf('اين') >= 0 ||
      t.indexOf('سائق') >= 0;

    var likelyPrice =
      t.indexOf('price') >= 0 ||
      t.indexOf('fare') >= 0 ||
      t.indexOf('cost') >= 0 ||
      t.indexOf('bd') >= 0 ||
      t.indexOf('سعر') >= 0 ||
      t.indexOf('كم') >= 0 ||
      t.indexOf('تكلفة') >= 0;

    var likelyComplaint =
      t.indexOf('complaint') >= 0 ||
      t.indexOf('problem') >= 0 ||
      t.indexOf('شكوى') >= 0 ||
      t.indexOf('مشكلة') >= 0 ||
      t.indexOf('تأخير') >= 0;

    if (likelyBooking || likelyDriver || likelyPrice || likelyComplaint) {
      return localFallbackReply(userText);
    }
    return null;
  }

  // ============ OPENAI ============
  function callOpenAI(userMessage, historyForApi, onDone, onError) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_API_KEY') {
      onError(new Error('no-key'));
      return;
    }
    var messages = [{ role: 'system', content: buildSystemPrompt() }]
      .concat(historyForApi)
      .concat([{ role: 'user', content: userMessage }]);

    fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('api-' + res.status);
        return res.json();
      })
      .then(function (data) {
        var text =
          (data.choices &&
            data.choices[0] &&
            data.choices[0].message &&
            data.choices[0].message.content) ||
          '';
        onDone((text || '').trim());
      })
      .catch(function () {
        onError(new Error('fetch-failed'));
      });
  }

  // ============ STYLES ============
  var css =
    '' +
    '#glcb-root{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}' +
    '#glcb-btn{position:fixed;right:20px;bottom:20px;z-index:99999;width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#6C5CE7,#4F46E5);color:#fff;box-shadow:0 8px 28px rgba(79,70,229,0.45);display:flex;align-items:center;justify-content:center;font-size:26px;transition:transform .15s ease,box-shadow .15s;}' +
    '#glcb-btn:hover{transform:scale(1.05);box-shadow:0 10px 32px rgba(79,70,229,0.55);}' +
    '#glcb-panel{position:fixed;right:20px;bottom:88px;z-index:99998;width:min(400px,calc(100vw - 40px));height:min(520px,calc(100vh - 120px));background:#fff;border-radius:20px;box-shadow:0 16px 48px rgba(15,23,42,0.18);display:none;flex-direction:column;overflow:hidden;border:1px solid #e5e7eb;}' +
    '#glcb-panel.open{display:flex;}' +
    '#glcb-head{background:linear-gradient(135deg,#6C5CE7,#4F46E5);color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;}' +
    '#glcb-head h2{margin:0;font-size:16px;font-weight:700;}' +
    '#glcb-head span{font-size:11px;opacity:.9;}' +
    '#glcb-close{background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:20px;line-height:1;}' +
    '#glcb-messages{flex:1;overflow-y:auto;padding:14px;background:#f8fafc;display:flex;flex-direction:column;gap:10px;}' +
    '.glcb-msg{max-width:85%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.45;word-break:break-word;white-space:pre-wrap;}' +
    '.glcb-msg.user{align-self:flex-end;background:linear-gradient(135deg,#6C5CE7,#4F46E5);color:#fff;border-bottom-right-radius:4px;}' +
    '.glcb-msg.bot{align-self:flex-start;background:#fff;color:#1f2937;border:1px solid #e5e7eb;border-bottom-left-radius:4px;}' +
    '.glcb-msg.typing{color:#6b7280;font-style:italic;}' +
    '#glcb-quick{display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px;background:#fff;border-top:1px solid #e5e7eb;}' +
    '#glcb-quick button{border:1px solid #e5e7eb;background:#f3f4f6;border-radius:999px;padding:6px 12px;font-size:12px;cursor:pointer;color:#374151;}' +
    '#glcb-quick button:hover{background:#ede9fe;border-color:#c4b5fd;}' +
    '#glcb-inputrow{display:flex;gap:8px;padding:12px;background:#fff;border-top:1px solid #e5e7eb;}' +
    '#glcb-input{flex:1;border:2px solid #e5e7eb;border-radius:14px;padding:10px 14px;font-size:14px;outline:none;}' +
    '#glcb-input:focus{border-color:#6C5CE7;}' +
    '#glcb-send{border:none;border-radius:14px;padding:0 18px;background:linear-gradient(135deg,#6C5CE7,#4F46E5);color:#fff;font-weight:600;cursor:pointer;}';

  // ============ DOM ============
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var root = document.createElement('div');
  root.id = 'glcb-root';
  root.innerHTML =
    '<button type="button" id="glcb-btn" aria-label="Open chat">💬</button>' +
    '<div id="glcb-panel" role="dialog" aria-label="GoLocal chat">' +
    '  <div id="glcb-head">' +
    '    <div><h2>GoLocal Assistant</h2><span>Ask me anything ✨</span></div>' +
    '    <button type="button" id="glcb-close" aria-label="Close chat">×</button>' +
    '  </div>' +
    '  <div id="glcb-messages"></div>' +
    '  <div id="glcb-quick">' +
    '    <button type="button" data-q="Track my driver">Track driver</button>' +
    '    <button type="button" data-q="How do I book a ride?">Book ride</button>' +
    '    <button type="button" data-q="I need help">Help</button>' +
    '  </div>' +
    '  <div id="glcb-inputrow">' +
    '    <input type="text" id="glcb-input" placeholder="Type a message…" autocomplete="off" />' +
    '    <button type="button" id="glcb-send">Send</button>' +
    '  </div>' +
    '</div>';
  document.body.appendChild(root);

  var btn = document.getElementById('glcb-btn');
  var panel = document.getElementById('glcb-panel');
  var closeBtn = document.getElementById('glcb-close');
  var messagesEl = document.getElementById('glcb-messages');
  var inputEl = document.getElementById('glcb-input');
  var sendBtn = document.getElementById('glcb-send');
  var quickEl = document.getElementById('glcb-quick');

  /** Conversation for UI + trimmed history for API (last N turns) */
  var historyForApi = [];

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBubble(text, who) {
    var div = document.createElement('div');
    div.className = 'glcb-msg ' + (who === 'user' ? 'user' : 'bot');
    // Improve Arabic layout: right-to-left and proper wrapping.
    if (isArabicText(text)) {
      div.dir = 'rtl';
      div.style.textAlign = 'right';
    }
    div.textContent = text;
    messagesEl.appendChild(div);
    scrollBottom();
    return div;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'glcb-msg bot typing';
    div.id = 'glcb-typing';
    div.textContent = '…';
    messagesEl.appendChild(div);
    scrollBottom();
    var dots = 0;
    var id = setInterval(function () {
      dots = (dots + 1) % 4;
      div.textContent = dots === 0 ? '…' : new Array(dots + 1).join('.');
    }, 400);
    return function remove() {
      clearInterval(id);
      if (div.parentNode) div.parentNode.removeChild(div);
    };
  }

  function trimHistory() {
    while (historyForApi.length > 12) historyForApi.shift();
  }

  function processReply(userText) {
    var removeTyping = showTyping();

    // 1) Always handle required project categories deterministically.
    var routed = ruleBasedRouter(userText);
    if (routed) {
      removeTyping();
      addBubble(routed, 'bot');
      historyForApi.push({ role: 'user', content: userText });
      historyForApi.push({ role: 'assistant', content: routed });
      trimHistory();
      return;
    }

    // 2) Unknown/unmatched → try OpenAI.
    callOpenAI(
      userText,
      historyForApi.slice(),
      function (reply) {
        removeTyping();
        addBubble(reply, 'bot');
        historyForApi.push({ role: 'user', content: userText });
        historyForApi.push({ role: 'assistant', content: reply });
        trimHistory();
      },
      function () {
        removeTyping();
        var fb = localFallbackReply(userText);
        // If AI fails (CORS/network/key), still give helpful answer.
        addBubble(fb, 'bot');
        historyForApi.push({ role: 'user', content: userText });
        historyForApi.push({ role: 'assistant', content: fb });
        trimHistory();
      }
    );
  }

  function sendMessage() {
    var text = (inputEl.value || '').trim();
    if (!text) return;
    inputEl.value = '';
    addBubble(text, 'user');
    processReply(text);
  }

  btn.addEventListener('click', function () {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      inputEl.focus();
      scrollBottom();
    }
  });
  closeBtn.addEventListener('click', function () {
    panel.classList.remove('open');
  });
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });

  quickEl.addEventListener('click', function (e) {
    var q = e.target && e.target.getAttribute('data-q');
    if (!q) return;
    addBubble(q, 'user');
    processReply(q);
  });

  // Welcome
  addBubble(
    'Hi! I am your GoLocal assistant. Ask about booking, prices, your driver, or complaints — or use the buttons below.',
    'bot'
  );
})();
