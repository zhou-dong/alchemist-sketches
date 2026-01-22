import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import * as RestartAlt from '@mui/icons-material/RestartAlt';
import * as PlayArrow from '@mui/icons-material/PlayArrow';

const RestartAltIcon = RestartAlt.default as unknown as React.ElementType;
const PlayArrowIcon = PlayArrow.default as unknown as React.ElementType;

interface KmvConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  k: number;
  streamASize: number;
  streamBSize: number;
  setK: (k: number) => void;
  setStreamASize: (streamASize: number) => void;
  setStreamBSize: (streamBSize: number) => void;
  defaultK: number;
  defaultStreamASize: number;
  defaultStreamBSize: number;
}

export default function KmvConfigDialog({
  open,
  onClose,
  onStart,
  k,
  streamASize,
  streamBSize,
  setK,
  setStreamASize,
  setStreamBSize,
  defaultK,
  defaultStreamASize,
  defaultStreamBSize
}: KmvConfigDialogProps) {
  const theme = useTheme();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (k < 1 || k > 50) {
      newErrors.k = 'K must be between 1 and 50';
    }

    if (streamASize < 10 || streamASize > 200) {
      newErrors.streamASize = 'Stream size must be between 10 and 200';
    }

    if (streamBSize < 10 || streamBSize > 200) {
      newErrors.streamBSize = 'Stream size must be between 10 and 200';
    }

    if (k >= streamASize || k >= streamBSize) {
      newErrors.k = 'K must be less than stream size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStart = () => {
    if (validateConfig()) {
      onStart();
      onClose();
    }
  };

  const handleReset = () => {
    setK(defaultK);
    setStreamASize(defaultStreamASize);
    setStreamBSize(defaultStreamBSize);
    setErrors({});
  };

  if (!open) return null;

  const accuracyA = Math.round((1 - Math.sqrt(1 / k - 1 / streamASize)) * 100);
  const accuracyB = Math.round((1 - Math.sqrt(1 / k - 1 / streamBSize)) * 100);
  const convergenceAccuracy = Math.round((1 - 1 / Math.sqrt(k)) * 100);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          maxWidth: 520,
          width: '100%',
          p: 4,
          borderRadius: 3,
          background: 'transparent',
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: 'text.primary',
            letterSpacing: '-0.01em',
          }}
        >
          Configure Set Operations
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 4,
          }}
        >
          Adjust the parameters for two KMV sketches to explore union, intersection, and difference operations.
        </Typography>

        {/* Form Fields */}
        <Stack spacing={3}>
          <TextField
            fullWidth
            type="number"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value) || 0)}
            error={!!errors.k}
            helperText={errors.k || "K: Number of smallest hash values to keep"}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="number"
              value={streamASize}
              onChange={(e) => setStreamASize(parseInt(e.target.value) || 0)}
              error={!!errors.streamASize}
              helperText={errors.streamASize || "Stream A: Elements count"}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              type="number"
              value={streamBSize}
              onChange={(e) => setStreamBSize(parseInt(e.target.value) || 0)}
              error={!!errors.streamBSize}
              helperText={errors.streamBSize || "Stream B: Elements count"}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Stack>

          {/* Accuracy Info */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            }}
          >

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={2} alignItems="stretch">
                {/* Stream A */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    background: alpha(theme.palette.info.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.info.main,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Stream A
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography
                      sx={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        lineHeight: 1,
                      }}
                    >
                      ~{accuracyA}%
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      accuracy
                    </Typography>
                  </Stack>
                </Box>

                {/* Stream B */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    background: alpha(theme.palette.secondary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.secondary.main,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Stream B
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography
                      sx={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        lineHeight: 1,
                      }}
                    >
                      ~{accuracyB}%
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      accuracy
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                {(streamASize > k * 100 || streamBSize > k * 100)
                  ? `Converges to ~${convergenceAccuracy}% when N >> K`
                  : 'Accuracy improves as K increases relative to N'}
              </Typography>
            </Stack>
          </Box>

          {/* Validation Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Please fix the configuration errors above before starting.
            </Alert>
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button
            onClick={handleReset}
            variant="text"
            startIcon={<RestartAltIcon />}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.divider, 0.1),
              },
            }}
          >
            Reset
          </Button>

          <Button
            onClick={handleStart}
            variant="contained"
            endIcon={<PlayArrowIcon />}
            disabled={Object.keys(errors).length > 0}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Start Demo
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
