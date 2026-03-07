const DEFAULT_VOICE_READY_TIMEOUT_MS = 1000;

/**
 * Ensure voices are loaded before selecting one.
 * Embedded browsers often populate voices asynchronously.
 */
export async function ensureSpeechVoicesReady(
    timeoutMs: number = DEFAULT_VOICE_READY_TIMEOUT_MS
): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speechSynthesis.getVoices().length > 0) return;

    await new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
            resolve();
        };
        const onVoicesChanged = () => {
            if (speechSynthesis.getVoices().length > 0) finish();
        };
        const timeoutId = setTimeout(finish, timeoutMs);
        speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
        onVoicesChanged();
    });
}
