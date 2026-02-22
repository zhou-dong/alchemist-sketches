import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Fade, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import StepTitle from '../../components/StepTitle';
import StepProgressIndicator from '../../components/StepProgressIndicator';
import {
    useSetOperationsDemoData,
    SetCard,
    NewThetaLimitNote,
    LimitSection,
} from './SetOperationsDemoShared';
import {
    ThetaBar,
    StepDots,
    CountBadge,
    ThetaCompareMini,
    ColorLegend,
    SKETCH_A_COLOR,
    SKETCH_B_COLOR,
    RESULT_COLOR,
} from '../../components/set-operations/SetOperationsVizShared';
import KmvDifference from './KmvDifference';

const DIFF_VISUAL_STEPS = 3; // 0: A and B bars; 1: common θ + highlight below θ; 2: difference result bar

export default function SetOperationsDifferencePage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [k] = useState(12);
    const [streamASize] = useState(40);
    const [streamBSize] = useState(50);
    const [seed, setSeed] = useState(0);
    const [visualStep, setVisualStep] = useState(0);

    const { sketchA, sketchB, difference } = useSetOperationsDemoData(k, streamASize, streamBSize, seed);
    const commonTheta = Math.min(sketchA.theta, sketchB.theta);
    const countABelowTheta = sketchA.values.filter((v) => v < commonTheta).length;
    const countBBelowTheta = sketchB.values.filter((v) => v < commonTheta).length;

    return (
        <>
            <StepTitle title="KMV Set Operations: Difference" />
            <StepProgressIndicator currentStepId="set-operations" />

            <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
                <Stack spacing={3}>
                    {/* Why θ is important for difference */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            background: alpha(theme.palette.primary.main, 0.04),
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 600,
                                mb: 2,
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                fontSize: '0.95rem',
                            }}
                        >
                            Why θ is important for difference
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                            For difference we need a <strong>common threshold</strong>: we only look at values <strong>below θ</strong> in both
                            sketches, then count values that are in A but <strong>not</strong> in B. That count, divided by θ, gives the estimated
                            difference size. So <strong>θ defines the operation</strong>. We use <strong>θ = min(θ_A, θ_B)</strong> so both
                            sketches are on the same scale. The result cannot stay KMV for further set ops — see “New θ” and the limit below.
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            The problem: KMV does not store θ. After we compute the difference, the result has no stored θ — we hit the same limit
                            as with intersection.
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderColor: alpha(theme.palette.info.main, 0.25),
                            background: alpha(theme.palette.info.main, 0.04),
                            borderLeft: `4px solid ${theme.palette.info.main}`,
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
                            KMV reminder: θ is implicit (K-th smallest)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            In KMV, θ is not stored explicitly. It is inferred as the <strong>K-th smallest</strong> value (the max of the stored K).
                            Difference needs the shared θ = min(θ_A, θ_B), so losing θ in the result is exactly where KMV stops being composable.
                        </Typography>
                    </Paper>

                    {/* Visual demo: number-line bars + step-by-step */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderColor: alpha(theme.palette.secondary.main, 0.3),
                            background: alpha(theme.palette.secondary.main, 0.02),
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                            Visual: θ and “below θ” for difference (A ∖ B)
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <ColorLegend showBelowTheta />
                        </Box>
                        <Stack spacing={2}>
                            {visualStep >= 1 && (
                                <Fade in={true}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                            θ comparison
                                        </Typography>
                                        <ThetaCompareMini thetaA={sketchA.theta} thetaB={sketchB.theta} colorA={SKETCH_A_COLOR} colorB={SKETCH_B_COLOR} />
                                    </Box>
                                </Fade>
                            )}
                            <Fade in={true}>
                                <Box>
                                    <ThetaBar
                                        values={sketchA.values}
                                        theta={sketchA.theta}
                                        color={SKETCH_A_COLOR}
                                        title={`Sketch A — θ_A = ${sketchA.theta.toFixed(2)}`}
                                        highlightBelowTheta={visualStep >= 1}
                                    />
                                    <ThetaBar
                                        values={sketchB.values}
                                        theta={sketchB.theta}
                                        color={SKETCH_B_COLOR}
                                        title={`Sketch B — θ_B = ${sketchB.theta.toFixed(2)}`}
                                        highlightBelowTheta={visualStep >= 1}
                                    />
                                </Box>
                            </Fade>
                            {visualStep >= 1 && (
                                <Fade in={true}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                        Common θ for difference = min(θ_A, θ_B) = <strong>{commonTheta.toFixed(3)}</strong>. Shaded region =
                                        “below θ”. We count values in A but not in B.
                                    </Typography>
                                </Fade>
                            )}
                            {visualStep >= 1 && (
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                    <CountBadge label="|A below θ|" count={countABelowTheta} color={SKETCH_A_COLOR} />
                                    <CountBadge label="|B below θ|" count={countBBelowTheta} color={SKETCH_B_COLOR} />
                                    {visualStep >= 2 && <CountBadge label="|A ∖ B|" count={difference.values.length} color={RESULT_COLOR} />}
                                </Stack>
                            )}
                            {visualStep >= 2 && (
                                <Fade in={true}>
                                    <Box>
                                        <ThetaBar
                                            values={difference.values}
                                            theta={commonTheta}
                                            color={RESULT_COLOR}
                                            title="Difference (A ∖ B) — values in A but not in B below θ"
                                            highlightBelowTheta={true}
                                            onlyBelowTheta={true}
                                        />
                                    </Box>
                                </Fade>
                            )}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <StepDots current={visualStep} total={DIFF_VISUAL_STEPS} />
                                <Button size="small" variant="outlined" disabled={visualStep === 0} onClick={() => setVisualStep((s) => Math.max(0, s - 1))}>
                                    Previous step
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    disabled={visualStep >= DIFF_VISUAL_STEPS - 1}
                                    onClick={() => setVisualStep((s) => Math.min(DIFF_VISUAL_STEPS - 1, s + 1))}
                                >
                                    {visualStep >= DIFF_VISUAL_STEPS - 1 ? 'Done' : 'Next step'}
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    Step {visualStep + 1} of {DIFF_VISUAL_STEPS}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block' }}>
                            Input: two KMV sketches (K = {k})
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <SetCard
                                    title="Sketch A (KMV)"
                                    values={sketchA.values}
                                    theta={sketchA.theta}
                                    estimated={k / sketchA.theta - 1}
                                    formula="KMV: exactly K values. θ = K-th value. N̂ = k/θ − 1"
                                    color={SKETCH_A_COLOR}
                                    subtitle={`Exactly K smallest of stream A (n ≈ ${streamASize})`}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <SetCard
                                    title="Sketch B (KMV)"
                                    values={sketchB.values}
                                    theta={sketchB.theta}
                                    estimated={k / sketchB.theta - 1}
                                    formula="KMV: exactly K values. θ = K-th value. N̂ = k/θ − 1"
                                    color={SKETCH_B_COLOR}
                                    subtitle={`Exactly K smallest of stream B (n ≈ ${streamBSize})`}
                                />
                            </Box>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block' }}>
                            Result: Difference (A ∖ B)
                        </Typography>
                        <Stack spacing={2}>
                            <SetCard
                                title="Difference (A ∖ B) — KMV"
                                values={difference.values}
                                theta={difference.theta}
                                estimated={difference.estimated}
                                formula="θ = min(θ_A, θ_B). Among K values, count in A but not in B below θ. N̂ = |h₁ ∖ h₂| / θ"
                                color={RESULT_COLOR}
                                subtitle="Values in A but not in B below θ"
                            />
                            <NewThetaLimitNote
                                correctTheta={difference.theta}
                                resultValues={difference.values}
                                operationLabel="Difference"
                            />
                        </Stack>
                    </Box>

                    {/* Why KMV is limited and why we need θ */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderColor: alpha(theme.palette.warning.main, 0.3),
                            background: alpha(theme.palette.warning.main, 0.04),
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                            Why KMV is limited
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                            KMV stores only the K values — it never stores θ. So the difference result above is just a set of values (often fewer than
                            K). We have <strong>no place to store</strong> “θ = min(θ_A, θ_B)” in that result. If we use that result in another
                            intersection or difference, we would have to guess θ from the result (e.g. max(result values)), which loses the correct
                            threshold. That is the <strong>limit of KMV</strong>.
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                            Why we need θ
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            To fix this we need to <strong>save θ</strong> in the result. The correct θ is min(θ_A, θ_B). Once we save θ explicitly
                            with the values below it, the result becomes a <strong>Theta Sketch</strong>. So <strong>θ is necessary</strong> for the
                            result to participate in further set operations.
                        </Typography>
                    </Paper>

                    <LimitSection />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button variant="outlined" onClick={() => setSeed((s) => s + 1)}>
                            New random example
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo')}>
                            Back to Set Operations Demo
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/union')}>
                            Union
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/intersection')}>
                            Intersection
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/theta-sketch/theta-sketch')}>
                            Go to Theta Sketch
                        </Button>
                    </Box>
                </Stack>
            </Container>

            {/* Full-screen animated Three.js walkthrough */}
            <KmvDifference />
        </>
    );
}

