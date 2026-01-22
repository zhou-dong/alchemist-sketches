import { Box, Stack, Typography, Fade, alpha, useTheme } from '@mui/material';

interface SetOperationsIntroCardProps {
    visible: boolean;
}

export default function SetOperationsIntroCard({ visible }: SetOperationsIntroCardProps) {
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
                    minWidth: 520,
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
                                Set Operations on KMV Sketches
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    mt: 1,
                                    fontWeight: 300,
                                }}
                            >
                                Three fundamental operations using probabilistic hash values
                            </Typography>
                        </Box>

                        {/* Operations */}
                        <Stack spacing={2.5}>
                            {/* Union */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: alpha(theme.palette.info.main, 0.15),
                                        color: theme.palette.info.main,
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    ∪
                                </Box>
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'text.primary',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Union (A ∪ B)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.6,
                                            fontWeight: 300,
                                        }}
                                    >
                                        Combine both sketches, keep K smallest hash values
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Intersection */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: alpha(theme.palette.success.main, 0.15),
                                        color: theme.palette.success.main,
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    ∩
                                </Box>
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'text.primary',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Intersection (A ∩ B)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.6,
                                            fontWeight: 300,
                                        }}
                                    >
                                        Find elements present in both sets below min(θ)
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Difference */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: alpha(theme.palette.warning.main, 0.15),
                                        color: theme.palette.warning.main,
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    ∖
                                </Box>
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'text.primary',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Difference (A − B)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.6,
                                            fontWeight: 300,
                                        }}
                                    >
                                        Elements in A but not in B, below min(θ)
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>

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

                        {/* Legend */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        background: '#4CAF50',
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', fontWeight: 300 }}
                                >
                                    Sketch A
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        background: '#2196F3',
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', fontWeight: 300 }}
                                >
                                    Sketch B
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        background: '#FFEB3B',
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', fontWeight: 300 }}
                                >
                                    Result
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
}
