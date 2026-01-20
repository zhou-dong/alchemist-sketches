import { Box, Stack, Typography, Fade, alpha, useTheme } from '@mui/material';

interface KmvIntroCardProps {
    visible: boolean;
}

export default function KmvIntroCard({ visible }: KmvIntroCardProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Fade in={visible} timeout={800}>
            <Box
                sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1100,
                    minWidth: 500,
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        p: { xs: 3, sm: 4 },
                        borderRadius: 2,
                        background: "transparent",
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
                            background: `linear-gradient(90deg, 
                                ${theme.palette.primary.main}, 
                                ${theme.palette.secondary.main})`,
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
                                    fontSize: '1.2rem',
                                }}
                            >
                                Algorithm Review
                            </Typography>
                        </Box>

                        {/* Core concept */}
                        <Box>
                            <Stack spacing={2.5}>
                                {/* Step 1: Store K smallest */}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: theme.palette.primary.main,
                                            mt: 1,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.8,
                                            fontWeight: 300,
                                        }}
                                    >
                                        Store only the <strong style={{ fontWeight: 500 }}>K smallest</strong> hash values in memory
                                    </Typography>
                                </Box>

                                {/* Step 2: When new hash arrives */}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: theme.palette.primary.main,
                                            mt: 1,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: 'text.secondary',
                                                lineHeight: 1.8,
                                                fontWeight: 300,
                                            }}
                                        >
                                            When a new hash arrives:
                                        </Typography>
                                        <Stack spacing={0.5} sx={{ mt: 1, pl: 2 }}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: 'text.secondary',
                                                    lineHeight: 1.6,
                                                    fontWeight: 300,
                                                }}
                                            >
                                                → Sketch not full? <strong style={{ fontWeight: 500, color: theme.palette.success.main }}>Add it</strong>
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: 'text.secondary',
                                                    lineHeight: 1.6,
                                                    fontWeight: 300,
                                                }}
                                            >
                                                → Smaller than θ? <strong style={{ fontWeight: 500, color: theme.palette.success.main }}>Add it</strong>, remove largest
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: 'text.secondary',
                                                    lineHeight: 1.6,
                                                    fontWeight: 300,
                                                }}
                                            >
                                                → Larger than θ? <strong style={{ fontWeight: 500, color: alpha(theme.palette.text.secondary, 0.8) }}>Ignore it</strong>
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>

                        {/* Divider */}
                        <Box
                            sx={{
                                height: 1,
                                background: `linear-gradient(90deg, 
                                    transparent, 
                                    ${alpha(theme.palette.divider, 0.5)}, 
                                    transparent)`,
                            }}
                        />

                        {/* Demo legend */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 300,
                                        letterSpacing: 1,
                                    }}
                                >
                                    EXPECTED
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'text.primary',
                                        fontFamily: 'monospace',
                                        mt: 0.5,
                                    }}
                                >
                                    N (actual)
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        background: `linear-gradient(to right,
                                            ${alpha(theme.palette.primary.main, 0.6)}, 
                                            ${alpha(theme.palette.secondary.main, 0.6)}
                                        )`,
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 300,
                                        letterSpacing: 1,
                                    }}
                                >
                                    ESTIMATED
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'text.primary',
                                        fontFamily: 'monospace',
                                        mt: 0.5,
                                    }}
                                >
                                    K/θ − 1
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
}
