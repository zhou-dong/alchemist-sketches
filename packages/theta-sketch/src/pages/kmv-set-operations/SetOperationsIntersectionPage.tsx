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

const VISUAL_STEPS = 3; // 0: A and B bars; 1: common θ + highlight below θ; 2: intersection result bar

export default function SetOperationsIntersectionPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [k] = useState(12);
    const [streamASize] = useState(40);
    const [streamBSize] = useState(50);
    const [seed, setSeed] = useState(0);
    const [visualStep, setVisualStep] = useState(0);

    const { sketchA, sketchB, intersection } = useSetOperationsDemoData(k, streamASize, streamBSize, seed);
    const commonTheta = Math.min(sketchA.theta, sketchB.theta);
    const countABelowTheta = sketchA.values.filter((v) => v < commonTheta).length;
    const countBBelowTheta = sketchB.values.filter((v) => v < commonTheta).length;

    return (
        <>
            <StepTitle title="KMV Set Operations: Intersection" />
            <StepProgressIndicator currentStepId="set-operations" />

            <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
                <Stack spacing={3}>
                    {/* Why θ is important — focus for this page */}
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
                            Why θ is important for intersection
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                            For intersection we need a <strong>common threshold</strong>: we only look at values <strong>below θ</strong> in
                            both sketches, then count how many appear in both. That count, divided by θ, gives the estimated intersection size.
                            So <strong>θ defines the operation</strong> — without θ we don’t know where to cut off. We use{' '}
                            <strong>θ = min(θ_A, θ_B)</strong> so both sketches are treated on the same scale. That makes θ{' '}
                            <strong>necessary</strong> for the result to be meaningful and to be used in further set operations.
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            The problem: KMV does not store θ. So after we compute the intersection, the result has no stored θ — and we hit the
                            limit below.
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
                            Visual: θ and “below θ” on the number line
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
                                        Common θ for intersection = min(θ_A, θ_B) = <strong>{commonTheta.toFixed(3)}</strong>. Shaded region =
                                        “below θ” (values we use for intersection).
                                    </Typography>
                                </Fade>
                            )}
                            {visualStep >= 1 && (
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                    <CountBadge label="|A below θ|" count={countABelowTheta} color={SKETCH_A_COLOR} />
                                    <CountBadge label="|B below θ|" count={countBBelowTheta} color={SKETCH_B_COLOR} />
                                    {visualStep >= 2 && <CountBadge label="|A ∩ B|" count={intersection.values.length} color={RESULT_COLOR} />}
                                </Stack>
                            )}
                            {visualStep >= 2 && (
                                <Fade in={true}>
                                    <Box>
                                        <ThetaBar
                                            values={intersection.values}
                                            theta={commonTheta}
                                            color={RESULT_COLOR}
                                            title="Intersection (A ∩ B) — values in both below θ"
                                            highlightBelowTheta={true}
                                            onlyBelowTheta={true}
                                        />
                                    </Box>
                                </Fade>
                            )}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <StepDots current={visualStep} total={VISUAL_STEPS} />
                                <Button size="small" variant="outlined" disabled={visualStep === 0} onClick={() => setVisualStep((s) => Math.max(0, s - 1))}>
                                    Previous step
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    disabled={visualStep >= VISUAL_STEPS - 1}
                                    onClick={() => setVisualStep((s) => Math.min(VISUAL_STEPS - 1, s + 1))}
                                >
                                    {visualStep >= VISUAL_STEPS - 1 ? 'Done' : 'Next step'}
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    Step {visualStep + 1} of {VISUAL_STEPS}
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
                            Result: Intersection (A ∩ B)
                        </Typography>
                        <Stack spacing={2}>
                            <SetCard
                                title="Intersection (A ∩ B) — KMV"
                                values={intersection.values}
                                theta={intersection.theta}
                                estimated={intersection.estimated}
                                formula="θ = min(θ_A, θ_B). Among K values from each sketch, count in both below θ. N̂ = |h₁ ∩ h₂| / θ"
                                color={RESULT_COLOR}
                                subtitle="Values in both sketches below θ"
                            />
                            <NewThetaLimitNote
                                correctTheta={intersection.theta}
                                resultValues={intersection.values}
                                operationLabel="Intersection"
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
                            KMV stores only the K values — it never stores θ. So the intersection result above is just a set of values (often fewer
                            than K). We have <strong>no place to store</strong> “θ = min(θ_A, θ_B)” in that result. If we use that result in
                            another intersection or difference, we would have to guess θ from the result. The only thing we can get is{' '}
                            <strong>max(result values)</strong>, which is at most min(θ_A, θ_B) and in general <strong>smaller</strong>. So we
                            lose the correct threshold. With the wrong θ, any further set operation would be wrong. That is the{' '}
                            <strong>limit of KMV</strong>.
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                            Why we need θ
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            To fix this we need to <strong>save θ</strong> in the result. The correct θ for the result is min(θ_A, θ_B). Once we
                            save θ explicitly together with the values below it, the result is no longer “just KMV” — it becomes a{' '}
                            <strong>Theta Sketch</strong>. So <strong>θ is necessary</strong> for the result to participate in further set
                            operations; saving θ is the natural fix and that step is exactly what turns KMV into Theta Sketch.
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
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/difference')}>
                            Difference
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/theta-sketch/theta-sketch')}>
                            Go to Theta Sketch
                        </Button>
                    </Box>
                </Stack>
            </Container>
        </>
    );
}

