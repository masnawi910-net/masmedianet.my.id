export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateStr);
  }
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateTimeStr: string): string {
  if (!dateTimeStr) return '-';
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateTimeStr;
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatSpeed(mbps: number): string {
  return `${mbps} Mbps`;
}

export function generateInvoiceNumber(seqNumber: number, monthOrDate: number | Date = new Date(), yearNum?: number): string {
  let year: number;
  let month: string;
  if (monthOrDate instanceof Date) {
    year = monthOrDate.getFullYear();
    month = String(monthOrDate.getMonth() + 1).padStart(2, '0');
  } else {
    year = yearNum || new Date().getFullYear();
    month = String(monthOrDate).padStart(2, '0');
  }
  const seq = String(seqNumber).padStart(4, '0');
  return `INV-${year}${month}-${seq}`;
}

export function generateRandomPassword(length = 8): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789#@!';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export function generateRadiusUsername(name?: string, id?: string): string {
  const cleanName = (name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'user';
  const cleanId = (id || '').replace(/[^0-9]/g, '');
  return `${cleanName}${cleanId ? cleanId.slice(-3) : '01'}`;
}

export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function getWhatsAppLink(phone: string, message: string): string {
  const validPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${validPhone}?text=${encodedText}`;
}

export function replaceWhatsAppPlaceholders(
  template: string,
  vars: Record<string, string | number | undefined>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(placeholder, String(value || ''));
  }
  return result;
}
