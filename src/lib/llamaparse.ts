const LLAMA_PARSE_BASE_URL = 'https://api.llamaindex.ai/api/v1/llamaparse';
const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 90000;

type LlamaParseQueuedResponse = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
};

type LlamaParseResultEntry = {
  text?: string;
  markdown?: string;
  html?: string;
  structured_text?: string;
  json?: string | Record<string, unknown>;
  metadata?: Record<string, unknown>;
  pages?: Array<{ text?: string }>;
};

type LlamaParseStatusResponse = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  error?: string;
  result?: LlamaParseResultEntry[];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const FALLBACK_PARSE_KEY = 'llx-CpDvcIilWlYVLoC0KGT9if8pcvrb7ZTuXOhIDpjo2SG7QMjs';

const getParseKey = () => {
  const key = process.env.PARSE_KEY ?? FALLBACK_PARSE_KEY;
  if (!key) {
    throw new Error('Missing PARSE_KEY environment variable for LlamaParse');
  }
  return key;
};

const extractText = (entries?: LlamaParseResultEntry[]) => {
  if (!entries?.length) return '';
  const parts = entries
    .map((entry) => {
      if (entry.text && entry.text.trim()) return entry.text;
      if (entry.markdown && entry.markdown.trim()) return entry.markdown;
      if (entry.html && entry.html.trim()) return entry.html;
      if (entry.structured_text && entry.structured_text.trim()) return entry.structured_text;
      if (entry.pages?.length) {
        return entry.pages
          .map((page) => page.text ?? '')
          .filter(Boolean)
          .join('\n\n');
      }
      if (entry.json) {
        try {
          return typeof entry.json === 'string' ? entry.json : JSON.stringify(entry.json);
        } catch {
          return '';
        }
      }
      return '';
    })
    .filter((part) => part.trim().length > 0);
  return parts.join('\n\n');
};

const toFormData = (buffer: Buffer, filename: string) => {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
  formData.append('file', blob, filename);
  formData.append('response_format', 'json');
  return formData;
};

export const parsePdfWithLlama = async (
  buffer: Buffer,
  filename: string,
  opts?: {
    pollIntervalMs?: number;
    timeoutMs?: number;
  }
) => {
  const { pollIntervalMs = DEFAULT_POLL_INTERVAL_MS, timeoutMs = DEFAULT_TIMEOUT_MS } = opts ?? {};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs + 5000);
  try {
    const key = getParseKey();
    const formData = toFormData(buffer, filename);

    const queuedResponse = await fetch(LLAMA_PARSE_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
      },
      body: formData,
      signal: controller.signal,
    });

    if (!queuedResponse.ok) {
      const errorText = await queuedResponse.text();
      throw new Error(`LlamaParse enqueue failed (${queuedResponse.status}): ${errorText}`);
    }

    const queuedPayload = (await queuedResponse.json()) as LlamaParseQueuedResponse;
    if (!queuedPayload?.id) {
      throw new Error('LlamaParse did not return a job id');
    }

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const statusResponse = await fetch(`${LLAMA_PARSE_BASE_URL}/${queuedPayload.id}`, {
        headers: {
          Authorization: `Bearer ${key}`,
        },
        signal: controller.signal,
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        throw new Error(`LlamaParse status check failed (${statusResponse.status}): ${errorText}`);
      }

      const statusPayload = (await statusResponse.json()) as LlamaParseStatusResponse;
      if (statusPayload.status === 'FAILED') {
        throw new Error(statusPayload.error || 'LlamaParse job failed');
      }
      if (statusPayload.status === 'SUCCESS') {
        const text = extractText(statusPayload.result);
        if (!text) {
          throw new Error('LlamaParse returned success without text content');
        }
        return text;
      }

      await delay(pollIntervalMs);
    }

    throw new Error('Timed out waiting for LlamaParse result');
  } finally {
    clearTimeout(timeout);
  }
};


