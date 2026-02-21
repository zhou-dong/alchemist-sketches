import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import StepTitle from '../../components/StepTitle';
import StepProgressIndicator from '../../components/StepProgressIndicator';

export default function SetOperationsDemoPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <>
            <StepTitle title="KMV Set Operations Demo" />
            <StepProgressIndicator currentStepId="set-operations" />

            <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                    <strong>KMV (K Minimum Values)</strong>: each sketch stores <strong>exactly K</strong> smallest hash values. θ =
                    K-th value (max of the K values). Choose an operation to see how union, intersection, and difference work —
                    and why intersection and difference hit a limit (saving θ leads to Theta Sketch).
                </Typography>

                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        mb: 3,
                        borderColor: alpha(theme.palette.warning.main, 0.3),
                        background: alpha(theme.palette.warning.main, 0.06),
                        borderLeft: `4px solid ${theme.palette.warning.main}`,
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
                        Important: KMV does not store θ
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        A KMV sketch stores only the <strong>K values</strong>. The threshold θ is <strong>implicit</strong>: it is the{' '}
                        <strong>K-th smallest</strong> value (the max of the stored K). This is fine for estimating a single set.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                        But for <strong>intersection</strong> and <strong>difference</strong>, the correct operation needs a shared θ (usually{' '}
                        <strong>min(θ_A, θ_B)</strong>). Since KMV does not save θ in the result, those results cannot be used for further set ops —
                        that’s the KMV limit, and it motivates Theta Sketch.
                    </Typography>
                </Paper>

                <Stack spacing={2}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderColor: alpha(theme.palette.divider, 0.5),
                            borderLeft: '4px solid #4CAF50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#4CAF50' }}>
                                Union (A ∪ B)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Merge both K-value sets, sort, take K smallest. Result stays KMV.
                            </Typography>
                        </Box>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/union')}>
                            Open Union demo
                        </Button>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderColor: alpha(theme.palette.divider, 0.5),
                            borderLeft: '4px solid #2196F3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#2196F3' }}>
                                Intersection (A ∩ B)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                θ = min(θ_A, θ_B), count values in both below θ. See the limit → saving θ → Theta Sketch.
                            </Typography>
                        </Box>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/intersection')}>
                            Open Intersection demo
                        </Button>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderColor: alpha(theme.palette.divider, 0.5),
                            borderLeft: '4px solid #FFB74D',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#FFB74D' }}>
                                Difference (A ∖ B)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                θ = min(θ_A, θ_B), count values in A but not in B below θ. See the limit → saving θ → Theta Sketch.
                            </Typography>
                        </Box>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/difference')}>
                            Open Difference demo
                        </Button>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations')}>
                            Back to Set Operations
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

