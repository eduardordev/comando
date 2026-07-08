import { Resend } from 'resend';
import { QUADRANT_META } from '@comando/shared';
import type { DigestData } from './task.service';
import { formatLongDateEs, formatShortDateEs, parseDateKey } from '../lib/dates';

function resendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function taskRow(task: DigestData['overdue'][number]): string {
  const meta = QUADRANT_META[task.quadrant];
  return `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid #22252b;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${meta.color};margin-right:8px;"></span>
        <span style="color:#e8eaed;font-size:14px;">${escapeHtml(task.title)}</span>
        ${task.area ? `<span style="color:#8a919e;font-size:12px;"> · ${escapeHtml(task.area)}</span>` : ''}
      </td>
    </tr>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function section(title: string, color: string, tasks: DigestData['overdue']): string {
  if (tasks.length === 0) return '';
  return `
    <div style="margin-bottom:24px;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.08em;color:${color};text-transform:uppercase;margin-bottom:8px;">
        ${title} (${tasks.length})
      </div>
      <table style="width:100%;border-collapse:collapse;">${tasks.map(taskRow).join('')}</table>
    </div>`;
}

function buildWeekSection(weekAhead: DigestData['weekAhead']): string {
  if (weekAhead.length === 0) return '';
  const days = weekAhead
    .map(({ dateKey, tasks }) => {
      const label = formatShortDateEs(parseDateKey(dateKey));
      return `
        <div style="margin-bottom:12px;">
          <div style="font-family:monospace;font-size:11px;color:#8a919e;margin-bottom:4px;">${label}</div>
          <table style="width:100%;border-collapse:collapse;">${tasks.map(taskRow).join('')}</table>
        </div>`;
    })
    .join('');

  return `
    <div style="margin-bottom:24px;padding:16px;background:#15171b;border:1px solid #22252b;border-radius:10px;">
      <div style="font-family:monospace;font-size:12px;letter-spacing:0.08em;color:#3ed598;text-transform:uppercase;margin-bottom:12px;">
        🗓️ Semana por delante
      </div>
      ${days}
    </div>`;
}

function buildPriorityBreakdown(byQuadrant: DigestData['byQuadrant']): string {
  const rows = ([1, 2, 3, 4] as const)
    .map((q) => {
      const meta = QUADRANT_META[q];
      const count = byQuadrant[q].length;
      if (count === 0) return '';
      return `
        <tr>
          <td style="padding:4px 0;color:${meta.color};font-family:monospace;font-size:12px;">${meta.label}</td>
          <td style="padding:4px 0;color:#e8eaed;font-size:13px;text-align:right;">${count}</td>
        </tr>`;
    })
    .join('');
  if (!rows) return '';

  return `
    <div style="margin-bottom:24px;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.08em;color:#8a919e;text-transform:uppercase;margin-bottom:8px;">
        Pendientes por prioridad
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>`;
}

export function buildDigestEmail(data: DigestData, appUrl: string) {
  const now = new Date();
  const isMonday = now.getDay() === 1;
  const dateLabel = formatLongDateEs(now);

  const totalPending =
    data.byQuadrant[1].length +
    data.byQuadrant[2].length +
    data.byQuadrant[3].length +
    data.byQuadrant[4].length;

  const subject = isMonday
    ? `Plan de la semana · ${data.overdue.length} vencidas, ${totalPending} pendientes`
    : `Reporte de hoy · ${data.overdue.length} vencidas, ${totalPending} pendientes`;

  const html = `
  <div style="background:#0b0c0e;padding:24px;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#101216;border:1px solid #22252b;border-radius:14px;padding:28px;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.1em;color:#8a919e;text-transform:uppercase;">
        ${escapeHtml(dateLabel)}
      </div>
      <h1 style="color:#e8eaed;font-size:20px;margin:6px 0 20px;">
        ${isMonday ? 'Plan de la semana' : 'Comando del Día'}
      </h1>

      ${section('🔴 Vencidas', '#ff4527', data.overdue)}
      ${section('🟠 Para hoy', '#f5b93f', data.dueToday)}
      ${section('🟡 Para mañana', '#f5b93f', data.dueTomorrow)}
      ${isMonday ? buildWeekSection(data.weekAhead) : ''}
      ${buildPriorityBreakdown(data.byQuadrant)}

      ${totalPending === 0 ? '<p style="color:#8a919e;font-size:13px;">Terreno despejado. No hay tareas pendientes.</p>' : ''}

      <a href="${appUrl}" style="display:inline-block;margin-top:8px;color:#3ed598;font-family:monospace;font-size:12px;text-decoration:none;">
        Abrir Comando del Día →
      </a>
    </div>
  </div>`;

  return { subject, html };
}

export async function sendDailyDigest(data: DigestData): Promise<{ sent: boolean; reason?: string }> {
  const resend = resendClient();
  const to = process.env.REMINDER_EMAIL_TO;
  const from = process.env.REMINDER_EMAIL_FROM || 'Comando del Día <onboarding@resend.dev>';
  const appUrl = process.env.APP_URL || 'https://comando-del-dia.vercel.app';

  if (!resend) return { sent: false, reason: 'RESEND_API_KEY no configurada' };
  if (!to) return { sent: false, reason: 'REMINDER_EMAIL_TO no configurada' };

  const { subject, html } = buildDigestEmail(data, appUrl);

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}
