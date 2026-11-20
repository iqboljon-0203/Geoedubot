import { APP_URL, BOT_TOKEN } from './_lib/config.js';

export default function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    botEnabled: Boolean(BOT_TOKEN),
    appUrl: APP_URL ?? null,
  });
}
