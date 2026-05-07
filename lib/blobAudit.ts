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
}
