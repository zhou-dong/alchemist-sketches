import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  Stack,
  Tooltip,
  useTheme,
  Menu,
  MenuItem,
  ListItemText
} from '@mui/material';

import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartIcon from '@mui/icons-material/RestartAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SkipNextIcon from '@mui/icons-material/SkipNext';

interface TimelinePlayerProps {
  timeline: any; // GSAP Timeline
  showProgress?: boolean;
  showSpeed?: boolean;
  showMuteButton?: boolean;
  showNextButton?: boolean;
  enableNextButton?: boolean;
  nextButtonTooltip?: string;
  onNext?: () => void;
  size?: 'small' | 'medium' | 'large';
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  onMuteChange?: (isMuted: boolean) => void;
}

export default function TimelinePlayer({
  timeline,
  showSpeed = false,
  showMuteButton = false,
  showNextButton = false,
  enableNextButton = false,
  nextButtonTooltip = 'Next',
  onNext,
  size = 'large',
  onStart,
  onPause,
  onComplete,
  onMuteChange,
}: TimelinePlayerProps) {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speedMenuAnchor, setSpeedMenuAnchor] = useState<null | HTMLElement>(null);

  // Speed options
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];

  // Update progress when timeline changes
  useEffect(() => {
    if (!timeline) return;

    // Pause timeline initially to prevent auto-start
    timeline.pause();
    onPause();

    const updateProgress = () => {
      setProgress(timeline.progress() * 100);
      setIsPlaying(!timeline.paused());
    };

    timeline.eventCallback('onUpdate', updateProgress);
    timeline.eventCallback('onComplete', () => {
      setIsPlaying(false);
      onComplete();
    });

    return () => {
      timeline.eventCallback('onUpdate', null);
      timeline.eventCallback('onComplete', null);
    };
  }, [timeline]);

  const handlePlayPause = () => {
    if (isPlaying) {
      timeline.pause();
      onPause();
    } else {
      timeline.play();
      onStart();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    timeline.restart();
    setIsPlaying(true);
  };

  const handleNextPage = () => {
    if (!onNext) return;
    speechSynthesis.cancel();
    timeline.pause();
    onNext();
  };

  const handleProgressChange = (value: number) => {
    setProgress(value);
    timeline.progress(value / 100);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    timeline.timeScale(newSpeed);
    setSpeedMenuAnchor(null);
  };

  const handleSpeedMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSpeedMenuAnchor(event.currentTarget);
  };

  const handleSpeedMenuClose = () => {
    setSpeedMenuAnchor(null);
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onMuteChange?.(newMuted);
  };

  const buttonSize = size === 'small' ? 'small' : size === 'medium' ? 'medium' : 'large';

  const ProgressBar = () => {
    return (
      <Box sx={{ mt: -0.5, width: '100%' }}>
        <Slider
          value={progress}
          onChange={(_, value) => handleProgressChange(value as number)}
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
            }
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            margin: 0,
            padding: 0,
            lineHeight: 1,
            mt: -1,
            mb: 0.5,
            textAlign: 'center',
            display: 'block'
          }}
        >
          {Math.round(progress)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        background: 'transparent',
        color: theme.palette.text.primary,
        width: 600,
        maxWidth: '100%',
        mx: 'auto',
      }}
    >
      <Stack spacing={1.5}>
        <ProgressBar />
        {/* Control Buttons */}
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ py: 0.5 }}>
          <Tooltip title="Restart">
            <IconButton
              onClick={handleRestart}
              size={buttonSize}
              sx={{ color: theme.palette.text.secondary }}
            >
              <RestartIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
            <IconButton
              onClick={handlePlayPause}
              size={buttonSize}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              {isPlaying ? (
                <PauseIcon />
              ) : (
                <PlayIcon />
              )}
            </IconButton>
          </Tooltip>

          {showSpeed && (
            <>
              <Tooltip title="Speed Settings">
                <IconButton
                  onClick={handleSpeedMenuOpen}
                  size={buttonSize}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <SpeedIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={speedMenuAnchor}
                open={Boolean(speedMenuAnchor)}
                onClose={handleSpeedMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
              >
                {speedOptions.map((speedOption) => (
                  <MenuItem
                    key={speedOption}
                    onClick={() => handleSpeedChange(speedOption)}
                    selected={speed === speedOption}
                  >
                    <ListItemText>{speedOption}x</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {showMuteButton && (
            <Tooltip title={isMuted ? 'Enable narration' : 'Mute narration'}>
              <IconButton
                onClick={handleMuteToggle}
                size={buttonSize}
                sx={{ color: theme.palette.text.secondary }}
              >
                {isMuted ? (
                  <VolumeOffIcon />
                ) : (
                  <VolumeUpIcon />
                )}
              </IconButton>
            </Tooltip>
          )}

          {showNextButton && onNext && (
            <Tooltip title={nextButtonTooltip}>
              <IconButton
                onClick={handleNextPage}
                size={buttonSize}
                sx={{ color: theme.palette.text.secondary }}
                disabled={!enableNextButton}
              >
                <SkipNextIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

      </Stack>
    </Paper>
  );
} 
