<<<<<<< HEAD
// lib/blobAudit.ts
// Auditoría en Vercel Blob con acceso lazy del token

import { list, get, put } from '@vercel/blob';
import { AuditEntry } from './types';

let blobToken: string | null = null;

function getBlobToken(): string {
  if (!blobToken) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not set');
    }
    blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  }
  return blobToken;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    const token = getBlobToken();

    // Formato: audit/YYYYMM.json
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const auditPath = `audit/${yyyymm}.json`;

    // Leer el archivo existente o crear uno nuevo
    let entries: AuditEntry[] = [];

    try {
      const response = await get(auditPath, { token });
      if (response) {
        entries = JSON.parse(await response.text()) as AuditEntry[];
      }
    } catch (error) {
      // El archivo no existe, comenzar con array vacío
      entries = [];
    }

    // Agregar nueva entrada
    entry.id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    entry.timestamp = new Date().toISOString();
    entries.push(entry);

    // Escribir de vuelta
    await put(auditPath, JSON.stringify(entries, null, 2), {
      token,
      contentType: 'application/json',
    });
  } catch (error) {
    // No fallar la operación principal si falla la auditoría
    console.error('Failed to record audit:', error);
  }
}

export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  try {
    const token = getBlobToken();
    const auditPath = `audit/${yyyymm}.json`;

    const response = await get(auditPath, { token });
    if (response) {
      return JSON.parse(await response.text()) as AuditEntry[];
    }
    return [];
  } catch (error) {
    console.error(`Failed to read audit for ${yyyymm}:`, error);
    return [];
  }
}

export async function listAuditFiles(): Promise<string[]> {
  try {
    const token = getBlobToken();
    const blobs = await list({ prefix: 'audit/', token });
    return blobs.blobs.map((b) => b.pathname).filter((p) => p.endsWith('.json'));
  } catch (error) {
    console.error('Failed to list audit files:', error);
    return [];
  }
=======
import { get, put } from '@vercel/blob';

const token = process.env.BLOB_READ_WRITE_TOKEN;

function getBlobToken() {
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN no está configurado.');
  }
  return token;
}

export interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  details: Record<string, unknown>;
}

async function readBlobText(stream: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!stream) {
    return '';
  }
  return await new Response(stream).text();
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  const now = new Date();
  const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}.json`;
  const pathname = `audit/${key}`;

  const existing = await get(pathname, {
    access: 'private',
    token: getBlobToken(),
  }).catch(() => null);

  const currentData: AuditEntry[] = existing?.statusCode === 200
    ? JSON.parse(await readBlobText(existing.stream))
    : [];

  currentData.push(entry);
  await put(pathname, JSON.stringify(currentData, null, 2), {
    access: 'private',
    contentType: 'application/json',
    token: getBlobToken(),
  });
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
}
