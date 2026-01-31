import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Stack, Container, alpha, useTheme, IconButton, Tooltip, Fade, Slider, Button, keyframes } from '@mui/material';
import { useSpeech } from '@alchemist/shared';
import { useNavigate } from 'react-router-dom';
import { useThetaSketchProgress } from '../contexts/ThetaSketchProgressContext';
import StepProgressIndicator from '../components/StepProgressIndicator';
import { slideUp } from '@alchemist/shared';
import * as PlayArrow from '@mui/icons-material/PlayArrow';
import * as Pause from '@mui/icons-material/Pause';
import * as EmojiEvents from '@mui/icons-material/EmojiEvents';
import * as Celebration from '@mui/icons-material/Celebration';
import * as CloseOutlined from '@mui/icons-material/CloseOutlined';
import * as RestartAlt from '@mui/icons-material/RestartAlt';
import * as SkipNext from '@mui/icons-material/SkipNext';
const CloseOutlinedIcon = CloseOutlined.default as unknown as React.ElementType;
const PlayIcon = PlayArrow.default as unknown as React.ElementType;
const PauseIcon = Pause.default as unknown as React.ElementType;
const TrophyIcon = EmojiEvents.default as unknown as React.ElementType;
const CelebrationIcon = Celebration.default as unknown as React.ElementType;
const RestartIcon = RestartAlt.default as unknown as React.ElementType;
const SkipNextIcon = SkipNext.default as unknown as React.ElementType;

// Confetti animation keyframes
const confettiFall = keyframes`
    0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
`;

const pulse = keyframes`
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
`;

const shimmer = keyframes`
    0% {
        background-position: -200% center;
    }
    100% {
        background-position: 200% center;
    }
`;

// Define narration sections
interface NarrationSection {
    id: string;
    text: string;
}

const NARRATION_SECTIONS: NarrationSection[] = [
    {
        id: 'insight',
        text: 'The Key Insight. KMV\'s challenge is that theta is implicit, derived from the K-th smallest value, and the sketch always stores exactly K values. Set operations require recalculating which K values to keep. Theta Sketch solves this by explicitly storing theta as a normalized value between 0 and 1, and keeping all values below it. This makes set operations straightforward: just use the minimum theta and filter both sets accordingly.',
    },
    {
        id: 'comparison',
        text: 'Comparing KMV and Theta Sketch. In KMV, the threshold is implicit, equal to the K-th smallest hash. It stores exactly K values in a priority queue. The estimate is N approximately equals K minus 1, divided by theta. And set operations require theta to be recalculated after merging. In Theta Sketch, the threshold is stored explicitly as a value between 0 and 1. It stores all values less than theta in a hash set. The estimate is N approximately equals the retained count divided by theta. And set operations simply use the minimum theta directly.',
    },
    {
        id: 'operations',
        text: 'Set Operations. The normalized threshold enables powerful set operations between sketches, even if they were created with different K values. For Union, merge both hash sets, filter by minimum theta, and estimate equals the merged count divided by theta. For Intersection, keep only hashes appearing in both A and B, and estimate equals the common count divided by theta. For Difference, keep A\'s hashes that don\'t appear in B, and estimate equals the difference count divided by theta.',
    },
    {
        id: 'adaptive',
        text: 'Adaptive Threshold. Theta Sketch adapts its threshold dynamically. Step 1: Start with theta equals 1.0, initially accepting all hash values. Step 2: When the count exceeds nominal K, which is the target number of values similar to K in KMV, set theta to the K-th smallest normalized hash value. Note that nominal K is a trigger point, not a strict limit like in KMV. Step 3: Remove all values greater than or equal to theta, keeping only values strictly less than the new threshold. After removal, the retained count may be less than K. Step 4: Continue processing, new values are only added if they are less than theta.',
    },
    {
        id: 'summary',
        text: 'Summary. Theta Sketch generalizes KMV by explicitly storing theta and keeping all values below it, rather than exactly K values. This simple change, from implicit to explicit threshold, enables clean set operations across sketches with different configurations. It\'s the preferred choice for cardinality estimation in distributed systems, used by Apache Druid, Imply, and others.',
    },
];

