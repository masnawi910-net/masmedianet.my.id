import { SentEmailLog, SmtpConfig } from '../types';

const SMTP_CONFIG_KEY = 'netradius_smtp_config_v1';
const SENT_EMAILS_KEY = 'netradius_sent_emails_v1';

export const defaultSmtpConfig: SmtpConfig = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  fromName: 'Masmedia Network',
  fromEmail: 'noreply@rtrw.net',
  isEnabled: false,
};

export function getStoredSmtpConfig(): SmtpConfig {
  try {
    const saved = localStorage.getItem(SMTP_CONFIG_KEY);
    if (saved) {
      return { ...defaultSmtpConfig, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse SMTP config:', e);
  }
  return defaultSmtpConfig;
}

export function saveStoredSmtpConfig(config: SmtpConfig): void {
  try {
    localStorage.setItem(SMTP_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save SMTP config:', e);
  }
}

export function getSentEmailLogs(): SentEmailLog[] {
  try {
    const saved = localStorage.getItem(SENT_EMAILS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse sent email logs:', e);
  }
  return [];
}

export function addSentEmailLog(log: Omit<SentEmailLog, 'id' | 'sentAt'>): SentEmailLog {
  const newLog: SentEmailLog = {
    ...log,
    id: `MAIL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    sentAt: new Date().toISOString(),
  };

  try {
    const logs = getSentEmailLogs();
    const updated = [newLog, ...logs].slice(0, 50); // Keep latest 50 logs
    localStorage.setItem(SENT_EMAILS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save email log:', e);
  }

  return newLog;
}

export function generateActivationCode(): string {
  // 6-digit verification code e.g. 849201
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface SendActivationEmailParams {
  email: string;
  name: string;
  username: string;
  activationCode: string;
  tenantName: string;
  planName?: string;
  address?: string;
  phone?: string;
}

export interface SendEmailResponse {
  success: boolean;
  sentReal?: boolean;
  simulated?: boolean;
  activationCode?: string;
  activationUrl?: string;
  htmlPreview?: string;
  message?: string;
  error?: string;
}

export async function sendActivationEmail(
  params: SendActivationEmailParams
): Promise<SendEmailResponse> {
  const smtpConfig = getStoredSmtpConfig();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const activationUrl = `${currentOrigin}?action=activate&code=${params.activationCode}&email=${encodeURIComponent(params.email)}`;

  try {
    const res = await fetch('/api/email/send-activation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        activationUrl,
        smtpConfig: smtpConfig.isEnabled && smtpConfig.host ? smtpConfig : undefined,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      addSentEmailLog({
        to: params.email,
        subject: `Kode Aktivasi Akun Anda: ${params.activationCode} - ${params.tenantName}`,
        type: 'activation',
        status: data.sentReal ? 'sent' : 'simulated',
        activationCode: params.activationCode,
        contentHtml: data.htmlPreview,
      });

      return {
        success: true,
        sentReal: data.sentReal,
        simulated: data.simulated,
        activationCode: params.activationCode,
        activationUrl: data.activationUrl || activationUrl,
        htmlPreview: data.htmlPreview,
        message: data.message,
      };
    } else {
      throw new Error(data.error || 'Gagal mengirim email aktivasi');
    }
  } catch (err: any) {
    console.warn('Backend send activation error, storing local simulated log:', err);

    // Fallback simulation log for reliable sandbox operations
    addSentEmailLog({
      to: params.email,
      subject: `Kode Aktivasi Akun Anda: ${params.activationCode} - ${params.tenantName}`,
      type: 'activation',
      status: 'simulated',
      activationCode: params.activationCode,
      error: err.message,
    });

    return {
      success: true,
      sentReal: false,
      simulated: true,
      activationCode: params.activationCode,
      activationUrl,
      message: `Pesan aktivasi telah diproses untuk ${params.email}. Gunakan kode OTP ${params.activationCode} untuk mengaktifkan akun.`,
    };
  }
}

export async function testSmtpConnection(config: SmtpConfig, toEmail?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/email/test-smtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        pass: config.pass,
        toEmail,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message || 'Koneksi SMTP berhasil!' };
    }
    return { success: false, message: data.error || 'Gagal terhubung ke SMTP server.' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Koneksi gagal.' };
  }
}
