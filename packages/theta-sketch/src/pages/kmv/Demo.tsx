import React from 'react';
import { Box, Button, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';

import * as Memory from '@mui/icons-material/Memory';
import * as PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import * as Functions from '@mui/icons-material/Functions';

import KmvVisualization from './KmvVisualization';

const MemoryIcon = Memory.default as unknown as React.ElementType;
const PlaylistAddIcon = PlaylistAdd.default as unknown as React.ElementType;
const FunctionsIcon = Functions.default as unknown as React.ElementType;

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

export default function Demo({ k, streamSize }: { k: number; streamSize: number }) {
  const theme = useTheme();
  const [showImplementation, setShowImplementation] = React.useState(true);

  return (
    <>
      {/* Implementation overlay (moved from Recap) */}
      {showImplementation && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200, // above KMV timeline player (1000)
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: 'min(920px, calc(100vw - 32px))',
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.92),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              backdropFilter: 'blur(10px)',
              pointerEvents: 'auto',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 2,
                color: 'primary.main',
                display: 'block',
                mb: 0.75,
              }}
            >
              KMV: The Implementation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
              KMV stores <strong>only</strong> K hash values in memory, regardless of stream size.
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={() => setShowImplementation(false)}>
                Start demo
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Existing visualization */}
      <KmvVisualization k={k} streamSize={streamSize} />
    </>
  );
}

