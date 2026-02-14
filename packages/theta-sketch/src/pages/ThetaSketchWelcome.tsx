import { Box, Typography, Button } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { slideUp } from '@alchemist/shared';
import EastIcon from '@mui/icons-material/East';
import NarrationPlayer from '../components/NarrationPlayer';
import StepProgressIndicator from '../components/StepProgressIndicator';
import { useThetaSketchProgress } from '../contexts/ThetaSketchProgressContext';

// Narration content
const NARRATION_CONTENT = `
Welcome to the math behind Theta Sketch. We'll build up from the statistical idea all the way to a sketch that supports set operations cleanly.

We'll build up step by step: Order statistics, k-th smallest estimation, the KMV algorithm, set operations (and the KMV limit), then Theta sketch with explicit theta, and finally how Theta sketch solves set operations.

Don't be intimidated by the math, the ideas are surprisingly straightforward, requiring only elementary math knowledge. When you're ready, click begin to start the journey.
`.trim();

export const ThetaSketchWelcome = () => {
    const navigate = useNavigate();
    const { completeStep } = useThetaSketchProgress();

    const handleDiveIn = useCallback(() => {
        speechSynthesis.cancel();
        completeStep('introduction');
        navigate('/theta-sketch/order-statistics');
    }, [completeStep, navigate]);

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            <StepProgressIndicator currentStepId="introduction" />

            {/* Main Content - Slightly above center for better visual balance */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 4,
                    pb: 25, // Push content upward
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                {/* Title with Theta Icon */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                        animation: `${slideUp} 1s ease-out 0.3s both`,
                    }}
                >
                    {/* Theta Icon */}
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            boxShadow: (theme) => `0 4px 20px ${theme.palette.primary.main}40`,
                        }}
                    >
                        <Typography
                            component="span"
                            sx={{
                                fontSize: '1.8rem',
                                fontStyle: 'italic',
                                fontWeight: 400,
                                color: 'primary.contrastText',
                            }}
                        >
                            θ
                        </Typography>
                    </Box>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', md: '2.8rem' },
                            fontWeight: 700,
                            textTransform: 'uppercase',
                        }}
                    >
                        Theta Sketch
                    </Typography>
                </Box>

                {/* Subtitle */}
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        fontWeight: 400,
                        textAlign: 'center',
                        lineHeight: 1.8,
                        mb: 10,
                        animation: `${slideUp} 1s ease-out 0.5s both`,
                    }}
                >
                    A journey through Order Statistics, K-th Smallest Estimation, KMV, and beyond.
                </Typography>

                {/* Controls with built-in subtitles */}
                <Box sx={{ animation: `${slideUp} 1s ease-out 0.7s both` }}>
                    {/* Begin Button */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleDiveIn}
                        endIcon={<EastIcon />}
                    >
                        Begin
                    </Button>
                </Box>
            </Box>

            <Box sx={{
                position: 'fixed',
                bottom: window.innerHeight / 12,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: `${slideUp} 1s ease-out 1s both`,
            }}>
                <NarrationPlayer
                    content={NARRATION_CONTENT}
                    rate={1}
                    showSubtitles
                    subtitleMaxWidth={600}
                />
            </Box>
        </Box>
    );
};

export default ThetaSketchWelcome;
