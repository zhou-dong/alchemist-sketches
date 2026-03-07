import React from 'react';
import { useSpeech } from '@alchemist/shared';
import { ensureSpeechVoicesReady } from '../utils/speech';

interface AnimationControllerLike {
    startAnimation?: () => void;
    stopAnimation?: () => void;
}

interface UseStepNarrationPlaybackArgs {
    narrations: Record<number, string>;
    uiStep: number;
    onResetUiStep: () => void;
    animationController?: AnimationControllerLike | null;
    rate?: number;
}

export function useStepNarrationPlayback({
    narrations,
    uiStep,
    onResetUiStep,
    animationController,
    rate = 1.0,
}: UseStepNarrationPlaybackArgs) {
    const { stop, getCurrentVoice } = useSpeech({ rate });

    const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
    const [currentNarration, setCurrentNarration] = React.useState<string>('');

    const lastSpokenStepRef = React.useRef<number>(-1);
    const playbackVoiceRef = React.useRef<SpeechSynthesisVoice | null>(null);
    const speechRequestIdRef = React.useRef<number>(0);

    const speakStep = React.useCallback(
        (step: number) => {
            const text = narrations[step] ?? '';
            if (!text) return;
            if (lastSpokenStepRef.current === step) return;

            lastSpokenStepRef.current = step;
            setCurrentNarration(text);
            const requestId = ++speechRequestIdRef.current;

            void (async () => {
                if (!playbackVoiceRef.current) {
                    await ensureSpeechVoicesReady();
                    if (requestId !== speechRequestIdRef.current) return;
                    playbackVoiceRef.current = getCurrentVoice();
                }

                if (requestId !== speechRequestIdRef.current) return;
                speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = rate;
                if (playbackVoiceRef.current) {
                    utterance.voice = playbackVoiceRef.current;
                }

                utterance.onend = () => {
                    if (requestId === speechRequestIdRef.current) {
                        setCurrentNarration('');
                    }
                };
                utterance.onerror = () => {
                    if (requestId === speechRequestIdRef.current) {
                        setCurrentNarration('');
                    }
                };
                speechSynthesis.speak(utterance);
            })();
        },
        [getCurrentVoice, narrations, rate]
    );

    React.useEffect(() => {
        return () => {
            speechRequestIdRef.current += 1;
            stop();
        };
    }, [stop]);

    React.useEffect(() => {
        if (!isPlaying) return;
        speakStep(uiStep);
    }, [isPlaying, speakStep, uiStep]);

    const stopPlayback = React.useCallback(() => {
        speechRequestIdRef.current += 1;
        speechSynthesis.cancel();
        setIsPlaying(false);
        animationController?.stopAnimation?.();
        setCurrentNarration('');
    }, [animationController]);

    const pausePlayback = React.useCallback(() => {
        setIsPlaying(false);
        animationController?.stopAnimation?.();
        speechSynthesis.pause();
    }, [animationController]);

    const startPlayback = React.useCallback(() => {
        setIsPlaying(true);
        animationController?.startAnimation?.();
        speechSynthesis.resume();
    }, [animationController]);

    const resetNarrationState = React.useCallback(() => {
        onResetUiStep();
        lastSpokenStepRef.current = -1;
        playbackVoiceRef.current = null;
        setCurrentNarration('');
        speakStep(0);
    }, [onResetUiStep, speakStep]);

    return {
        isPlaying,
        currentNarration,
        speakStep,
        stopPlayback,
        pausePlayback,
        startPlayback,
        resetNarrationState,
    };
}
