import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '@/lib/env';
import { pushToOwners } from '@/server/notify/push';

/**
 * Служебные письма владельцу портала.
 *
 * Уведомление — побочное действие. Если почта не ушла, заявка сада всё равно
 * должна сохраниться, а родитель не должен увидеть ошибку. Поэтому функция
 * никогда не бросает исключений: неудача пишется в журнал службы и только.
 *
 * О падении самого сайта это приложение сообщить не может — упав, оно
 * ничего не отправит. Этим занимается отдельный сторож на сервере
 * (`/usr/local/bin/edusad-watchdog`), который шлёт почту в обход приложения.
 */

let transporter: Transporter | null = null;

function transport(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      // Почтовый сервер на той же машине: шифровать соединение до него незачем,
      // а сертификат выписан на mail.e04.kz, не на 127.0.0.1 — проверка упадёт.
      secure: false,
      ignoreTLS: true,
    });
  }
  return transporter;
}

/**
 * Письмо владельцу и push на его устройства (админка, установленная как
 * приложение, раздел «Уведомления»). `url` — какую страницу админки открыть
 * по нажатию на уведомление.
 */
export async function notifyOwner(subject: string, lines: (string | null | undefined | false)[], url = '/admin'): Promise<void> {
  const text = lines.filter((line): line is string => typeof line === 'string').join('\n');

  // Push — первым и независимо от почты: его владелец увидит сразу.
  await pushToOwners({ title: subject.charAt(0).toUpperCase() + subject.slice(1), body: text, url });

  if (!env.notifyEmail) return;

  try {
    await transport().sendMail({
      from: env.mailFrom,
      to: env.notifyEmail,
      subject: `EduSad: ${subject}`,
      text,
    });
  } catch (error) {
    console.error('[notify] письмо не отправлено:', (error as Error).message);
  }
}
