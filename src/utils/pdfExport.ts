import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type AnyRecord = Record<string, any>;

function normalizeRecord(record: AnyRecord | null | undefined): AnyRecord {
  if (!record || typeof record !== 'object') return {};
  return record;
}

function sectionHeading(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(15, 23, 42);
  doc.setTextColor(255);
  doc.setFontSize(12);
  doc.rect(40, y, 515, 22, 'F');
  doc.text(title, 48, y + 15);
  doc.setTextColor(0);
  return y + 36;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 40) {
    doc.addPage();
    return 40;
  }
  return y;
}

function drawKeyValueList(doc: jsPDF, entries: Array<{ key: string; value: any }>, y: number): number {
  doc.setFontSize(10);
  const labelWidth = 140;
  const maxWidth = 515 - labelWidth;

  for (const { key, value } of entries) {
    const v = stringify(value);
    const wrapped = doc.splitTextToSize(v, maxWidth);
    y = ensureSpace(doc, y, 18 + (wrapped.length - 1) * 12);
    doc.setFont(undefined, 'bold');
    doc.text(key, 48, y);
    doc.setFont(undefined, 'normal');
    doc.text(wrapped as any, 48 + labelWidth, y);
    y += 18 + (wrapped.length - 1) * 12;
  }
  return y;
}

function drawAuditCards(doc: jsPDF, audits: AnyRecord[], y: number): number {
  doc.setFontSize(10);
  for (const item of audits) {
    const fields: Array<{ key: string; value: any }> = [
      { key: 'action', value: item.action || item.event_type },
      { key: 'created_at', value: item.created_at },
      { key: 'actor_id', value: item.actor_id },
      { key: 'target_user_id', value: item.target_user_id },
      { key: 'details', value: item.details },
    ];
    const labelWidth = 140;
    const maxWidth = 515 - labelWidth;
    let est = 18;
    for (const f of fields) {
      const wrapped = doc.splitTextToSize(stringify(f.value), maxWidth) as string[];
      est += 18 + (wrapped.length - 1) * 12;
    }
    y = ensureSpace(doc, y, est + 12);
    doc.setFillColor(248, 250, 252);
    doc.rect(40, y, 515, est, 'F');
    y += 14;
    y = drawKeyValueList(doc, fields, y);
    y += 6;
  }
  return y;
}

function stringify(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  try { return JSON.stringify(value); } catch { return String(value); }
}

export function exportUserDataToPdf(filename: string, exportPayload: AnyRecord) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  // Title
  doc.setFontSize(16);
  doc.text('User Data Export', 40, 40);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 56);

  // Sections
  // Support alternate shapes: some RPCs may return at root or under data
  const payload = (exportPayload && exportPayload.user_profile !== undefined) ? exportPayload : (exportPayload?.data || exportPayload);
  const profile = normalizeRecord(payload.user_profile || payload.profile || payload);
  const preferences = normalizeRecord(payload.preferences);
  const audit = Array.isArray(payload.audit_history || payload.audit || payload.logs) 
    ? (payload.audit_history || payload.audit || payload.logs) 
    : [];

  // Profile section (key-value, not table)
  let y = 80;
  y = sectionHeading(doc, 'Profile', y);
  y = drawKeyValueList(
    doc,
    [
      { key: 'firebase_uid', value: profile.firebase_uid },
      { key: 'email', value: profile.email },
      { key: 'display_name', value: profile.display_name },
      { key: 'role', value: profile.role },
      { key: 'account_status', value: profile.account_status },
      { key: 'email_verified', value: profile.email_verified },
      { key: 'created_at', value: profile.created_at },
      { key: 'updated_at', value: profile.updated_at },
    ],
    y
  );

  // Preferences (key-value)
  y = sectionHeading(doc, 'Preferences', y + 8);
  const prefEntries = Object.keys(preferences).length
    ? Object.keys(preferences).map((k) => ({ key: k, value: preferences[k] }))
    : [{ key: 'No preferences', value: '' }];
  y = drawKeyValueList(doc, prefEntries, y);

  // Audit history as readable cards
  y = sectionHeading(doc, `Audit History ${audit.length ? `1-${Math.min(audit.length, audit.length)}` : ''}`, y + 8);
  if (audit.length) {
    y = drawAuditCards(doc, audit.map(normalizeRecord), y);
  } else {
    y = drawKeyValueList(doc, [{ key: 'No records found', value: '' }], y);
  }

  doc.save(filename);
}


