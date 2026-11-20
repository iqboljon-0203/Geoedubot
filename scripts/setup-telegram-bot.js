// Points the Telegram bot at the deployed app. Run once after the first deploy
// and again whenever the production URL changes (needs TELEGRAM_BOT_TOKEN and APP_URL).
import { APP_URL, BOT_TOKEN } from '../api/_lib/config.js';

if (!BOT_TOKEN || !APP_URL) {
  console.error("TELEGRAM_BOT_TOKEN va APP_URL muhit o'zgaruvchilari kerak.");
  process.exit(1);
}

async function callTelegram(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!result.ok) {
    throw new Error(`${method}: ${result.description}`);
  }
  console.log(`${method}: OK`);
}

try {
  await callTelegram('setWebhook', {
    url: `${APP_URL}/api/telegram-webhook`,
    drop_pending_updates: true,
  });
  await callTelegram('setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'GeoEdu', web_app: { url: APP_URL } },
  });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
