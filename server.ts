import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

let runtimeSmtpConfig: {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
} | null = null;

function getMailTransporter(customConfig?: {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}) {
  const host = customConfig?.host || runtimeSmtpConfig?.host || process.env.SMTP_HOST;
  const port = Number(customConfig?.port || runtimeSmtpConfig?.port || process.env.SMTP_PORT || 587);
  const secure = customConfig?.secure !== undefined 
    ? customConfig.secure 
    : (runtimeSmtpConfig?.secure !== undefined ? runtimeSmtpConfig.secure : (process.env.SMTP_SECURE === 'true' || port === 465));
  const user = (customConfig?.user || runtimeSmtpConfig?.user || process.env.SMTP_USER || '').trim();
  const rawPass = customConfig?.pass || runtimeSmtpConfig?.pass || process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/\s+/g, '').trim();

  if (!host || !user) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: pass || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function buildActivationEmailHtml(params: {
  name: string;
  username: string;
  email: string;
  activationCode: string;
  activationUrl: string;
  tenantName: string;
  planName?: string;
  address?: string;
  phone?: string;
}): string {
  const { name, username, email, activationCode, activationUrl, tenantName, planName, address, phone } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aktivasi Akun ${tenantName || 'Masmedia RTRW.NET'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #334155;
      margin: 0;
      padding: 24px 12px;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #831843 0%, #be185d 50%, #475569 100%);
      padding: 36px 28px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      color: #fbcfe8;
      font-weight: 500;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .intro {
      font-size: 14.5px;
      color: #475569;
      margin-bottom: 24px;
    }
    .otp-card {
      background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%);
      border: 2px dashed #f472b6;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin-bottom: 28px;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 800;
      color: #9d174d;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #831843;
      margin: 6px 0;
      user-select: all;
    }
    .otp-hint {
      font-size: 12px;
      color: #be185d;
      font-weight: 600;
      margin-top: 6px;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn-activate {
      display: inline-block;
      background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 36px;
      border-radius: 14px;
      box-shadow: 0 8px 20px rgba(236, 72, 153, 0.35);
    }
    .account-info {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 24px;
      font-size: 13.5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #edf2f7;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #64748b;
      font-weight: 600;
    }
    .info-val {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .security-note {
      font-size: 12px;
      color: #64748b;
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 10px 14px;
      border-radius: 6px;
      margin-top: 20px;
    }
    .footer {
      background: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 24px;
      font-size: 12px;
    }
    .footer a {
      color: #f472b6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">MASMEDIA RTRW.NET</div>
      <h1>Verifikasi & Aktivasi Akun</h1>
      <p>Satu langkah lagi untuk mengaktifkan sistem billing ISP Anda</p>
    </div>
    <div class="content">
      <div class="greeting">Halo, ${name}! 👋</div>
      <p class="intro">
        Terima kasih telah mendaftar di <strong>${tenantName || 'Masmedia RTRW.NET'}</strong>. 
        Gunakan kode aktivasi di bawah ini atau klik tombol aktivasi langsung untuk mengonfirmasi email dan mengaktifkan akun Anda.
      </p>

      <div class="otp-card">
        <div class="otp-label">KODE VERIFIKASI / OTP AKTIVASI</div>
        <div class="otp-code">${activationCode}</div>
        <div class="otp-hint">Kode ini berlaku selama 24 jam ke depan. Jangan bagikan kepada siapa pun.</div>
      </div>

      <div class="btn-container">
        <a href="${activationUrl}" class="btn-activate" target="_blank">
          ✓ Aktivasi Akun Sekarang
        </a>
      </div>

      <div class="account-info">
        <div style="font-weight: 800; color: #0f172a; margin-bottom: 10px; font-size: 14px;">
          📋 Rincian Pendaftaran Akun Anda:
        </div>
        <div class="info-row">
          <span class="info-label">Nama Pengguna (Username):</span>
          <span class="info-val">${username}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Alamat Email:</span>
          <span class="info-val">${email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nama ISP / Tenant:</span>
          <span class="info-val">${tenantName}</span>
        </div>
        ${planName ? `
        <div class="info-row">
          <span class="info-label">Paket Langganan:</span>
          <span class="info-val">${planName}</span>
        </div>` : ''}
        ${phone ? `
        <div class="info-row">
          <span class="info-label">Nomor WhatsApp:</span>
          <span class="info-val">${phone}</span>
        </div>` : ''}
        ${address ? `
        <div class="info-row">
          <span class="info-label">Alamat Operasional:</span>
          <span class="info-val" style="max-width: 250px;">${address}</span>
        </div>` : ''}
      </div>

      <div class="security-note">
        <strong>⚠️ Keamanan:</strong> Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini atau hubungi tim customer service kami.
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px;">
        © ${new Date().getFullYear()} <strong>Masmedia RTRW.NET</strong> — Sistem Manajemen Billing & Jaringan MikroTik
      </p>
      <p style="margin: 0; font-size: 11px; color: #64748b;">
        Email ini dikirim otomatis ke <a href="mailto:${email}">${email}</a>.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasSmtpConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    });
  });

  // Save active runtime SMTP settings
  app.post("/api/email/save-smtp", (req, res) => {
    try {
      const { host, port, secure, user, pass, fromName, fromEmail } = req.body;
      runtimeSmtpConfig = {
        host,
        port: Number(port || 587),
        secure: !!secure,
        user: (user || '').trim(),
        pass: (pass || '').replace(/\s+/g, '').trim(),
        fromName: fromName || 'Masmedia RTRW.NET',
        fromEmail: fromEmail || user,
      };
      return res.json({
        success: true,
        message: "Konfigurasi SMTP berhasil disimpan di server.",
        config: {
          host: runtimeSmtpConfig.host,
          port: runtimeSmtpConfig.port,
          user: runtimeSmtpConfig.user,
          hasPass: !!runtimeSmtpConfig.pass,
        },
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // Test SMTP Connection Route
  app.post("/api/email/test-smtp", async (req, res) => {
    try {
      const { host, port, secure, user, pass, toEmail } = req.body;
      const transporter = getMailTransporter({ host, port, secure, user, pass });

      if (!transporter) {
        return res.status(400).json({
          success: false,
          error: "Konfigurasi SMTP tidak lengkap (Host dan User wajib diisi).",
        });
      }

      await transporter.verify();

      if (toEmail) {
        const fromAddress = user ? `Masmedia RTRW.NET <${user}>` : (process.env.SMTP_FROM || 'noreply@rtrw.net');
        await transporter.sendMail({
          from: fromAddress,
          to: toEmail,
          subject: "✅ Uji Coba Konfigurasi SMTP Email Masmedia RTRW.NET",
          html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #059669;">Koneksi SMTP Berhasil!</h2>
            <p>Email uji coba ini berhasil dikirim dari sistem billing Masmedia RTRW.NET.</p>
            <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
          </div>`,
        });
      }

      return res.json({
        success: true,
        message: "Koneksi SMTP berhasil diverifikasi!",
      });
    } catch (err: any) {
      console.error("SMTP verify error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Gagal menghubungi server SMTP.",
      });
    }
  });

  // Send Activation Email Route
  app.post("/api/email/send-activation", async (req, res) => {
    try {
      const {
        email,
        name,
        username,
        activationCode,
        activationUrl,
        tenantName,
        planName,
        address,
        phone,
        smtpConfig,
      } = req.body;

      if (!email || !activationCode) {
        return res.status(400).json({
          success: false,
          error: "Parameter email dan activationCode wajib disertakan.",
        });
      }

      const appBaseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const finalActivationUrl = activationUrl || `${appBaseUrl}?action=activate&code=${activationCode}&email=${encodeURIComponent(email)}`;

      const htmlContent = buildActivationEmailHtml({
        name: name || username || "Pelanggan",
        username: username || email,
        email,
        activationCode,
        activationUrl: finalActivationUrl,
        tenantName: tenantName || "Masmedia RTRW.NET",
        planName,
        address,
        phone,
      });

      const transporter = getMailTransporter(smtpConfig);
      const fromSender = smtpConfig?.fromEmail 
        ? `${smtpConfig.fromName || 'Masmedia RTRW.NET'} <${smtpConfig.fromEmail}>` 
        : (process.env.SMTP_FROM || 'Masmedia RTRW.NET <noreply@rtrw.net>');

      let sentReal = false;
      let sendError: string | null = null;

      if (transporter) {
        try {
          await transporter.sendMail({
            from: fromSender,
            to: email,
            subject: `🔐 Kode Aktivasi Akun Anda: ${activationCode} - ${tenantName || 'Masmedia RTRW.NET'}`,
            html: htmlContent,
          });
          sentReal = true;
        } catch (mailErr: any) {
          console.warn("Real SMTP dispatch failed, fallback to simulation logger:", mailErr?.message);
          sendError = mailErr?.message || "Gagal mengirim melalui SMTP server.";
        }
      }

      // Log dispatch
      console.log(`[Activation Email] Sent to: ${email} | Code: ${activationCode} | Real SMTP: ${sentReal ? 'YES' : 'SIMULATED / SANDBOX'}`);

      return res.json({
        success: true,
        sentReal,
        simulated: !sentReal,
        to: email,
        activationCode,
        activationUrl: finalActivationUrl,
        htmlPreview: htmlContent,
        warning: sendError,
        message: sentReal
          ? `Email aktivasi berhasil dikirim ke ${email}. Silakan cek kotak masuk Anda!`
          : `Pesan aktivasi telah diproses untuk ${email}. Anda dapat memasukkan kode OTP ${activationCode} atau melakukan aktivasi instan.`,
      });
    } catch (error: any) {
      console.error("Send activation email error:", error);
      res.status(500).json({
        success: false,
        error: "Gagal memproses email aktivasi: " + (error?.message || "Internal server error"),
      });
    }
  });

  // Alias for backward compatibility
  app.post("/api/auth/send-activation-email", async (req, res) => {
    try {
      const { email, name, username, code, activationCode } = req.body;
      const finalCode = activationCode || code || Math.floor(100000 + Math.random() * 900000).toString();
      const transporter = getMailTransporter();
      let sentReal = false;
      let sendError = null;

      if (transporter && email) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'Masmedia RTRW.NET <noreply@rtrw.net>',
            to: email,
            subject: `🔐 Kode Verifikasi & Aktivasi Akun: ${finalCode}`,
            html: buildActivationEmailHtml({
              name: name || username || 'Pengguna',
              username: username || email,
              email,
              activationCode: finalCode,
              activationUrl: `${process.env.APP_URL || `http://localhost:${PORT}`}?action=activate&code=${finalCode}&email=${encodeURIComponent(email)}`,
              tenantName: 'Masmedia RTRW.NET',
            }),
          });
          sentReal = true;
        } catch (e: any) {
          sendError = e.message;
        }
      }

      return res.json({
        success: true,
        sentReal,
        message: sentReal
          ? `Email aktivasi berhasil dikirim ke ${email}. Silakan cek inbox/spam.`
          : `Mode Sandboxed: Kode verifikasi ${finalCode} siap digunakan.`,
        error: sendError,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Auto-Mutation & Webhook API Routes
  interface WebhookEventRecord {
    id: string;
    receivedAt: string;
    provider: string;
    bank: string;
    amount: number;
    type: string;
    description: string;
    status: 'received' | 'processed' | 'error';
    rawBody: any;
  }
  let inMemoryWebhookLogs: WebhookEventRecord[] = [
    {
      id: "LOG-INIT-01",
      receivedAt: new Date(Date.now() - 3600000).toISOString(),
      provider: "moota",
      bank: "BCA",
      amount: 150247,
      type: "CR",
      description: "QRIS INBOUND TRF AHMAD FAUZI",
      status: "processed",
      rawBody: { service: "moota", amount: 150247, type: "CR" }
    }
  ];
  let activeWebhookSecret: string = process.env.WEBHOOK_SECRET || "whsec_masmedia_9a8b7c6d5e4f3a2b";

  // 1. Get Webhook Config & Endpoints
  app.get("/api/webhook/config", (req, res) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    res.json({
      success: true,
      secret: activeWebhookSecret,
      endpoints: {
        moota: `${baseUrl}/api/webhook/moota`,
        cekmutasi: `${baseUrl}/api/webhook/cekmutasi`,
        custom: `${baseUrl}/api/webhook/auto-mutasi`,
      },
      instructions: {
        moota: "Buka dasbor Moota -> Settings -> Notifikasi / Webhook -> Tambahkan Webhook URL -> Masukkan Secret Key.",
        cekmutasi: "Buka dasbor Cekmutasi -> Integrasi -> Webhook API -> Tempel URL Callback dan API Signature Key.",
        android: "Gunakan MacroDroid / Tasker / Webhook Forwarder untuk meneruskan SMS & Notifikasi m-Banking ke URL Custom."
      }
    });
  });

  // 2. Generate New Secret Key
  app.post("/api/webhook/generate-secret", (req, res) => {
    const chars = "abcdef0123456789";
    let randomHex = "";
    for (let i = 0; i < 24; i++) {
      randomHex += chars[Math.floor(Math.random() * chars.length)];
    }
    activeWebhookSecret = `whsec_masmedia_${randomHex}`;
    res.json({
      success: true,
      secret: activeWebhookSecret,
      message: "Kunci rahasia Webhook baru berhasil dibuat.",
    });
  });

  // 3. Webhook Receiver: Moota
  app.post("/api/webhook/moota", (req, res) => {
    try {
      const payload = req.body;
      const signatureHeader = req.get("Signature") || req.get("X-Moota-Signature");
      
      console.log("[Webhook Moota Inbound]:", JSON.stringify(payload).slice(0, 200));

      // Moota sends an array of mutations or a single mutation object
      const mutations = Array.isArray(payload) ? payload : [payload];
      const processed: any[] = [];

      mutations.forEach((item: any, idx: number) => {
        const amount = Number(item.amount || item.nominal || item.total || 0);
        const type = String(item.type || item.mutation_type || 'CR').toUpperCase();
        const bank = String(item.bank_type || item.account_number || item.bank || 'BANK').toUpperCase();
        const description = String(item.description || item.note || 'Moota Auto-Mutation');

        if (type === 'CR' && amount > 0) {
          const logItem: WebhookEventRecord = {
            id: `MOOTA-${Date.now()}-${idx}`,
            receivedAt: new Date().toISOString(),
            provider: "moota",
            bank,
            amount,
            type,
            description,
            status: "received",
            rawBody: item,
          };
          inMemoryWebhookLogs.unshift(logItem);
          processed.push(logItem);
        }
      });

      // Keep only latest 100 logs
      if (inMemoryWebhookLogs.length > 100) {
        inMemoryWebhookLogs = inMemoryWebhookLogs.slice(0, 100);
      }

      res.status(200).json({
        status: true,
        message: `Moota webhook diterima (${processed.length} mutasi CR dicatat)`,
        processedCount: processed.length,
      });
    } catch (e: any) {
      console.error("[Webhook Moota Error]:", e);
      res.status(400).json({ status: false, error: e.message });
    }
  });

  // 4. Webhook Receiver: Cekmutasi
  app.post("/api/webhook/cekmutasi", (req, res) => {
    try {
      const payload = req.body;
      console.log("[Webhook Cekmutasi Inbound]:", JSON.stringify(payload).slice(0, 200));

      const content = payload.content || payload.data || payload;
      const mutations = Array.isArray(content) ? content : [content];
      const processed: any[] = [];

      mutations.forEach((item: any, idx: number) => {
        const amount = Number(item.amount || item.nominal || 0);
        const type = String(item.type || 'CR').toUpperCase();
        const bank = String(item.bank || item.account_type || 'CEKMUTASI').toUpperCase();
        const description = String(item.description || item.note || 'Cekmutasi Transfer Inbound');

        if (type === 'CR' && amount > 0) {
          const logItem: WebhookEventRecord = {
            id: `CEKMUTASI-${Date.now()}-${idx}`,
            receivedAt: new Date().toISOString(),
            provider: "cekmutasi",
            bank,
            amount,
            type,
            description,
            status: "received",
            rawBody: item,
          };
          inMemoryWebhookLogs.unshift(logItem);
          processed.push(logItem);
        }
      });

      if (inMemoryWebhookLogs.length > 100) {
        inMemoryWebhookLogs = inMemoryWebhookLogs.slice(0, 100);
      }

      res.status(200).json({
        status: true,
        message: "Cekmutasi webhook diterima dengan sukses",
        processedCount: processed.length,
      });
    } catch (e: any) {
      res.status(400).json({ status: false, error: e.message });
    }
  });

  // 5. Generic Custom Auto-Mutasi / Android Forwarder Webhook
  app.post("/api/webhook/auto-mutasi", (req, res) => {
    try {
      const { amount, bank, description, provider, secret } = req.body;
      
      const numAmount = Number(amount || 0);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ status: false, message: "Parameter amount wajib diisi dan harus lebih besar dari 0" });
      }

      const logItem: WebhookEventRecord = {
        id: `CUSTOM-${Date.now()}`,
        receivedAt: new Date().toISOString(),
        provider: provider || "custom",
        bank: (bank || "BANK").toUpperCase(),
        amount: numAmount,
        type: "CR",
        description: description || "Auto-Mutasi Inbound",
        status: "received",
        rawBody: req.body,
      };

      inMemoryWebhookLogs.unshift(logItem);
      if (inMemoryWebhookLogs.length > 100) {
        inMemoryWebhookLogs = inMemoryWebhookLogs.slice(0, 100);
      }

      res.status(200).json({
        status: true,
        message: `Callback mutasi ${numAmount} berhasil diterima.`,
        data: logItem,
      });
    } catch (e: any) {
      res.status(500).json({ status: false, error: e.message });
    }
  });

  // 6. Get Server Webhook Logs
  app.get("/api/webhook/logs", (req, res) => {
    res.json({
      success: true,
      count: inMemoryWebhookLogs.length,
      logs: inMemoryWebhookLogs,
    });
  });

  // AI Generation API Route
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, category, targetROSVersion, variables } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Parameter prompt wajib diisi." });
      }

      const gemini = getGeminiClient();

      const systemInstruction = `Anda adalah "NetRadius AI Assistant" — Asisten AI Pakar Jaringan MikroTik (MTCNA, MTCRE, MTCTCE, MTCUME, MTCINE) dan Desainer Web Hotspot Profesional untuk ISP RTRW.NET.

TUGAS UTAMA:
1. Jika pengguna meminta SCRIPT MIKROTIK (QoS, Firewall, Load Balance PCC, VPN, Isolir, Hotspot, PPPoE, RADIUS, dll):
   - Hasilkan script RouterOS (ROS v6 atau ROS v7 sesuai permintaan, default v7) yang PALING OPTIMAL, EFISIEN, dan AMAN (Best-Practice).
   - Selalu berikan komentar penjelasan (#) di setiap baris/blok penting.
   - Sertakan petunjuk cara pasang via MikroTik Terminal / Winbox dan variabel yang perlu disesuaikan (misal interface WAN, IP Gateway, pool).

2. Jika pengguna meminta TEMPLATE HOTSPOT (Voucher A4 21 voucher, Struk Thermal 58/80mm, Login Page Captive Portal):
   - Hasilkan kode HTML & CSS lengkap (dan JavaScript jika perlu login status) yang SIAP DIGUNAKAN (Drop-in ready).
   - Gunakan variabel standar MikroTik Hotspot: $(username), $(password), $(validity), $(price), $(limit-uptime), $(profile), $(ip), $(mac), $(link-login-only), dll.
   - Desain harus SANGAT MODERN, BERSIH, ELEGAN, dan RESPONSIF.

Format Output:
- Berikan ringkasan singkat apa yang dihasilkan.
- Kode utama diletakkan di dalam markdown code block:
  - Untuk script RouterOS: \`\`\`routeros atau \`\`\`bash
  - Untuk template Hotspot: \`\`\`html
- Berikan tips implementasi atau catatan keamanan di bagian akhir.
Bahasa: Bahasa Indonesia yang profesional, ramah, dan ringkas.`;

      if (gemini) {
        try {
          const response = await gemini.models.generateContent({
            model: "gemini-3.7-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${prompt}\n\n[Konteks Tambahan: Kategori=${category || "mikrotik"}, Target RouterOS=${targetROSVersion || "v7.x"}, Parameter=${JSON.stringify(variables || {})}]`,
                  },
                ],
              },
            ],
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.2,
            },
          });

          const outputText = response.text || "";
          return res.json({
            success: true,
            source: "gemini-3.7-flash",
            result: outputText,
          });
        } catch (apiError: any) {
          console.warn("Gemini API call failed, falling back to expert engine:", apiError?.message);
        }
      }

      // Fallback Engine if API key is not present or rate-limited
      const fallbackResult = generateExpertFallbackCode(prompt, category, targetROSVersion, variables);
      return res.json({
        success: true,
        source: "expert-engine",
        result: fallbackResult,
      });
    } catch (error: any) {
      console.error("AI Generation error:", error);
      res.status(500).json({
        error: "Gagal memproses permintaan AI: " + (error?.message || "Internal server error"),
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NetRadius Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateExpertFallbackCode(
  prompt: string,
  category?: string,
  rosVersion: string = "v7",
  variables?: any
): string {
  const p = (prompt || "").toLowerCase();

  // 1. Hotspot A4 21 Voucher
  if (p.includes("a4") || p.includes("21") || (category === "hotspot_a4")) {
    return `### 🖨️ Template Hotspot Lembar A4 (21 Voucher per Lembar - 3 Kolom x 7 Baris)
Template ini didesain khusus presisi cetak kertas A4 portrait dengan margin 6mm, layout modern minimalis, badge harga gelap elegan, dan QR code scan login.

\`\`\`html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Voucher Hotspot RTRW.NET A4 21</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body {
      background: #f8fafc;
      color: #0f172a;
      padding: 4mm;
    }
    .grid-a4 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3.5mm;
    }
    .voucher-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      height: 38.5mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      page-break-inside: avoid;
    }
    .v-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
    }
    .brand-name {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #0f172a;
    }
    .brand-name span { color: #10b981; }
    .ssid { font-size: 7.5px; color: #64748b; font-weight: 600; }
    .price-pill {
      background: #0f172a;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .v-body {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
    }
    .code-box {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 4px;
      text-align: center;
    }
    .code-label { font-size: 6.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
    .code-val {
      font-family: "Courier New", Courier, monospace;
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 1.5px;
    }
    .qr-box {
      width: 34px;
      height: 34px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-box img { width: 30px; height: 30px; }
    .v-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 3px;
      font-size: 7.5px;
      color: #64748b;
    }
    .time-limit { font-weight: 700; color: #059669; }
    @media print {
      body { background: white; padding: 0; }
      .voucher-card { box-shadow: none; border: 1px dashed #94a3b8; }
    }
  </style>
</head>
<body>
  <div class="grid-a4">
    <!-- LOOP VOUCHER START (Ulangi 21 kali per lembar) -->
    <div class="voucher-card">
      <div class="v-header">
        <div>
          <div class="brand-name">RTRW<span>.NET</span></div>
          <div class="ssid">SSID: @RTRW-HOTSPOT</div>
        </div>
        <div class="price-pill">Rp $(price)</div>
      </div>
      <div class="v-body">
        <div class="code-box">
          <div class="code-label">KODE VOUCHER / USER</div>
          <div class="code-val">$(username)</div>
        </div>
        <div class="qr-box">
          <img src="http://api.qrserver.com/v1/create-qr-code/?size=100x100&data=http://$(hostname)/login?username=$(username)" alt="QR">
        </div>
      </div>
      <div class="v-footer">
        <span class="time-limit">⏱ Durasi: $(limit-uptime)</span>
        <span>WA: 0812-3456-7890</span>
      </div>
    </div>
    <!-- LOOP VOUCHER END -->
  </div>
</body>
</html>
\`\`\`

#### 💡 Cara Penggunaan di User Manager / MikroTik:
1. Simpan kode di atas ke file template voucher pada software Billing / User Manager.
2. Variabel \`$(username)\`, \`$(price)\`, dan \`$(limit-uptime)\` akan otomatis terisi saat digenerate.
3. Cetak langsung dengan opsi cetak browser: **Ukuran Kertas: A4, Margin: Default / Minimum, Scale: 100%**.`;
  }

  // 2. MikroTik QoS / Bandwidth Management
  if (p.includes("qos") || p.includes("bandwidth") || p.includes("simple queue") || p.includes("game") || (category === "mikrotik_qos")) {
    return `### ⚡ Script MikroTik: QoS & Bandwidth Management Prioritas Game & Streaming (ROS v7)
Script ini membagi bandwidth secara pintar menggunakan **Simple Queue + PCQ** dan menandai traffic game (Mobile Legends, Free Fire, PUBG, Valorant) agar mendapatkan prioritas ping terendah (Priority 1) tanpa lag saat ada pengguna mendownload.

\`\`\`routeros
# ================================================================
# MIKROTIK ROUTEROS v7 - SMART QOS & BANDWIDTH MANAGEMENT
# ISP RTRW.NET - PRIORITAS GAME & STREAMING ANTI-LAG
# ================================================================

/log info message="[NetRadius] Memasang konfigurasi Smart QoS..."

# 1. Buat PCQ Rate Limiter untuk Hotspot & PPPoE Pelanggan
/queue type
add name="PCQ_Download_Client" kind=pcq pcq-classifier=dst-address pcq-limit=50KiB pcq-total-limit=2000KiB
add name="PCQ_Upload_Client" kind=pcq pcq-classifier=src-address pcq-limit=50KiB pcq-total-limit=2000KiB

# 2. Mangle Firewall: Deteksi Port & DSCP Game Online
/ip firewall mangle
# Tandai Traffic DNS (Prioritas 1 - Sangat Cepat)
add chain=prerouting action=mark-packet new-packet-mark=PKT_DNS passthrough=no dst-port=53 protocol=udp comment="[QoS] Traffic DNS"
add chain=prerouting action=mark-packet new-packet-mark=PKT_DNS passthrough=no dst-port=53 protocol=tcp comment="[QoS] Traffic DNS TCP"

# Tandai Traffic Game Populer (Mobile Legends, Free Fire, PUBG, Valorant, Point Blank)
add chain=prerouting action=mark-packet new-packet-mark=PKT_GAME passthrough=no dst-port=5000-5200,8001,9000-9010,10012,17500 protocol=udp comment="[QoS] Game Port UDP"
add chain=prerouting action=mark-packet new-packet-mark=PKT_GAME passthrough=no dst-port=7000-8000,9000-9090,10000-10100 protocol=tcp comment="[QoS] Game Port TCP"

# Tandai Traffic Browsing & Sosmed
add chain=prerouting action=mark-packet new-packet-mark=PKT_WEB passthrough=no dst-port=80,443 protocol=tcp comment="[QoS] Browsing HTTPS"

# 3. Simple Queue Hierarki Utama
/queue simple
add name="01_PARENT_TOTAL_BANDWIDTH" target=192.168.0.0/16 max-limit=100M/100M comment="[NetRadius] Total Bandwidth ISP"

add name="02_PRIO_DNS" parent="01_PARENT_TOTAL_BANDWIDTH" packet-marks=PKT_DNS priority=1/1 max-limit=10M/10M limit-at=5M/5M comment="DNS Fast Lookup"
add name="03_PRIO_GAME" parent="01_PARENT_TOTAL_BANDWIDTH" packet-marks=PKT_GAME priority=2/2 max-limit=30M/30M limit-at=15M/15M comment="Low Ping Game Traffic"
add name="04_PRIO_BROWSING" parent="01_PARENT_TOTAL_BANDWIDTH" packet-marks=PKT_WEB priority=4/4 max-limit=80M/80M limit-at=30M/30M queue=PCQ_Upload_Client/PCQ_Download_Client comment="Browsing & Streaming"
add name="05_PRIO_DEFAULT" parent="01_PARENT_TOTAL_BANDWIDTH" priority=8/8 max-limit=50M/50M limit-at=10M/10M queue=PCQ_Upload_Client/PCQ_Download_Client comment="Other / Download Heavy"

/log info message="[NetRadius] Smart QoS berhasil diterapkan!"
\`\`\`

#### 🛡️ Tips Penerapan:
- Ganti \`max-limit=100M/100M\` pada queue parent sesuai total bandwidth langganan ISP uplink Anda.
- Pastikan opsi **FastTrack** pada firewall bypass mangle game atau dinonaktifkan jika ingin mangle berjalan 100%.`;
  }

  // 3. MikroTik Dual WAN PCC Load Balancing + Failover
  if (p.includes("load balance") || p.includes("pcc") || p.includes("dual wan") || p.includes("failover") || (category === "mikrotik_pcc")) {
    return `### 🌐 Script MikroTik: Dual WAN Load Balancing PCC (2 ISP) + Failover Otomatis (ROS v7)
Script ini mendistribusikan beban koneksi internet dari **2 ISP (ISP1 & ISP2)** secara seimbang menggunakan metode *Per Connection Classifier (PCC)* dan failover otomatis jika salah satu jalur terputus.

\`\`\`routeros
# ================================================================
# MIKROTIK ROUTEROS v7 - DUAL WAN LOAD BALANCE PCC + FAILOVER
# Interface: ether1-ISP1 (100M), ether2-ISP2 (100M), ether3-LAN (Lokal)
# ================================================================

# 1. Setting IP & Gateway ISP
# Misal: Gateway ISP1 = 192.168.1.1, Gateway ISP2 = 192.168.2.1

# 2. DNS Server Stabil
/ip dns set allow-remote-requests=yes servers=1.1.1.1,8.8.8.8,8.8.4.4

# 3. NAT Masquerade untuk kedua ISP
/ip firewall nat
add chain=srcnat out-interface=ether1-ISP1 action=masquerade comment="NAT Out ISP1"
add chain=srcnat out-interface=ether2-ISP2 action=masquerade comment="NAT Out ISP2"

# 4. Mangle PCC Load Balancing
/ip firewall mangle
# Accept traffic lokal agar tidak terkena load balancing
add chain=prerouting dst-address=192.168.1.0/24 action=accept in-interface=ether3-LAN
add chain=prerouting dst-address=192.168.2.0/24 action=accept in-interface=ether3-LAN

# Catat koneksi yang masuk dari masing-masing ISP
add chain=prerouting in-interface=ether1-ISP1 connection-state=new action=mark-connection new-connection-mark=CONN_ISP1 passthrough=yes
add chain=prerouting in-interface=ether2-ISP2 connection-state=new action=mark-connection new-connection-mark=CONN_ISP2 passthrough=yes

# Pembagian PCC 2 Jalur (src-address-and-port: 2/0 dan 2/1)
add chain=prerouting in-interface=ether3-LAN connection-state=new dst-address-type=!local per-connection-classifier=both-addresses-and-ports:2/0 action=mark-connection new-connection-mark=CONN_ISP1 passthrough=yes
add chain=prerouting in-interface=ether3-LAN connection-state=new dst-address-type=!local per-connection-classifier=both-addresses-and-ports:2/1 action=mark-connection new-connection-mark=CONN_ISP2 passthrough=yes

# Routing Mark dari Connection Mark
add chain=prerouting in-interface=ether3-LAN connection-mark=CONN_ISP1 action=mark-routing new-routing-mark=TO_ISP1 passthrough=no
add chain=prerouting in-interface=ether3-LAN connection-mark=CONN_ISP2 action=mark-routing new-routing-mark=TO_ISP2 passthrough=no

# Output Router Mangle
add chain=output connection-mark=CONN_ISP1 action=mark-routing new-routing-mark=TO_ISP1 passthrough=no
add chain=output connection-mark=CONN_ISP2 action=mark-routing new-routing-mark=TO_ISP2 passthrough=no

# 5. Routing Table ROS v7
/routing table
add name=TO_ISP1 fib
add name=TO_ISP2 fib

# 6. Static Routes dengan Check Gateway Failover
/ip route
add gateway=192.168.1.1 routing-table=TO_ISP1 check-gateway=ping distance=1
add gateway=192.168.2.1 routing-table=TO_ISP2 check-gateway=ping distance=1

# Default Route Failover untuk Router Sendiri
add gateway=192.168.1.1 distance=1 check-gateway=ping comment="Default ISP1 Primary"
add gateway=192.168.2.1 distance=2 check-gateway=ping comment="Default ISP2 Backup"
\`\`\`

#### ⚙️ Penyesuaian:
- Sesuaikan nama interface \`ether1-ISP1\`, \`ether2-ISP2\`, dan \`ether3-LAN\` dengan port pada router Anda.
- Ganti \`192.168.1.1\` dan \`192.168.2.1\` dengan IP gateway masing-masing modem ISP.`;
  }

  // 4. Default High-Quality MikroTik Security & RAW Filter Script
  return `### 🛡️ Script MikroTik: Firewall RAW Protection, Anti-DDoS, & Anti Brute Force (ROS v7)
Script ini memanfaatkan tabel **RAW Firewall** MikroTik untuk membuang paket berbahaya (SYN Flood, Port Scan, Brute-Force SSH/Winbox) sebelum membebani CPU router.

\`\`\`routeros
# ================================================================
# MIKROTIK ROUTEROS v7 - RAW FIREWALL SECURITY & ANTI BRUTE-FORCE
# ================================================================

# 1. Buat Address-List IP Lokal & IP Whitelist Admin
/ip firewall address-list
add list=IP_WHITELIST_ADMIN address=192.168.88.0/24 comment="Jaringan Admin Aman"
add list=IP_BOGON address=0.0.0.0/8 comment="Bogon IP"
add list=IP_BOGON address=127.0.0.0/8 comment="Loopback"
add list=IP_BOGON address=224.0.0.0/3 comment="Multicast"

# 2. RAW Firewall: Drop Bogon & Serangan Invalid Packet (Hemat CPU)
/ip firewall raw
add chain=prerouting action=drop in-interface-list=WAN connection-state=invalid comment="[Security] Drop Invalid Packets"
add chain=prerouting action=drop in-interface-list=WAN src-address-list=IP_BOGON comment="[Security] Drop Bogon IP from WAN"
add chain=prerouting action=drop in-interface-list=WAN src-address-list=BLOCKED_ATTACKERS comment="[Security] Drop Known Attackers"

# 3. Proteksi SYN Flood & DDoS di RAW
add chain=prerouting action=drop in-interface-list=WAN protocol=tcp tcp-flags=syn,ack,!fin,!rst connection-state=new rate-limit=50,100 comment="[DDoS] SYN Flood Protection"

# 4. Anti Brute-Force Winbox & SSH (Stage 1, 2, 3 -> Blacklist 7 Hari)
/ip firewall filter
add chain=input protocol=tcp dst-port=8291,22 src-address-list=BLOCKED_ATTACKERS action=drop comment="[BruteForce] Drop Blacklisted Winbox/SSH"
add chain=input protocol=tcp dst-port=8291,22 connection-state=new src-address-list=BF_STAGE_3 action=add-src-to-address-list address-list=BLOCKED_ATTACKERS address-list-timeout=7d comment="[BruteForce] Add to Blacklist 7 Days"
add chain=input protocol=tcp dst-port=8291,22 connection-state=new src-address-list=BF_STAGE_2 action=add-src-to-address-list address-list=BF_STAGE_3 address-list-timeout=1m comment="[BruteForce] Stage 3"
add chain=input protocol=tcp dst-port=8291,22 connection-state=new src-address-list=BF_STAGE_1 action=add-src-to-address-list address-list=BF_STAGE_2 address-list-timeout=1m comment="[BruteForce] Stage 2"
add chain=input protocol=tcp dst-port=8291,22 connection-state=new action=add-src-to-address-list address-list=BF_STAGE_1 address-list-timeout=1m comment="[BruteForce] Stage 1"

# 5. Blokir Port Scanner
add chain=input protocol=tcp psd=21,3s,3,1 action=add-src-to-address-list address-list=BLOCKED_ATTACKERS address-list-timeout=1d comment="[PortScan] Detected Port Scanner"

/log info message="[NetRadius] Security & Anti Brute Force RAW berhasil diaktifkan!"
\`\`\`

#### 🚀 Hasil & Manfaat:
- Penggunaan CPU tetap rendah (< 5%) meskipun diserang jutaan paket invalid/syn flood.
- Port Winbox dan SSH otomatis terlindungi dari bot pencari password.`;
}

startServer();
