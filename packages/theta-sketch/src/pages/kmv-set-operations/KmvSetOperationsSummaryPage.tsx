import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';

import StepTitle from '../../components/StepTitle';
import StepProgressIndicator from '../../components/StepProgressIndicator';

export default function KmvSetOperationsSummaryPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <>
            <StepTitle title="KMV Set Operations — Summary" />
            <StepProgressIndicator currentStepId="set-operations" />

            <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
                <Stack spacing={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        A <strong>KMV sketch</strong> stores <strong>exactly K</strong> smallest hash values. The threshold θ is{' '}
                        <strong>implicit</strong>: it is the <strong>K-th smallest</strong> value (the max of the stored K). This is fine for
                        estimating a single set.
                    </Typography>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha(theme.palette.info.main, 0.25),
                            background: alpha(theme.palette.info.main, 0.05),
                            borderLeft: `4px solid ${theme.palette.info.main}`,
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                            What changes for set operations
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            <strong>Union</strong> stays “pure KMV”. But <strong>intersection</strong> and <strong>difference</strong> require a
                            shared θ, typically <strong>min(θ_A, θ_B)</strong>. KMV does not store θ in its result, so those results cannot be safely
                            reused for further set operations — that’s the KMV limitation and the motivation for Theta Sketch.
                        </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2.5, borderColor: alpha(theme.palette.divider, 0.5) }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Union (A ∪ B)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            Combine stored values, unique + sort, then keep the K smallest. The result is still a valid KMV sketch.
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                            union.values = sort(unique(A.values ∪ B.values))[0..K-1]
                            <br />
                            θ_union = max(union.values)
                            <br />
                            N̂_union = K / θ_union − 1
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
                            Because the union result stores exactly K values again, θ_union is always recoverable as max(result values). Union is
                            composable in KMV.
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha(theme.palette.warning.main, 0.3),
                            background: alpha(theme.palette.warning.main, 0.04),
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Intersection (A ∩ B) — KMV limitation
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            Intersection is defined by a shared threshold:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                            θ = min(θ_A, θ_B)
                            <br />
                            h1 = {'{'}v ∈ A.values | v &lt; θ{'}'}
                            <br />
                            h2 = {'{'}v ∈ B.values | v &lt; θ{'}'}
                            <br />
                            N̂_intersection = |h1 ∩ h2| / θ
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
                            The result often has fewer than K values. A KMV-only result has <strong>no place to store</strong> “θ = min(θ_A, θ_B)”.
                            If you try to infer θ from the result (e.g. max(result values)), it can be <strong>smaller</strong> than the correct θ,
                            so chaining set operations breaks.
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha(theme.palette.warning.main, 0.3),
                            background: alpha(theme.palette.warning.main, 0.04),
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Difference (A ∖ B) — KMV limitation
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            Difference also uses the shared threshold:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                            θ = min(θ_A, θ_B)
                            <br />
                            h1 = {'{'}v ∈ A.values | v &lt; θ{'}'}
                            <br />
                            h2 = {'{'}v ∈ B.values | v &lt; θ{'}'}
                            <br />
                            N̂_difference = |h1 ∖ h2| / θ
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
                            Same issue: the result may have fewer than K values, so the correct θ cannot be preserved in a KMV-only result.
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha(theme.palette.secondary.main, 0.35),
                            background: alpha(theme.palette.secondary.main, 0.05),
                            borderLeft: `4px solid ${theme.palette.secondary.main}`,
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Takeaway: saving θ ⇒ Theta Sketch
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            The fix is to store θ explicitly together with the retained values. That is exactly a <strong>Theta Sketch</strong>:
                            <br />
                            <strong>Theta Sketch = KMV values + stored θ</strong>.
                        </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/kmv-set-operations?op=union')}>
                            Animated Union
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/kmv-set-operations?op=intersection')}>
                            Animated Intersection
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/kmv-set-operations?op=difference')}>
                            Animated Difference
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/theta-sketch/theta-sketch')}>
                            Continue: Theta Sketch
                        </Button>
                    </Box>
                </Stack>
            </Container>
        </>
    );
}

