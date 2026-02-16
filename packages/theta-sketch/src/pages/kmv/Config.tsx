import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { slideUp } from '@alchemist/shared';

import * as Memory from '@mui/icons-material/Memory';
import * as PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import * as Functions from '@mui/icons-material/Functions';
import * as RestartAlt from '@mui/icons-material/RestartAlt';

import NarrationPlayer from '../../components/NarrationPlayer';

const MemoryIcon = Memory.default as unknown as React.ElementType;
const PlaylistAddIcon = PlaylistAdd.default as unknown as React.ElementType;
const FunctionsIcon = Functions.default as unknown as React.ElementType;
const RestartAltIcon = RestartAlt.default as unknown as React.ElementType;

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


export default function Config({
    k,
    streamSize,
    setK,
    setStreamSize,
    defaultK,
    defaultStreamSize,
}: {
    k: number;
    streamSize: number;
    setK: (k: number) => void;
    setStreamSize: (streamSize: number) => void;
    defaultK: number;
    defaultStreamSize: number;
}) {
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

    const isConfigValidLive = useMemo(() => {
        if (k < 1 || k > 50) return false;
        if (streamSize < 10 || streamSize > 10000) return false;
        if (k >= streamSize) return false;
        return true;
    }, [k, streamSize]);

    const startDemo = () => {
        if (validateConfig()) {
            // Stop any ongoing narration from the setup screen before starting the demo.
            speechSynthesis.cancel();
        }
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

    const SETUP_NARRATION = useMemo(() => {
        const narration = `
Let's build a KMV sketch and demonstrate how it works.

First, a short review of how KMV is implemented: we keep only the K smallest hash values, update theta as the K-th smallest, and estimate N as K divided by theta, minus 1.

In each step, we hash an item to (0, 1) and place it on the number line. If it is smaller than theta, we add it to the sketch and remove the largest stored value.

If it is larger than theta, we ignore it.

Finally, the estimate updates as N-hat equals K divided by theta, minus 1.

Please choose and configure the K and stream size, then press Start demo to watch the sketch update on the number line.
`;
        return narration;
    }, []);

    return (
        <>
            <Container
                maxWidth="lg"
                sx={{
                    animation: `${slideUp} 0.8s ease-out 0.1s both`,
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    position: 'relative',

                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2.5,
                }}
            >
                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        position: 'relative',
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        background: 'transparent',
                        backdropFilter: 'blur(1px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1)}`,
                        boxShadow:
                            theme.palette.mode === 'dark'
                                ? `0 0 60px ${alpha(theme.palette.primary.main, 0.06)}`
                                : `0 16px 50px ${alpha(theme.palette.common.black, 0.06)}`,
                        overflow: 'hidden',
                    }}
                >
                    <Stack spacing={2.5}>
                        <Typography
                            variant="overline"
                            sx={{
                                color: 'text.secondary',
                                letterSpacing: 2,
                                display: 'block',
                                fontWeight: 400,
                            }}
                        >
                            KMV steps
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
                    </Stack>
                </Paper>

                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        position: 'relative',
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        background: 'transparent',
                        backdropFilter: 'blur(1px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1)}`,
                        boxShadow:
                            theme.palette.mode === 'dark'
                                ? `0 0 60px ${alpha(theme.palette.primary.main, 0.06)}`
                                : `0 16px 50px ${alpha(theme.palette.common.black, 0.06)}`,
                        overflow: 'hidden',
                    }}
                >
                    <Stack spacing={2.5}>
                        <Typography
                            variant="overline"
                            sx={{
                                color: 'text.secondary',
                                letterSpacing: 2,
                                display: 'block',
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
                                    onClick={startDemo}
                                    variant="contained"
                                    disabled={!isConfigValidLive}
                                >
                                    Start demo
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>

            {/* Setup narration (speaking + subtitles) */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: { xs: 20, sm: 28 },
                    left: 0,
                    right: 0,
                    zIndex: 1200,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    animation: `${slideUp} 1s ease-out 0.25s both`,
                }}
            >
                <Box sx={{ pointerEvents: 'auto' }}>
                    <NarrationPlayer
                        content={SETUP_NARRATION}
                        rate={1}
                        showSubtitles
                        subtitleMaxWidth={760}
                        onNext={startDemo}
                        nextTooltip={isConfigValidLive ? 'Start demo' : 'Fix config to start demo'}
                        nextDisabled={!isConfigValidLive}
                    />
                </Box>
            </Box>
        </>
    );
}
