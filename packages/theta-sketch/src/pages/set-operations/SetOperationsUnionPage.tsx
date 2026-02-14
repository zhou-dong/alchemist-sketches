import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Fade, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';

import StepProgressIndicator from '../../components/StepProgressIndicator';
import {
    useSetOperationsDemoData,
    SetCard,
    ThetaBar,
    StepDots,
    ColorLegend,
    CountBadge,
    ThetaCompareMini,
    SKETCH_A_COLOR,
    SKETCH_B_COLOR,
    RESULT_COLOR,
} from './SetOperationsDemoShared';

const UNION_VISUAL_STEPS = 3; // 0: A and B bars; 1: θ comparison + merge idea; 2: union result bar

export default function SetOperationsUnionPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [k] = useState(12);
    const [streamASize] = useState(40);
    const [streamBSize] = useState(50);
    const [seed, setSeed] = useState(0);
    const [visualStep, setVisualStep] = useState(0);

    const { sketchA, sketchB, union } = useSetOperationsDemoData(k, streamASize, streamBSize, seed);

    return (
        <>
            {/* <StepTitle title="KMV Set Operations: Union" /> */}
            <StepProgressIndicator currentStepId="set-operations" />

            <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
                <Stack spacing={3}>
                    {/* Why union stays KMV */}
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
                            Why union stays KMV
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                            For union we <strong>merge</strong> both K-value sets, sort, and take the <strong>K smallest</strong>. The result has exactly K values, so its threshold is just the K-th value — we don’t need min(θ_A, θ_B). That means the result is still a valid KMV sketch and can be used in further unions. Union is the one set operation that <strong>preserves KMV</strong>.
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
                            Visual: merge and take K smallest on the number line
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <ColorLegend />
                        </Box>
                        <Stack spacing={2}>
                            {visualStep >= 1 && (
                                <Fade in={true}>
                                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>θ comparison (union uses K-th of merged, not min)</Typography>
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
                                    />
                                    <ThetaBar
                                        values={sketchB.values}
                                        theta={sketchB.theta}
                                        color={SKETCH_B_COLOR}
                                        title={`Sketch B — θ_B = ${sketchB.theta.toFixed(2)}`}
                                    />
                                </Box>
                            </Fade>
                            {visualStep >= 1 && (
                                <Fade in={true}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                        Union: merge A and B, sort, take <strong>K smallest</strong>. Result θ = K-th value = <strong>{union.theta.toFixed(3)}</strong>.
                                    </Typography>
                                </Fade>
                            )}
                            {visualStep >= 1 && (
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                    <CountBadge label="|A|" count={sketchA.values.length} color={SKETCH_A_COLOR} />
                                    <CountBadge label="|B|" count={sketchB.values.length} color={SKETCH_B_COLOR} />
                                    {visualStep >= 2 && (
                                        <CountBadge label="|A ∪ B|" count={union.values.length} color={RESULT_COLOR} />
                                    )}
                                </Stack>
                            )}
                            {visualStep >= 2 && (
                                <Fade in={true}>
                                    <Box>
                                        <ThetaBar
                                            values={union.values}
                                            theta={union.theta}
                                            color={RESULT_COLOR}
                                            title={`Union (A ∪ B) — θ = K-th value = ${union.theta.toFixed(2)}`}
                                        />
                                        <Typography variant="caption" color="text.secondary">Result has exactly K values → stays KMV.</Typography>
                                    </Box>
                                </Fade>
                            )}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <StepDots current={visualStep} total={UNION_VISUAL_STEPS} />
                                <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={visualStep === 0}
                                    onClick={() => setVisualStep((s) => Math.max(0, s - 1))}
                                >
                                    Previous step
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    disabled={visualStep >= UNION_VISUAL_STEPS - 1}
                                    onClick={() => setVisualStep((s) => Math.min(UNION_VISUAL_STEPS - 1, s + 1))}
                                >
                                    {visualStep >= UNION_VISUAL_STEPS - 1 ? 'Done' : 'Next step'}
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    Step {visualStep + 1} of {UNION_VISUAL_STEPS}
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
                            Result: Union (A ∪ B)
                        </Typography>
                        <SetCard
                            title="Union (A ∪ B) — KMV"
                            values={union.values}
                            theta={union.theta}
                            estimated={union.estimated}
                            formula="Merge A and B, sort, take exactly K smallest. θ = K-th value. N̂ = k/θ − 1"
                            color={RESULT_COLOR}
                            subtitle="Result: exactly K values (K smallest of combined). Stays KMV — can be used in further unions."
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button variant="outlined" onClick={() => setSeed((s) => s + 1)}>
                            New random example
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo')}>
                            Back to Set Operations Demo
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/intersection')}>
                            Intersection
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
