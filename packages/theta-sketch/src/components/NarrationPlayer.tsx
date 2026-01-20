import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useSpeech } from '@alchemist/shared';

import * as PlayArrow from '@mui/icons-material/PlayArrow';
import * as Pause from '@mui/icons-material/Pause';

const PlayIcon = PlayArrow.default as unknown as React.ElementType;
const PauseIcon = Pause.default as unknown as React.ElementType;

export interface NarrationPlayerProps {
  /** The narration content - spoken as whole paragraph */
  content: string;
  /** Speech rate (default: 1.0) */
  rate?: number;
  /** Size variant for icons */
  size?: 'small' | 'medium' | 'large';
  /** Called when narration completes */
  onComplete?: () => void;
  /** Called when playing state changes */
  onPlayingChange?: (isPlaying: boolean) => void;
  /** Show subtitles within the component */
  showSubtitles?: boolean;
  /** Maximum width for subtitle text */
  subtitleMaxWidth?: number | string;
}

export default function NarrationPlayer({
  content,
  rate = 1.0,
  size = 'large',
  onComplete,
  onPlayingChange,
  showSubtitles = false,
  subtitleMaxWidth = 600,
}: NarrationPlayerProps) {
  const theme = useTheme();
  const { isSupported, currentVoice } = useSpeech({ rate });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState('');

  // Refs for tracking
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const estimatedDurationRef = useRef<number>(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;
  const buttonSize = size === 'small' ? 'small' : size === 'medium' ? 'medium' : 'large';

  // Estimate duration based on word count and rate
  const estimateDuration = useCallback((text: string) => {
    const wordCount = text.split(/\s+/).length;
    // Average speaking rate: ~150 words per minute at rate 1.0
    const wordsPerSecond = (150 / 60) * rate;
    return (wordCount / wordsPerSecond) * 1000;
  }, [rate]);

  // Split content into sentences with word counts
  const sentenceData = React.useMemo(() => {
    const sentenceList = content.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    const totalWords = content.split(/\s+/).length;

    let cumulativeProgress = 0;
    return sentenceList.map(sentence => {
      const wordCount = sentence.split(/\s+/).length;
      const weight = wordCount / totalWords;
      const startProgress = cumulativeProgress;
      cumulativeProgress += weight * 100;
      return {
        text: sentence,
        wordCount,
        startProgress,
        endProgress: cumulativeProgress,
      };
    });
  }, [content]);

  // Get sentence based on progress percentage (weighted by word count)
  const getSentenceFromProgress = useCallback((progressPercent: number) => {
    if (sentenceData.length === 0) return '';

    for (const sentence of sentenceData) {
      if (progressPercent >= sentence.startProgress && progressPercent < sentence.endProgress) {
        return sentence.text;
      }
    }

    // Return last sentence if at 100%
    return sentenceData[sentenceData.length - 1]?.text || '';
  }, [sentenceData]);

  // Start progress tracking
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const duration = estimatedDurationRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      // Update subtitle based on progress (weighted by word count)
      const sentence = getSentenceFromProgress(newProgress);
      if (sentence) {
        setCurrentSubtitle(sentence);
      }
    }, 100);
  }, [getSentenceFromProgress]);

  // Stop progress tracking
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Start speaking
  const speak = useCallback(() => {
    speechSynthesis.cancel();
    stopProgressTracking();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = rate;
    utteranceRef.current = utterance;

    // Use the best voice from useSpeech hook
    if (currentVoice) {
      utterance.voice = currentVoice;
    }

    // Set initial subtitle to first sentence
    if (sentenceData.length > 0) {
      setCurrentSubtitle(sentenceData[0].text);
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentSubtitle('');
      stopProgressTracking();
      onComplete?.();
      onPlayingChange?.(false);
    };

    utterance.onerror = (event) => {
      // Ignore 'interrupted' errors (from cancel)
      if (event.error === 'interrupted') return;

      setIsPlaying(false);
      setIsPaused(false);
      stopProgressTracking();
      onPlayingChange?.(false);
    };

    // Calculate estimated duration and start progress tracking
    estimatedDurationRef.current = estimateDuration(content);
    startTimeRef.current = Date.now();
    setProgress(0);
    startProgressTracking();

    setIsPlaying(true);
    setIsPaused(false);
    onPlayingChange?.(true);

    speechSynthesis.speak(utterance);
  }, [content, rate, onComplete, onPlayingChange, estimateDuration, startProgressTracking, stopProgressTracking, currentVoice, sentenceData]);

  // Play/Pause toggle
  const handlePlayPause = useCallback(() => {
    if (isPlaying && !isPaused) {
      // Pause
      speechSynthesis.pause();
      pausedTimeRef.current = Date.now();
      stopProgressTracking();
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      speechSynthesis.resume();
      // Adjust start time to account for pause duration
      const pauseDuration = Date.now() - pausedTimeRef.current;
      startTimeRef.current += pauseDuration;
      startProgressTracking();
      setIsPaused(false);
    } else {
      // Start from beginning
      speak();
    }
  }, [isPlaying, isPaused, speak, startProgressTracking, stopProgressTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      stopProgressTracking();
    };
  }, [stopProgressTracking]);

  const getButtonState = () => {
    if (isPlaying && !isPaused) {
      return { icon: <PauseIcon sx={{ fontSize: iconSize }} />, tooltip: 'Pause' };
    } else if (isPaused) {
      return { icon: <PlayIcon sx={{ fontSize: iconSize }} />, tooltip: 'Resume' };
    } else {
      return { icon: <PlayIcon sx={{ fontSize: iconSize }} />, tooltip: 'Play' };
    }
  };

  const buttonState = getButtonState();


  if (!isSupported) {
    return (
      <Typography variant="caption" color="text.secondary">
        Voice narration requires a supported browser
      </Typography>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        background: 'transparent',
        width: subtitleMaxWidth,
        maxWidth: '100%',
      }}
    >
      <Stack spacing={1.5}>
        {/* Subtitles - Show current sentence */}
        {showSubtitles && (
          <Box
            sx={{
              maxWidth: subtitleMaxWidth,
              minHeight: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontWeight: 400,
                lineHeight: 1.6,
                textAlign: 'center',
                color: currentSubtitle ? 'text.primary' : 'text.secondary',
                fontStyle: currentSubtitle ? 'normal' : 'italic',
                transition: 'all 0.3s ease',
              }}
            >
              {currentSubtitle}
            </Typography>
          </Box>
        )}

        {/* Progress Bar */}
        <Box sx={{ width: '100%' }}>
          <Slider
            value={progress}
            disabled
            sx={{
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
              '& .MuiSlider-track': {
                height: 2,
                borderRadius: 1,
              },
              '& .MuiSlider-rail': {
                height: 2,
                borderRadius: 1,
              },
              '&.Mui-disabled': {
                color: theme.palette.primary.main,
              }
            }}
          />
        </Box>

        {/* Control Button */}
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ py: 0.5 }}>
          <Tooltip title={buttonState.tooltip}>
            <IconButton
              onClick={handlePlayPause}
              size={buttonSize as 'small' | 'medium' | 'large'}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              {buttonState.icon}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
