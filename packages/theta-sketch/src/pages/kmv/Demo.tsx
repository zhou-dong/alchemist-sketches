import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';

import * as Memory from '@mui/icons-material/Memory';
import * as PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import * as Functions from '@mui/icons-material/Functions';
import * as RestartAlt from '@mui/icons-material/RestartAlt';
import * as PlayArrow from '@mui/icons-material/PlayArrow';
import * as ArrowBack from '@mui/icons-material/ArrowBack';

import KmvVisualization from './KmvVisualization';

const MemoryIcon = Memory.default as unknown as React.ElementType;
const PlaylistAddIcon = PlaylistAdd.default as unknown as React.ElementType;
const FunctionsIcon = Functions.default as unknown as React.ElementType;
const RestartAltIcon = RestartAlt.default as unknown as React.ElementType;
const PlayArrowIcon = PlayArrow.default as unknown as React.ElementType;
const ArrowBackIcon = ArrowBack.default as unknown as React.ElementType;

function ImplementationCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const theme = useTheme();
  const border = alpha(theme.palette.primary.main, 0.22);
  const bg = alpha(theme.palette.primary.main, 0.04);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: border,
        background: bg,
        flex: 1,
        minWidth: { xs: '100%', md: 220 },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

type DemoView = 'setup' | 'demo';

export default function Demo({
  k,
  streamSize,
  setK,
  setStreamSize,
  defaultK,
  defaultStreamSize,
  defaultView = 'setup',
}: {
  k: number;
  streamSize: number;
  setK: (k: number) => void;
  setStreamSize: (streamSize: number) => void;
  defaultK: number;
  defaultStreamSize: number;
  defaultView?: DemoView;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [view, setView] = useState<DemoView>(defaultView);

  useEffect(() => {
    setView(defaultView);
  }, [defaultView]);

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

  const handleReset = () => {
    setK(defaultK);
    setStreamSize(defaultStreamSize);
    setErrors({});
  };

  const accuracyPct = useMemo(() => {
    if (k <= 0 || streamSize <= 0 || k >= streamSize) return null;
    return Math.round((1 - Math.sqrt(1 / k - 1 / streamSize)) * 100);
  }, [k, streamSize]);

  return (
    <>
      {view === 'setup' ? (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1100,
            width: 'min(980px, calc(100vw - 32px))',
            minWidth: 500,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              background: 'transparent',
              backdropFilter: 'blur(1px)',
              border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.15 : 0.1)}`,
              boxShadow: isDark
                ? `0 0 60px ${alpha(theme.palette.primary.main, 0.08)}`
                : `0 20px 60px ${alpha(theme.palette.common.black, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            {/* Subtle gradient accent at top */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                opacity: 0.8,
              }}
            />

            <Stack spacing={3}>
              {/* Header */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    letterSpacing: 3,
                    fontWeight: 500,
                    fontSize: '1.1rem',
                  }}
                >
                  KMV Demo Setup
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontWeight: 300 }}>
                Review the KMV implementation at a glance, then configure K and stream size to run the demo.
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <ImplementationCard
                  icon={<MemoryIcon sx={{ fontSize: 22 }} />}
                  title="Initialize"
                  description="Maintain a container holding the K smallest hash values (initially empty)."
                />
                <ImplementationCard
                  icon={<PlaylistAddIcon sx={{ fontSize: 22 }} />}
                  title="Process"
                  description="Hash each item to (0, 1). If it is smaller than the current K-th smallest, insert it and evict the largest."
                />
                <ImplementationCard
                  icon={<FunctionsIcon sx={{ fontSize: 22 }} />}
                  title="Estimate"
                  description="Let θ be the K-th smallest hash. Estimate N ≈ (K / θ) − 1."
                />
              </Stack>

              {/* Divider */}
              <Box
                sx={{
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.5)}, transparent)`,
                }}
              />

              {/* Config */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'text.secondary',
                    letterSpacing: 2,
                    display: 'block',
                    mb: 1,
                    fontWeight: 400,
                  }}
                >
                  Configure demo
                </Typography>

                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    type="number"
                    value={k}
                    onChange={(e) => setK(parseInt(e.target.value) || 0)}
                    error={!!errors.k}
                    helperText={errors.k || 'K: number of smallest hash values to keep'}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    value={streamSize}
                    onChange={(e) => setStreamSize(parseInt(e.target.value) || 0)}
                    error={!!errors.streamSize}
                    helperText={errors.streamSize || 'Stream size: number of elements to process'}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Accuracy info */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                      background: 'transparent',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="baseline">
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>
                        {accuracyPct === null ? '—' : `~${accuracyPct}%`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        accuracy
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {accuracyPct === null
                        ? 'Choose valid values (K < stream size) to see an estimate.'
                        : streamSize > k * 100
                          ? `Converges to ~${Math.round((1 - 1 / Math.sqrt(k)) * 100)}% when N >> K`
                          : 'Accuracy improves as K increases relative to N'}
                    </Typography>
                  </Box>

                  {Object.keys(errors).length > 0 && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      Please fix the configuration errors above before starting.
                    </Alert>
                  )}

                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ pt: 0.5 }}>
                    <Button
                      onClick={handleReset}
                      variant="text"
                      startIcon={<RestartAltIcon />}
                      sx={{
                        textTransform: 'none',
                        color: 'text.secondary',
                        '&:hover': { backgroundColor: alpha(theme.palette.divider, 0.1) },
                      }}
                    >
                      Reset
                    </Button>

                    <Button
                      onClick={() => {
                        if (validateConfig()) setView('demo');
                      }}
                      variant="contained"
                      endIcon={<PlayArrowIcon />}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}` },
                      }}
                    >
                      Start demo
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>
      ) : (
        <>
          {/* Demo view */}
          <KmvVisualization k={k} streamSize={streamSize} />

          {/* Back to config */}
          <Tooltip title="Back to config">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setView('setup')}
              sx={{
                position: 'fixed',
                top: 20,
                left: 20,
                zIndex: 1200,
                textTransform: 'none',
                background: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(8px)',
              }}
            >
              Configure
            </Button>
          </Tooltip>
        </>
      )}
    </>
  );
}

