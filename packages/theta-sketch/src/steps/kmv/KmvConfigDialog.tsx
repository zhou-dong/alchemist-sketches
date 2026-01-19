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

interface KmvConfigProps {
  onStart: () => void;
  k: number;
  streamSize: number;
  setK: (k: number) => void;
  setStreamSize: (streamSize: number) => void;
  defaultK: number;
  defaultStreamSize: number;
}

export default function KmvConfig({
  onStart,
  k,
  streamSize,
  setK,
  setStreamSize,
  defaultK,
  defaultStreamSize
}: KmvConfigProps) {
  const theme = useTheme();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (k < 1 || k > 50) {
      newErrors.k = 'K must be between 1 and 50';
    }

    if (streamSize < 10 || streamSize > 10000) {
      newErrors.streamSize = 'Stream size must be between 10 and 10,000';
    }

    if (k >= streamSize) {
      newErrors.k = 'K must be less than stream size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStart = () => {
    if (validateConfig()) {
      onStart();
    }
  };

  const handleReset = () => {
    setK(defaultK);
    setStreamSize(defaultStreamSize);
    setErrors({});
  };

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
          maxWidth: 480,
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
          Configure Demo
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 4,
          }}
        >
          Adjust the parameters to see how KMV algorithm performs with different settings.
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

          <TextField
            fullWidth
            type="number"
            value={streamSize}
            onChange={(e) => setStreamSize(parseInt(e.target.value) || 0)}
            error={!!errors.streamSize}
            helperText={errors.streamSize || "Stream Size: Number of elements to process"}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Accuracy Info */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              // background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 1)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative gradient circle */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            <Stack direction="row" spacing={2.5} alignItems="center">

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="baseline" spacing={0.5}>
                  <Typography
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'text.primary',
                      lineHeight: 1,
                    }}
                  >
                    ~{Math.round((1 - Math.sqrt(1 / k - 1 / streamSize)) * 100)}%
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    accuracy
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  {streamSize > k * 100
                    ? `Converges to ~${Math.round((1 - 1 / Math.sqrt(k)) * 100)}% when N >> K`
                    : 'Accuracy improves as K increases relative to N'}
                </Typography>
              </Box>
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
