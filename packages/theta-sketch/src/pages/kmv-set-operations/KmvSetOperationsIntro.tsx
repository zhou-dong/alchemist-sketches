import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Stack, Typography, alpha } from '@mui/material';

import StepProgressIndicator from '../../components/StepProgressIndicator';

export default function KmvSetOperationsIntroPage() {
    const navigate = useNavigate();

    return (
        <>
            <StepProgressIndicator currentStepId="set-operations" />

            <Container maxWidth="md" sx={{ py: 4, pb: 12 }}>
                <Stack spacing={2.5}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4 }}>
                        KMV Set Operations: Intro
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        KMV supports union, intersection, and difference estimation. But composability is different across these operations.
                    </Typography>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha('#4caf50', 0.35),
                            background: alpha('#4caf50', 0.06),
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Union (A ∪ B): composable in KMV
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            After merge + dedupe + keep K smallest values, the union result is still a valid KMV sketch. The threshold can be inferred from
                            the new sketch as max(values), so further set operations remain safe.
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha('#ff9800', 0.35),
                            background: alpha('#ff9800', 0.06),
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Intersection (A ∩ B): estimate works, result is not composable
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            Intersection uses a shared threshold θ = min(θ_A, θ_B). The resulting sketch can contain fewer than K values, so inferring θ from
                            that new sketch does not necessarily recover the θ used by the operation.
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha('#ff9800', 0.35),
                            background: alpha('#ff9800', 0.06),
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Difference (A ∖ B): same limitation as intersection
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            Difference also depends on shared θ = min(θ_A, θ_B). The new sketch may have fewer than K values, so inferred θ from the result is
                            not guaranteed to be the original operation θ. That breaks safe chaining for further set operations.
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha('#9c27b0', 0.35),
                            background: alpha('#9c27b0', 0.06),
                            borderLeft: `4px solid ${alpha('#9c27b0', 0.75)}`,
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Why Theta Sketch
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            To make intersection and difference composable, we must store θ explicitly in the sketch. That leads to Theta Sketch:
                            <br />
                            <strong>Theta Sketch = KMV values + stored θ</strong>.
                        </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', pt: 0.5 }}>
                        <Button variant="contained" onClick={() => navigate('/theta-sketch/kmv-set-ops?op=union')}>
                            Start with Union Demo
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/theta-sketch')}>
                            Continue: Theta Sketch
                        </Button>
                    </Box>
                </Stack>
            </Container>
        </>
    );
}

