import { APP_URL } from './_lib/config.js';

// Names are user-controlled; an unescaped "<" would make Telegram reject the HTML message.
const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default function handler(req, res) {
  try {
    const message = req.body?.message;
    const chatId = message?.chat?.id;
    if (!chatId) {
      return res.status(200).end();
    }

    const firstName = escapeHtml(message.from?.first_name || 'Foydalanuvchi');
    const welcomeText = [
      `Assalomu alaykum, <b>${firstName}</b>! 👋`,
      '',
      '📍 <b>GeoEdu</b> — amaliy vazifalarni joylashuv asosida bajarish uchun ta\'lim platformasi.',
      '',
      '📝 Vazifalarni oling va topshiring',
      '🗺 Javobingizni xaritadagi joylashuv bilan yuboring',
      '📊 Baho va natijalaringizni kuzatib boring',
      '👩‍🏫 O\'qituvchilar uchun guruh va vazifalarni boshqarish',
      '',
      'Boshlash uchun tugmani bosing 👇',
    ].join('\n');

    // Telegram executes a method returned directly in the webhook response.
    return res.status(200).json({
      method: 'sendMessage',
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 GeoEdu\'ni ochish',
              web_app: { url: APP_URL },
            },
          ],
        ],
      },
    });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return res.status(200).end();
  }
}
