import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, alpha, useTheme, Grid, Container, IconButton, Slider, Stack, Tooltip, Paper, Fade } from '@mui/material';
import { useSpeech } from '@alchemist/shared';
import { slideUp } from '@alchemist/shared';
import * as Tag from '@mui/icons-material/Tag';
import * as ScatterPlot from '@mui/icons-material/ScatterPlot';
import * as Memory from '@mui/icons-material/Memory';
import * as PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import * as Functions from '@mui/icons-material/Functions';
import * as SkipNext from '@mui/icons-material/SkipNext';
import * as Replay from '@mui/icons-material/Replay';
import * as PlayArrow from '@mui/icons-material/PlayArrow';
import * as Pause from '@mui/icons-material/Pause';

const SkipNextIcon = SkipNext.default as unknown as React.ElementType;
const ReplayIcon = Replay.default as unknown as React.ElementType;
const TagIcon = Tag.default as unknown as React.ElementType;
const ScatterPlotIcon = ScatterPlot.default as unknown as React.ElementType;
const MemoryIcon = Memory.default as unknown as React.ElementType;
const PlaylistAddIcon = PlaylistAdd.default as unknown as React.ElementType;
const FunctionsIcon = Functions.default as unknown as React.ElementType;
const PlayIcon = PlayArrow.default as unknown as React.ElementType;
const PauseIcon = Pause.default as unknown as React.ElementType;

// Define narration sections with their content
interface NarrationSection {
    id: string;
    text: string;
}

const NARRATION_SECTIONS: NarrationSection[] = [
    {
        id: 'insight',
        text: "Quick recap. Order statistics tells us among N uniformly distributed values between 0 and 1, the K-th smallest item has an expected value of θ = K divided by N plus 1. K-th smallest estimation flips that relationship: observe theta, the K-th smallest value, and estimate value N approximately equals K divided by theta, minus 1.",
    },
    {
        id: 'core-insight',
        text: "Core insight. To use this in a data stream, we only need to maintain the K smallest hashes.",
    },
    {
        id: 'requirements',
        text: 'Requirements for Practice. To apply this in big data scenarios, we need two conditions. First, a Uniform Hash Function: hash values must be uniformly distributed between 0 and 1, ensuring equal probability for any value. Second, Sufficient Sample Size: N must be large enough for hash values to be evenly distributed across the interval.',
    },
    {
        id: 'kmv',
        text: 'KMV Implementation. KMV, which stands for K Minimum Values, stores only K hash values in memory, regardless of stream size. The algorithm has three steps. Initialize: create a container for K smallest hash values, initially empty. Process: hash each element to a value between 0 and 1. If it is smaller than the K-th smallest, add it and remove the largest. Estimate: calculate N approximately equal to K divided by theta minus 1, using the K-th smallest value.',
    },
    {
        id: 'cta',
        text: 'When you are ready, click the next button to configure and start the demo.',
    },
];

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isActive?: boolean;
    accent?: 'primary' | 'secondary' | 'info';
}

function InfoCard({ icon, title, description, isActive = false, accent = 'primary' }: InfoCardProps) {
    const theme = useTheme();
    const accentColor = theme.palette[accent].main;

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(accentColor, isActive ? 0.5 : 0.15)}`,
                background: 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                boxShadow: isActive ? `0 4px 20px ${alpha(accentColor, 0.15)}` : 'none',
                '&:hover': {
                    background: alpha(accentColor, 0.08),
                    borderColor: alpha(accentColor, 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(accentColor, 0.1)}`,
                },
            }}
        >
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(accentColor, isActive ? 0.2 : 0.1),
                    color: accentColor,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        mb: 0.25,
                        color: 'text.primary',
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        lineHeight: 1.5,
                        color: 'text.secondary',
                    }}
                >
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}

interface StepSectionProps {
    title: string;
    children: React.ReactNode;
    isLast?: boolean;
    isActive?: boolean;
}