// Section-based narration hook
function useSectionedNarration(
    sections: NarrationSection[],
    rate: number = 1.0,
    onComplete?: () => void
) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
    const [progress, setProgress] = useState(0);
    const { getCurrentVoice } = useSpeech({ rate });
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onCompleteRef = useRef(onComplete);

    // Keep the callback ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    const stopProgressTracking = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const speakSection = useCallback((index: number) => {
        if (index >= sections.length) {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentSectionIndex(-1);
            setProgress(100);
            stopProgressTracking();
            // Call onComplete when all sections are done
            onCompleteRef.current?.();
            return;
        }

        const section = sections[index];
        setCurrentSectionIndex(index);

        const utterance = new SpeechSynthesisUtterance(section.text);
        utterance.rate = rate;

        const voice = getCurrentVoice();
        if (voice) {
            utterance.voice = voice;
        }

        utteranceRef.current = utterance;

        const sectionProgress = (index / sections.length) * 100;
        const sectionWeight = 100 / sections.length;

        utterance.onstart = () => {
            setProgress(sectionProgress);
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
        if (isPaused) {
            speechSynthesis.resume();
            setIsPaused(false);
            setIsPlaying(true);
        } else {
            speechSynthesis.cancel();
            setIsPlaying(true);
            setIsPaused(false);
            speakSection(0);
        }
    }, [isPaused, speakSection]);

    const pause = useCallback(() => {
        speechSynthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
    }, []);

    const stop = useCallback(() => {
        speechSynthesis.cancel();
        stopProgressTracking();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSectionIndex(-1);
        setProgress(0);
    }, [stopProgressTracking]);

    const restart = useCallback(() => {
        speechSynthesis.cancel();
        stopProgressTracking();
        setProgress(0);
        setCurrentSectionIndex(-1);
        setIsPlaying(true);
        setIsPaused(false);
        setTimeout(() => speakSection(0), 100);
    }, [speakSection, stopProgressTracking]);

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
        progress,
        currentSectionId: currentSectionIndex >= 0 ? sections[currentSectionIndex]?.id : null,
        play,
        pause,
        stop,
        restart,
    };
}

