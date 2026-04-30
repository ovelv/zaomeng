import { SegmentDraft } from "@/lib/types";

function normalizeText(input: string) {
  return input
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/([。！？!?；;，,:：])\1+/g, "$1")
    .trim();
}

function estimateDuration(charCount: number) {
  return Math.max(4, Math.round(charCount / 4.3));
}

function clampDuration(duration: number) {
  return Math.min(15, Math.max(4, duration));
}

function splitSentence(sentence: string, targetMax: number) {
  if (sentence.length <= targetMax) {
    return [sentence];
  }

  const parts: string[] = [];
  let buffer = "";

  for (const chunk of sentence.split(/(?<=[，,：:])/)) {
    const next = `${buffer}${chunk}`;
    if (next.length > targetMax && buffer) {
      parts.push(buffer.trim());
      buffer = chunk;
    } else {
      buffer = next;
    }
  }

  if (buffer.trim()) {
    parts.push(buffer.trim());
  }

  return parts.flatMap((part) => {
    if (part.length <= targetMax) {
      return [part];
    }

    const slices: string[] = [];
    for (let i = 0; i < part.length; i += targetMax) {
      slices.push(part.slice(i, i + targetMax));
    }
    return slices;
  });
}

export function splitNarration(
  input: string,
  options?: { targetMin?: number; targetMax?: number }
) {
  const targetMin = options?.targetMin ?? 60;
  const targetMax = options?.targetMax ?? 70;
  const normalized = normalizeText(input);

  if (!normalized) {
    return [] as SegmentDraft[];
  }

  const rawSentences = normalized
    .split(/(?<=[。！？!?；;\n])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .flatMap((sentence) => splitSentence(sentence, targetMax));

  const segments: string[] = [];
  let buffer = "";

  const pushBuffer = () => {
    if (buffer.trim()) {
      segments.push(buffer.trim());
      buffer = "";
    }
  };

  for (const sentence of rawSentences) {
    const next = `${buffer}${sentence}`;
    if (!buffer) {
      buffer = sentence;
      continue;
    }

    if (next.length <= targetMax) {
      buffer = next;
      continue;
    }

    if (buffer.length >= targetMin) {
      pushBuffer();
      buffer = sentence;
      continue;
    }

    const softChunks = sentence.split(/(?<=[，,：:])/).filter(Boolean);
    if (softChunks.length > 1) {
      for (const chunk of softChunks) {
        if (`${buffer}${chunk}`.length <= targetMax) {
          buffer += chunk;
        } else {
          pushBuffer();
          buffer = chunk;
        }
      }
      continue;
    }

    pushBuffer();
    buffer = sentence;
  }

  pushBuffer();

  return segments.map((text, index) => {
    const duration = clampDuration(estimateDuration(text.length));
    return {
      id: crypto.randomUUID(),
      index: index + 1,
      text,
      charCount: text.length,
      estimatedDurationSec: duration,
      targetDurationSec: duration,
    };
  });
}

export function summarizeSplit(segments: SegmentDraft[]) {
  return {
    count: segments.length,
    totalChars: segments.reduce((sum, item) => sum + item.charCount, 0),
    totalDurationSec: segments.reduce(
      (sum, item) => sum + item.estimatedDurationSec,
      0
    ),
  };
}