function StepSection({ title, children, isLast = false, isActive = false }: StepSectionProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2.5,
                transition: 'all 0.3s ease',
                opacity: isActive ? 1 : 0.6,
                transform: isActive ? 'scale(1)' : 'scale(0.98)',
            }}
        >
            {/* Vertical line indicator */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    pt: 0.5,
                }}
            >
                <Box
                    sx={{
                        width: 3,
                        height: '100%',
                        minHeight: 60,
                        borderRadius: 1.5,
                        background: isActive
                            ? `linear-gradient(to bottom, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.3)} 100%)`
                            : alpha(theme.palette.primary.main, 0.15),
                        boxShadow: isActive ? `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                        transition: 'all 0.3s ease',
                    }}
                />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, pb: isLast ? 0 : 0, mb: isLast ? 0 : 0 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 1.5,
                        color: isActive ? 'text.primary' : 'text.secondary',
                        letterSpacing: '0.01em',
                        transition: 'all 0.3s ease',
                    }}
                >
                    {title}
                </Typography>
                {children}
            </Box>
        </Box>
    );
}

// Find the best available voice, preferring Google voices
// Section-based narration player
function useSectionedNarration(sections: NarrationSection[], rate: number = 1.0) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
    const [progress, setProgress] = useState(0);
    const { getCurrentVoice } = useSpeech({ rate });
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopProgressTracking = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const speakSection = useCallback((index: number) => {
        if (index >= sections.length) {
            // All sections complete
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentSectionIndex(-1);
            setProgress(100);
            stopProgressTracking();
            return;
        }

        const section = sections[index];
        setCurrentSectionIndex(index);

        const utterance = new SpeechSynthesisUtterance(section.text);
        utterance.rate = rate;

        // Use getCurrentVoice() to always get the latest voice (safe for callbacks)
        const voice = getCurrentVoice();
        if (voice) {
            utterance.voice = voice;
        }

        utteranceRef.current = utterance;

        // Calculate progress for this section
        const sectionProgress = (index / sections.length) * 100;
        const sectionWeight = 100 / sections.length;

        utterance.onstart = () => {
            setProgress(sectionProgress);
            // Start progress tracking within section
            const words = section.text.split(/\s+/).length;
            const estimatedDuration = (words / 2.5) * 1000 / rate;
            const startTime = Date.now();

            stopProgressTracking();
            progressIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const sectionProgressPercent = Math.min(elapsed / estimatedDuration, 1);
                setProgress(sectionProgress + sectionProgressPercent * sectionWeight);
            }, 100);
        };

        utterance.onend = () => {
            stopProgressTracking();
            // Move to next section
            speakSection(index + 1);
        };

        utterance.onerror = () => {
            stopProgressTracking();
            setIsPlaying(false);
            setIsPaused(false);
        };

        speechSynthesis.speak(utterance);
    }, [sections, rate, getCurrentVoice, stopProgressTracking]);

    const play = useCallback(() => {
        speechSynthesis.cancel();
        setIsPlaying(true);
        setIsPaused(false);
        setProgress(0);
        speakSection(0);
    }, [speakSection]);

    const pause = useCallback(() => {
        speechSynthesis.pause();
        setIsPaused(true);
        stopProgressTracking();
    }, [stopProgressTracking]);

    const resume = useCallback(() => {
        speechSynthesis.resume();
        setIsPaused(false);
    }, []);

    const stop = useCallback(() => {
        speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSectionIndex(-1);
        setProgress(0);
        stopProgressTracking();
    }, [stopProgressTracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            speechSynthesis.cancel();
            stopProgressTracking();
        };
    }, [stopProgressTracking]);

    return {
        isPlaying,
        isPaused,
        currentSectionIndex,
        currentSectionId: currentSectionIndex >= 0 ? sections[currentSectionIndex]?.id : null,
        progress,
        play,
        pause,
        resume,
        stop,
    };
}

export default function KseToKmv({ onClose }: { onClose: () => void }) {
    const theme = useTheme();
    const {
        isPlaying,
        isPaused,
        currentSectionIndex,
        currentSectionId,
        progress,
        play,
        pause,
        resume,
        stop,
    } = useSectionedNarration(NARRATION_SECTIONS, 1.0);

    // Track the highest section index that has been revealed
    const [revealedSectionIndex, setRevealedSectionIndex] = useState(-1);

    // Update revealed sections when current section changes
    useEffect(() => {
        if (currentSectionIndex > revealedSectionIndex) {
            setRevealedSectionIndex(currentSectionIndex);
        }
    }, [currentSectionIndex, revealedSectionIndex]);

    const handlePlayPause = () => {
        if (!isPlaying) {
            play();
        } else if (isPaused) {
            resume();
        } else {
            pause();
        }
    };

    const handleClose = () => {
        stop();
        onClose();
    };

    const handleRestart = () => {
        stop();
        setRevealedSectionIndex(-1);
        // Small delay to ensure state is reset before playing
        setTimeout(() => {
            play();
        }, 50);
    };

    // Helper to check if a section should be visible
    const isSectionVisible = (sectionIndex: number) => sectionIndex <= revealedSectionIndex;

    // Helper to check if a section is the current active one
    const isSectionActive = (sectionId: string) => currentSectionId === sectionId;

    return (
        <Container
            maxWidth="xl"
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: 2,
                gap: 1,
            }}
        >
            {/* Section 1: The Core Insight */}
            <Fade in={isSectionVisible(0)} timeout={600}>
                <Box>
                    <StepSection
                        title="Quick Recap"
                        isActive={isSectionActive('insight')}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                lineHeight: 1.8,
                                color: 'text.secondary',
                            }}
                        >
                            <strong> Order statistics</strong> tells us among N uniformly distributed values between 0 and 1, the K-th smallest has an expected value of <strong>θ = K / (N + 1)</strong>. <br />
                            <strong> K-th smallest estimation</strong> flips that relationship: observe <strong>θ</strong>, the K-th smallest value,
                            and estimate the total count <strong>N ≈ (K / θ) − 1</strong>.
                        </Typography>
                    </StepSection>
                </Box>
            </Fade>

            {/* Section 2: Core Insight */}
            <Fade in={isSectionVisible(1)} timeout={600}>
                <Box>
                    <StepSection
                        title="Core Insight"
                        isActive={isSectionActive('core-insight')}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                lineHeight: 1.8,
                                color: 'text.secondary',
                            }}
                        >
                            To use this in a data stream, we only need to maintain the K smallest hashes.
                        </Typography>
                    </StepSection>
                </Box>
            </Fade>

            {/* Section 2: Requirements */}
            <Fade in={isSectionVisible(1)} timeout={600}>
                <Box>
                    <StepSection
                        title="Requirements for Practice"
                        isActive={isSectionActive('requirements')}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: 'text.secondary',
                                mb: 2,
                            }}
                        >
                            To apply this in big data scenarios, we need these conditions:
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoCard
                                    icon={<TagIcon sx={{ fontSize: 22 }} />}
                                    title="Uniform Hash Function"
                                    description="Hash values uniformly distributed in (0,1), ensuring equal probability for any value."
                                    isActive={isSectionActive('requirements')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoCard
                                    icon={<ScatterPlotIcon sx={{ fontSize: 22 }} />}
                                    title="Sufficient Sample Size"
                                    description="N large enough for hash values to be evenly distributed across the interval."
                                    isActive={isSectionActive('requirements')}
                                />
                            </Grid>
                        </Grid>
                    </StepSection>
                </Box>
            </Fade>

            {/* Section 3: KMV Algorithm */}
            <Fade in={isSectionVisible(2)} timeout={600}>
                <Box>
                    <StepSection
                        title="KMV: The Implementation"
                        isLast
                        isActive={isSectionActive('kmv')}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: 'text.secondary',
                                mb: 2,
                            }}
                        >
                            KMV stores <strong>only</strong> K hash values in memory, regardless of stream size:
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <InfoCard
                                    icon={<MemoryIcon sx={{ fontSize: 22 }} />}
                                    title="Initialize"
                                    description="Container for K smallest hash values (initially empty)."
                                    isActive={isSectionActive('kmv')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <InfoCard
                                    icon={<PlaylistAddIcon sx={{ fontSize: 22 }} />}
                                    title="Process"
                                    description="Hash to (0,1). If smaller than K-th, add and remove largest."
                                    isActive={isSectionActive('kmv')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <InfoCard
                                    icon={<FunctionsIcon sx={{ fontSize: 22 }} />}
                                    title="Estimate"
                                    description="Calculate N ≈ (K / θ) − 1 using K-th smallest value."
                                    isActive={isSectionActive('kmv')}
                                />
                            </Grid>
                        </Grid>
                    </StepSection>
                </Box>
            </Fade>

            {/* Narration Player */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: window.innerHeight / 12,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 100,
                    pointerEvents: 'none',
                    animation: `${slideUp} 1s ease-out 0.25s both`,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'transparent',
                        minWidth: 600,
                        pointerEvents: 'auto',
                        zIndex: 100,
                    }}
                >
                    <Stack spacing={1.5}>
                        {/* Progress Bar */}
                        <Slider
                            value={progress}
                            disabled
                            sx={{
                                '& .MuiSlider-thumb': { width: 12, height: 12 },
                                '& .MuiSlider-track': { height: 2, borderRadius: 1 },
                                '& .MuiSlider-rail': { height: 2, borderRadius: 1 },
                                '&.Mui-disabled': { color: theme.palette.primary.main },
                            }}
                        />

                        {/* Restart, Play/Pause and Next Buttons */}
                        <Stack direction="row" justifyContent="center" spacing={2}>
                            <Tooltip title="Restart">
                                <IconButton
                                    onClick={handleRestart}
                                    size="large"
                                >
                                    <ReplayIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={!isPlaying ? 'Play' : isPaused ? 'Resume' : 'Pause'}>
                                <IconButton
                                    onClick={handlePlayPause}
                                    size="large"
                                    sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                                    }}
                                >
                                    {!isPlaying || isPaused ? <PlayIcon /> : <PauseIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Next: Configure Demo">
                                <IconButton
                                    onClick={handleClose}
                                    size="large"
                                >
                                    <SkipNextIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
}
