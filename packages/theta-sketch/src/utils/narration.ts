// Narration utilities for estimating speech duration.
//
// NOTE: These timings are used to schedule narration callbacks on a GSAP-like
// timeline. If we underestimate, the next callback fires early and cancels the
// current utterance. If we overestimate too much, users will feel dead air.

// Average speaking rate (more conservative than 150 wpm).
// In practice, browser TTS (especially math-heavy sentences) often sounds
// closer to 120–140 wpm at rate=1.0.
const WORDS_PER_SECOND = 130 / 60; // ~2.17 words per second

// Character-rate fallback helps for long words / math-y lines.
const CHARS_PER_SECOND = 14; // rough spoken throughput, excluding spaces

// Minimum to prevent zero-length steps.
const MIN_STEP_SECONDS = 0.5;

function countMatches(text: string, re: RegExp): number {
    const m = text.match(re);
    return m ? m.length : 0;
}

/**
 * Estimate speaking duration based on word count
 * @param text - The text to estimate duration for
 * @param rate - Speech rate (default: 1.0)
 * @returns Duration in seconds
 */
export function estimateNarrationDuration(text: string, rate: number = 1.0): number {
    // Remove punctuation and count only actual words
    const cleanedText = text.replace(/[.,!?;:'"()\-]/g, '');
    const wordCount = cleanedText.split(/\s+/).filter(w => w.length > 0).length;

    // Light pause weights for punctuation (avoid explicit gaps between steps).
    const strongPauses = countMatches(text, /[.!?]/g); // sentence endings
    const mediumPauses = countMatches(text, /[,;:]/g); // phrase breaks
    const pauseSeconds = strongPauses * 0.12 + mediumPauses * 0.06;

    const wordsSeconds = wordCount / (WORDS_PER_SECOND * rate);
    const charCountNoSpace = text.replace(/\s+/g, '').length;
    const charsSeconds = charCountNoSpace / (CHARS_PER_SECOND * rate);

    const estimated = Math.max(wordsSeconds, charsSeconds) + pauseSeconds;
    return Math.max(MIN_STEP_SECONDS, estimated);
}

/**
 * Calculate step durations and cumulative start times from narrations
 * @param narrations - Record of step index to narration text
 * @param rate - Speech rate (default: 1.0)
 * @returns Object with durations and start times
 */
export function calculateStepTimings(narrations: Record<number, string>, rate: number = 1.0): {
    durations: Record<number, number>;
    startTimes: Record<number, number>;
    totalDuration: number;
} {
    const durations: Record<number, number> = {};
    const startTimes: Record<number, number> = {};
    
    let cumulativeTime = 0;
    Object.entries(narrations).forEach(([key, narration]) => {
        const stepIndex = parseInt(key);
        const duration = estimateNarrationDuration(narration, rate);
        durations[stepIndex] = duration;
        startTimes[stepIndex] = cumulativeTime;
        cumulativeTime += duration;
    });

    return {
        durations,
        startTimes,
        totalDuration: cumulativeTime,
    };
}
