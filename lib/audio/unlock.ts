// One-sample PCM WAV, used only to prepare the audio element during a tap.
const SILENT_WAV_BASE64 =
  "UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export function createAudioUnlockBlob(): Blob {
  const bytes = Uint8Array.from(atob(SILENT_WAV_BASE64), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: "audio/wav" });
}