export default function ThetaSketchOverview() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { completeStep } = useThetaSketchProgress();
    const [showCelebration, setShowCelebration] = useState(false);

    // Mark step as complete when narration finishes
    const handleNarrationComplete = useCallback(() => {
        completeStep('theta-sketch');
        setShowCelebration(true);
    }, [completeStep]);

    const handleCloseCelebration = () => {
        setShowCelebration(false);
    };

    const handleExploreMore = () => {
        setShowCelebration(false);
        navigate('/sketches');
    };

    const {
        isPlaying,
        isPaused,
        currentSectionIndex,
        progress,
        play,
        pause,
        restart,
        stop,
    } = useSectionedNarration(NARRATION_SECTIONS, 1.0, handleNarrationComplete);

    // Skip to end - complete the narration immediately
    const handleSkipToEnd = useCallback(() => {
        stop();
        setRevealedSectionIndex(NARRATION_SECTIONS.length - 1);
        completeStep('theta-sketch');
        setShowCelebration(true);
    }, [stop, completeStep]);

    // Restart narration
    const handleRestart = useCallback(() => {
        setRevealedSectionIndex(-1);
        restart();
    }, [restart]);

    // Track which sections have been revealed
    const [revealedSectionIndex, setRevealedSectionIndex] = useState(-1);

    // Reveal sections as narration progresses
    useEffect(() => {
        if (currentSectionIndex > revealedSectionIndex) {
            setRevealedSectionIndex(currentSectionIndex);
        }
    }, [currentSectionIndex, revealedSectionIndex]);

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    // Check if a section should be visible
    const isSectionVisible = (sectionId: string) => {
        const sectionIndex = NARRATION_SECTIONS.findIndex(s => s.id === sectionId);
        return sectionIndex <= revealedSectionIndex;
    };

    return (
        <>
            {/* Step Progress Indicator */}
            <StepProgressIndicator currentStepId="theta-sketch" />

            {/* Celebration Overlay */}
            <Fade in={showCelebration} timeout={500}>
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 2000,
                        display: showCelebration ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: alpha(theme.palette.background.default, 0.95),
                        backdropFilter: 'blur(1px)',
                    }}
                >
                    {/* Confetti particles */}
                    {showCelebration && [...Array(50)].map((_, i) => (
                        <Box
                            key={i}
                            sx={{
                                position: 'fixed',
                                top: 0,
                                left: `${Math.random() * 100}%`,
                                width: 10,
                                height: 10,
                                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                                background: [
                                    theme.palette.primary.main,
                                    theme.palette.secondary.main,
                                    theme.palette.success.main,
                                    theme.palette.warning.main,
                                    '#FFD700',
                                    '#FF6B6B',
                                ][Math.floor(Math.random() * 6)],
                                animation: `${confettiFall} ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
                                opacity: 0.8,
                            }}
                        />
                    ))}

                    {/* Celebration Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            borderRadius: 4,
                            textAlign: 'center',
                            maxWidth: 600,
                            background: alpha(theme.palette.background.paper, 0.9),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            animation: `${pulse} 2s ease-in-out infinite`,
                        }}
                    >
                        {/* Trophy Icon */}
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                mx: 'auto',
                                mb: 3,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}
                        >
                            <TrophyIcon sx={{ fontSize: 50, color: 'white' }} />
                        </Box>

                        {/* Congratulations Text */}
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Congratulations!
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 400,
                                mb: 1,
                            }}
                        >
                            You've completed the Theta Sketch journey!
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                mb: 4,
                                lineHeight: 1.8,
                            }}
                        >
                            You now understand Order Statistics, K-th Smallest Estimation,
                            KMV, Set Operations, and Theta Sketch. Well done!
                        </Typography>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<CloseOutlinedIcon />}
                                onClick={handleCloseCelebration}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleExploreMore}
                                startIcon={<CelebrationIcon />}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundSize: '200% auto',
                                    animation: `${shimmer} 3s linear infinite`,
                                    '&:hover': {
                                        background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                    },
                                }}
                            >
                                Explore More Sketches
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            </Fade>

            <Container maxWidth="lg" sx={{ marginTop: '60px', marginBottom: '300px' }}>
                <Stack spacing={5}>
                    {/* Header - Always visible */}
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                color: 'primary.main',
                                mt: 1,
                            }}
                        >
                            Theta Sketch: KMV Evolution
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                mt: 2,
                                mx: 'auto',
                                lineHeight: 1.8,
                                fontWeight: 300,
                            }}
                        >
                            An evolution of KMV that enables efficient set operations
                            by using a normalized threshold instead of a fixed K value.
                        </Typography>
                    </Box>

                    {/* Key Insight */}
                    <Fade in={isSectionVisible('insight')} timeout={600}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                background: "transparent",
                                borderColor: alpha(theme.palette.divider, 0.8),
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    mb: 1,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    fontSize: '1rem',
                                }}
                            >
                                The Key Insight
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                KMV's challenge: θ is implicit (the K-th smallest value) and the sketch always stores
                                exactly K values. Set operations require recalculating which K values to keep.
                                <br /><br />
                                <strong>Theta Sketch solves this</strong> by explicitly storing θ as a normalized value ∈ [0, 1)
                                and keeping all values below it. This makes set operations straightforward: just use
                                min(θ_A, θ_B) and filter both sets accordingly.
                            </Typography>
                        </Paper>
                    </Fade>

                    {/* Single vs Multiple Sketches */}
                    <Fade in={isSectionVisible('insight')} timeout={600}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                mt: 3,
                                borderColor: alpha(theme.palette.secondary.main, 0.3),
                                background: alpha(theme.palette.secondary.main, 0.02),
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: 'secondary.main',
                                    fontWeight: 600,
                                    mb: 2,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    fontSize: '1rem',
                                }}
                            >
                                Single Sketch vs. Multiple Sketches
                            </Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                                        For a Single Sketch:
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                        KMV and Theta Sketch are <strong>functionally similar</strong>. Both estimate cardinality using the same mathematical principle. 
                                        The main difference is implementation: KMV always stores exactly K values, while Theta Sketch stores all values &lt; θ (which may be fewer or more than K).
                                        For estimation purposes on a single sketch, they produce similar results.
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                                        For Multiple Sketches (Cloud Merge/Set Operations):
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                        This is where the <strong>major difference</strong> appears:
                                    </Typography>
                                    <Box component="ul" sx={{ mt: 1, pl: 3, color: 'text.secondary' }}>
                                        <li>
                                            <strong>KMV:</strong> Requires recalculating which K values to keep after merging. 
                                            You must combine all values, sort them, and select the K smallest.
                                        </li>
                                        <li>
                                            <strong>Theta Sketch:</strong> Simply use <code style={{ backgroundColor: alpha(theme.palette.divider, 0.2), padding: '2px 4px', borderRadius: '2px' }}>min(θ_A, θ_B)</code> and filter both sets. 
                                            No recalculation needed—much more efficient!
                                        </li>
                                    </Box>
                                </Box>
                                <Box sx={{ 
                                    mt: 1, 
                                    p: 1.5, 
                                    borderRadius: 1, 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    borderLeft: `3px solid ${theme.palette.primary.main}`
                                }}>
                                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
                                        <strong>Key Takeaway:</strong> For single sketches, they're essentially the same. 
                                        The real advantage of Theta Sketch shines when merging multiple sketches in distributed systems.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Fade>

                    {/* KMV vs Theta Sketch Comparison */}
                    <Fade in={isSectionVisible('comparison')} timeout={600}>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 500,
                                    color: 'text.primary',
                                    mb: 3,
                                }}
                            >
                                KMV → Theta Sketch Evolution
                            </Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                {/* KMV */}
                                <Box sx={{ flex: 1 }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            height: '100%',
                                            borderColor: alpha(theme.palette.divider, 0.8),
                                            background: "transparent",
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight="600"
                                            gutterBottom
                                            sx={{ color: 'text.primary' }}
                                        >
                                            KMV
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
                                        >
                                            K Minimum Values
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            <ComparisonItem
                                                label="Threshold"
                                                value="θ = K-th smallest hash (implicit)"
                                            />
                                            <ComparisonItem
                                                label="Storage"
                                                value="Exactly K values (priority queue)"
                                            />
                                            <ComparisonItem
                                                label="Estimate"
                                                value="N ≈ K / θ - 1"
                                            />
                                            <ComparisonItem
                                                label="Set Operations"
                                                value="θ recalculated after merge"
                                            />
                                        </Stack>
                                    </Paper>
                                </Box>

                                {/* Arrow */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'text.secondary',
                                    }}
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 300 }}>→</Typography>
                                </Box>

                                {/* Theta Sketch */}
                                <Box sx={{ flex: 1 }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            height: '100%',
                                            borderColor: alpha(theme.palette.divider, 0.8),
                                            background: "transparent",
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight="600"
                                            gutterBottom
                                            sx={{
                                                color: 'primary.main',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            Theta Sketch
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
                                        >
                                            Threshold-based Evolution
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            <ComparisonItem
                                                label="Threshold"
                                                value="θ ∈ [0, 1) stored explicitly"
                                                isPositive
                                            />
                                            <ComparisonItem
                                                label="Storage"
                                                value="All values < θ (hash set)"
                                                isPositive
                                            />
                                            <ComparisonItem
                                                label="Estimate"
                                                value="N ≈ |retained| / θ"
                                                isPositive
                                            />
                                            <ComparisonItem
                                                label="Set Operations"
                                                value="Use min(θ) directly"
                                                isPositive
                                            />
                                        </Stack>
                                    </Paper>
                                </Box>
                            </Stack>
                        </Box>
                    </Fade>

                    {/* How Set Operations Work */}
                    <Fade in={isSectionVisible('operations')} timeout={600}>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 500,
                                    color: 'text.primary',
                                    mb: 3,
                                }}
                            >
                                Set Operations
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
                                The normalized threshold enables powerful set operations between sketches,
                                even if they were created with different K values.
                            </Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                <SetOperationCard
                                    title="Union (A ∪ B)"
                                    description="Combine all unique elements from both sets"
                                    formula="θ = min(θ_A, θ_B)"
                                    explanation="Merge both hash sets, filter by min(θ), estimate = |merged| / θ"
                                />
                                <SetOperationCard
                                    title="Intersection (A ∩ B)"
                                    description="Find elements present in both sets"
                                    formula="θ = min(θ_A, θ_B)"
                                    explanation="Keep only hashes appearing in both A and B, estimate = |common| / θ"
                                />
                                <SetOperationCard
                                    title="Difference (A − B)"
                                    description="Elements in A but not in B"
                                    formula="θ = min(θ_A, θ_B)"
                                    explanation="Keep A's hashes that don't appear in B, estimate = |A−B| / θ"
                                />
                            </Stack>
                        </Box>
                    </Fade>

                    {/* Theta Adaptation */}
                    <Fade in={isSectionVisible('adaptive')} timeout={600}>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 500,
                                    color: 'text.primary',
                                    mb: 3,
                                }}
                            >
                                Adaptive Threshold
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    borderColor: alpha(theme.palette.divider, 0.8),
                                    background: "transparent",
                                }}
                            >
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <StepBadge step={1} />
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                Start with θ = 1.0
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                Initially accept all hash values (everything is less than 1.0)
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <StepBadge step={2} />
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                When count exceeds nominal K (target size)
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                Set θ to the K-th smallest normalized hash value. "Nominal K" is the target number of values (like K in KMV), but it's a trigger point, not a strict limit.
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <StepBadge step={3} />
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                Remove values ≥ θ
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                Keep only values strictly less than the new threshold
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <StepBadge step={4} />
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                Continue processing
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                New values are only added if they are less than θ
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Paper>

                            {/* Concrete Example */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    mt: 3,
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    background: alpha(theme.palette.primary.main, 0.02),
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'primary.main',
                                        mb: 2,
                                    }}
                                >
                                    Concrete Example: Nominal K = 10
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                                            Step 1: Process 15 hash values (θ = 1.0, accept all)
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            Hashes: 0.12, 0.34, 0.05, 0.78, 0.23, 0.56, 0.09, 0.67, 0.41, 0.88, 0.15, 0.72, 0.03, 0.91, 0.28
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.85rem' }}>
                                            Count: 15 (exceeds nominal K = 10) → Trigger adjustment
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                                            Step 2: Sort and find the 10th smallest value
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            Sorted: 0.03, 0.05, 0.09, 0.12, 0.15, 0.23, 0.28, 0.34, 0.41, <strong style={{ color: theme.palette.primary.main }}>0.56</strong>, 0.67, 0.72, 0.78, 0.88, 0.91
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'primary.main', mt: 0.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                            → Set θ = 0.56 (the 10th smallest value)
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                                            Step 3: Remove all values ≥ θ (0.56)
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            Removed: <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>0.56, 0.67, 0.72, 0.78, 0.88, 0.91</span>
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'success.main', fontFamily: 'monospace', fontSize: '0.85rem', mt: 0.5, fontWeight: 600 }}>
                                            Retained: 0.03, 0.05, 0.09, 0.12, 0.15, 0.23, 0.28, 0.34, 0.41
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.85rem' }}>
                                            Retained count: <strong>9 values</strong> (less than nominal K = 10!)
                                        </Typography>
                                    </Box>

                                    <Box sx={{ 
                                        mt: 1, 
                                        p: 1.5, 
                                        borderRadius: 1, 
                                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                                        borderLeft: `3px solid ${theme.palette.info.main}`
                                    }}>
                                        <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
                                            <strong>Key Insight:</strong> Unlike KMV which always keeps exactly 10 values, Theta Sketch retained only 9 values after adjustment. This is why "nominal K" is a target, not a strict limit. The actual retained count depends on the distribution of hash values.
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Box>
                    </Fade>

                    {/* Benefits of Nominal K */}
                    <Fade in={isSectionVisible('summary')} timeout={600}>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 500,
                                    color: 'text.primary',
                                    mb: 3,
                                }}
                            >
                                Why Nominal K Instead of Strict K?
                            </Typography>
                            <Stack spacing={2}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 3,
                                        borderColor: alpha(theme.palette.success.main, 0.3),
                                        background: alpha(theme.palette.success.main, 0.02),
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                                        1. Simplified Set Operations
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1.5 }}>
                                        <strong>With Strict K (KMV):</strong> When merging two sketches, you must recalculate which K values to keep from the combined set. This requires sorting and selecting the K smallest values.
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                        <strong>With Nominal K (Theta Sketch):</strong> Simply use <code style={{ backgroundColor: alpha(theme.palette.divider, 0.2), padding: '2px 4px', borderRadius: '2px' }}>min(θ_A, θ_B)</code> and filter both sets. No recalculation needed!
                                    </Typography>
                                </Paper>

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 3,
                                        borderColor: alpha(theme.palette.info.main, 0.3),
                                        background: alpha(theme.palette.info.main, 0.02),
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}>
                                        2. Compatibility Across Different Configurations
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                        Sketches created with different nominal K values (e.g., K=10 and K=20) can be combined directly. 
                                        With strict K, you'd need both sketches to have the same K value, or perform complex recalculation.
                                    </Typography>
                                </Paper>

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 3,
                                        borderColor: alpha(theme.palette.warning.main, 0.3),
                                        background: alpha(theme.palette.warning.main, 0.02),
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                                        3. Adaptive to Data Distribution
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1.5 }}>
                                        If hash values are clustered (many small values), Theta Sketch naturally retains fewer values, 
                                        potentially saving memory. If values are spread out, it may retain more values.
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                        Strict K always uses exactly K slots, regardless of data distribution.
                                    </Typography>
                                </Paper>

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 3,
                                        borderColor: alpha(theme.palette.secondary.main, 0.3),
                                        background: alpha(theme.palette.secondary.main, 0.02),
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                                        4. Explicit Threshold Enables Better Estimation
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                        With explicit θ, the estimation formula <code style={{ backgroundColor: alpha(theme.palette.divider, 0.2), padding: '2px 4px', borderRadius: '2px' }}>N ≈ |retained| / θ</code> is straightforward. 
                                        The threshold is always known and doesn't need to be derived from the stored values.
                                    </Typography>
                                </Paper>
                            </Stack>
                        </Box>
                    </Fade>

                    {/* Summary */}
                    <Fade in={isSectionVisible('summary')} timeout={600}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                background: "transparent",
                                borderColor: alpha(theme.palette.divider, 0.8),
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: 'secondary.main',
                                    fontWeight: 600,
                                    mb: 1,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    fontSize: '1rem',
                                }}
                            >
                                Summary
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                Theta Sketch generalizes KMV by explicitly storing θ and keeping all values below it,
                                rather than exactly K values. This simple change—from implicit to explicit threshold—enables
                                clean set operations across sketches with different configurations. It's the preferred
                                choice for cardinality estimation in distributed systems (used by Apache Druid, Imply, etc.).
                            </Typography>
                        </Paper>
                    </Fade>
                </Stack>

                {/* Narration Controls */}
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: window.innerHeight / 12,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        animation: `${slideUp} 1s ease-out 0.25s both`,
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            px: 3,
                            background: "transparent",
                            pointerEvents: 'auto',
                        }}
                    >
                        <Stack spacing={1} alignItems="center">
                            {/* Progress Bar */}
                            <Box sx={{ width: '100%', minWidth: 600 }}>
                                <Slider
                                    value={progress}
                                    min={0}
                                    max={100}
                                    size="small"
                                    sx={{
                                        color: 'primary.main',
                                        height: 2,
                                        '& .MuiSlider-thumb': {
                                            width: 12,
                                            height: 12,
                                            '&:hover, &.Mui-focusVisible': {
                                                boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                                            },
                                        },
                                        '& .MuiSlider-rail': {
                                            opacity: 0.3,
                                        },
                                    }}
                                />
                            </Box>

                            {/* Controls */}
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Tooltip title="Restart">
                                    <IconButton
                                        onClick={handleRestart}
                                        size="large"
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        <RestartIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}>
                                    <IconButton
                                        onClick={handlePlayPause}
                                        size="large"
                                        sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            color: theme.palette.primary.contrastText,
                                            '&:hover': { backgroundColor: theme.palette.primary.dark },
                                        }}
                                    >
                                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Skip to End">
                                    <IconButton
                                        onClick={handleSkipToEnd}
                                        size="large"
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        <SkipNextIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Paper>
                </Box>
            </Container>
        </>
    );
}

// Helper Components
function ComparisonItem({
    label,
    value,
    isPositive = false,
}: {
    label: string;
    value: string;
    isPositive?: boolean;
}) {
    return (
        <Box>
            <Typography
                variant="caption"
                sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                }}
            >
                {label}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: isPositive
                        ? 'primary.main'
                        : 'text.primary',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

function SetOperationCard({
    title,
    description,
    formula,
    explanation,
}: {
    title: string;
    description: string;
    formula: string;
    explanation: string;
}) {
    const theme = useTheme();

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2.5,
                flex: 1,
                borderColor: alpha(theme.palette.divider, 0.8),
                background: "transparent",
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {description}
            </Typography>
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 1,
                    background: "transparent",
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    mb: 1.5,
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        fontFamily: 'monospace',
                        color: 'primary.main',
                        textAlign: 'center',
                    }}
                >
                    {formula}
                </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {explanation}
            </Typography>
        </Paper>
    );
}

function StepBadge({ step }: { step: number }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${theme.palette.primary.main}`,
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
                flexShrink: 0,
            }}
        >
            {step}
        </Box>
    );
}
