import { Box, Button, Stack, Typography, alpha, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';

const confettiFall = keyframes`
  0% { transform: translateY(-12vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(115vh) rotate(540deg); opacity: 0; }
`;
const fireworkPop = keyframes`
  0% { transform: scale(0.2); opacity: 0; }
  20% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.35); opacity: 0; }
`;
const floatUp = keyframes`
  0% { transform: translateY(0px); opacity: 0.3; }
  50% { transform: translateY(-8px); opacity: 1; }
  100% { transform: translateY(0px); opacity: 0.35; }
`;
const popIn = keyframes`
  0% { scale: 0.92; opacity: 0; }
  100% { scale: 1; opacity: 1; }
`;
const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.35); }
  100% { box-shadow: 0 0 0 22px rgba(76, 175, 80, 0); }
`;
const sectionBorderPulse = keyframes`
  0%, 100% {
    border-color: rgba(76, 175, 80, 0.35);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.10);
  }
  50% {
    border-color: rgba(255, 183, 77, 0.65);
    box-shadow: 0 0 28px 2px rgba(255, 183, 77, 0.20);
  }
`;
const sectionBounce = keyframes`
  0%, 100% { scale: 1; }
  50% { scale: 1.02; }
`;
const sparkleTwinkle = keyframes`
  0%, 100% { transform: scale(0.6); opacity: 0.2; }
  50% { transform: scale(1.2); opacity: 1; }
`;

const FIREWORKS = [
    { top: '14%', left: '14%', color: '#ffb300', delayMs: 0 },
    { top: '20%', right: '12%', color: '#29b6f6', delayMs: 500 },
    { top: '52%', left: '8%', color: '#ab47bc', delayMs: 900 },
    { top: '58%', right: '10%', color: '#66bb6a', delayMs: 1300 },
];

const CONFETTI = [
    { left: '8%', color: '#ffb300', delayMs: 0, durationMs: 3200 },
    { left: '14%', color: '#29b6f6', delayMs: 650, durationMs: 3500 },
    { left: '20%', color: '#ab47bc', delayMs: 300, durationMs: 3600 },
    { left: '27%', color: '#66bb6a', delayMs: 900, durationMs: 3400 },
    { left: '35%', color: '#ef5350', delayMs: 400, durationMs: 3300 },
    { left: '42%', color: '#26c6da', delayMs: 1100, durationMs: 3600 },
    { left: '50%', color: '#ffa726', delayMs: 200, durationMs: 3200 },
    { left: '58%', color: '#7e57c2', delayMs: 800, durationMs: 3500 },
    { left: '65%', color: '#42a5f5', delayMs: 500, durationMs: 3400 },
    { left: '72%', color: '#ec407a', delayMs: 1200, durationMs: 3700 },
    { left: '79%', color: '#9ccc65', delayMs: 150, durationMs: 3300 },
    { left: '86%', color: '#26a69a', delayMs: 980, durationMs: 3450 },
    { left: '92%', color: '#ff7043', delayMs: 700, durationMs: 3600 },
];

export default function ThetaSketchSetOperationsFinish() {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                }}
            >
                {/* Fireworks and confetti background */}
                <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                    {FIREWORKS.map((f, idx) => (
                        <Box
                            key={`fw-${idx}`}
                            sx={{
                                position: 'absolute',
                                top: f.top,
                                left: f.left,
                                right: f.right,
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: alpha(f.color, 0.8),
                                animation: `${fireworkPop} 1.8s ease-out ${f.delayMs}ms infinite`,
                            }}
                        >
                            {[...Array(8)].map((_, i) => {
                                const angle = (i * 360) / 8;
                                const rad = (angle * Math.PI) / 180;
                                const x = Math.cos(rad) * 26;
                                const y = Math.sin(rad) * 26;
                                return (
                                    <Box
                                        key={i}
                                        sx={{
                                            position: 'absolute',
                                            left: `calc(50% + ${x}px)`,
                                            top: `calc(50% + ${y}px)`,
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            bgcolor: alpha(f.color, 0.95),
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    ))}

                    {CONFETTI.map((c, idx) => (
                        <Box
                            key={`confetti-${idx}`}
                            sx={{
                                position: 'absolute',
                                left: c.left,
                                top: '-10vh',
                                width: 8,
                                height: 18,
                                borderRadius: 1,
                                bgcolor: alpha(c.color, 0.85),
                                animation: `${confettiFall} ${c.durationMs}ms linear ${c.delayMs}ms infinite`,
                            }}
                        />
                    ))}
                </Box>

                <Stack
                    spacing={3}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: { xs: '92vw', md: 760 },
                        textAlign: 'center',
                        transform: { xs: 'translateY(-4vh)', md: 'translateY(-6vh)' },
                        p: 3,
                        borderRadius: 2,
                        // background: "transparent",
                        border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
                        background: alpha(theme.palette.success.main, 0.05),
                        backdropFilter: "blur(4px)",
                        animation: `${popIn} 520ms ease-out, ${sectionBorderPulse} 2.6s ease-in-out infinite, ${sectionBounce} 2.2s ease-in-out infinite`,
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -8,
                            right: 18,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.warning.main, 0.85),
                            animation: `${floatUp} 2.2s ease-in-out infinite`,
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 22,
                            left: 26,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.info.main, 0.85),
                            animation: `${floatUp} 1.9s ease-in-out 300ms infinite`,
                        }}
                    />
                    <Box
                        sx={{
                            position: 'relative',
                            alignSelf: 'center',
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            color: theme.palette.warning.main,
                            background: alpha(theme.palette.warning.main, 0.12),
                            animation: `${glowPulse} 1.8s ease-out infinite`,
                        }}
                    >
                        <EmojiEventsIcon sx={{ fontSize: 38 }} />
                        <AutoAwesomeIcon
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: -8,
                                color: alpha(theme.palette.warning.light, 0.95),
                                fontSize: 18,
                                animation: `${sparkleTwinkle} 1.6s ease-in-out infinite`,
                            }}
                        />
                        <AutoAwesomeIcon
                            sx={{
                                position: 'absolute',
                                bottom: 10,
                                left: -10,
                                color: alpha(theme.palette.info.light, 0.95),
                                fontSize: 16,
                                animation: `${sparkleTwinkle} 1.9s ease-in-out 250ms infinite`,
                            }}
                        />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        Congrats! You completed the Theta Sketch course.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        You completed the full journey from Order Statistics to KMV to Theta Sketch, and now understand how Theta Sketch works.
                    </Typography>

                    <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                        <Button variant="outlined" size="large" onClick={() => navigate('/theta-sketch')}>
                            Retake Course
                        </Button>
                        <Button variant="contained" size="large" onClick={() => navigate('/sketches')}>
                            Continue to Sketches
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </>
    );
}
