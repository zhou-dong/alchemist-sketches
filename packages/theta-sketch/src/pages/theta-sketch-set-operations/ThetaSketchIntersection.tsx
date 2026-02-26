import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { SetCard, useSetOperationsDemoData } from '../kmv-set-operations/SetOperationsDemoShared';
import { KmvSetOperationHeader } from '../kmv-set-operations/KmvSetOperationsSharedComponents';

const DESCRIPTION = `
For Theta Sketch intersection, we use θ = min(θ_A, θ_B) and store that θ in the result.
Because θ is stored explicitly, the intersection result remains composable.
`;

export default function ThetaSketchIntersection() {
    const theme = useTheme();
    const k = 10;
    const { sketchA, sketchB, intersection } = useSetOperationsDemoData(k, 15, 20, 0);
    const thetaOp = Math.min(sketchA.theta, sketchB.theta);

    return (
        <>
            <KmvSetOperationHeader title="Theta Sketch Intersection" description={DESCRIPTION} />
            <Box sx={{ pt: { xs: 18, md: 16 }, pb: 8, px: 2 }}>
                <Stack spacing={2} sx={{ maxWidth: 960, mx: 'auto' }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderColor: alpha(theme.palette.info.main, 0.3),
                            background: alpha(theme.palette.info.main, 0.06),
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                            Intersection rule in Theta Sketch
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            Compute intersection using shared θ = min(θ_A, θ_B), then store this θ in the result sketch.
                            This keeps the result valid for chaining more set operations.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                            θ_intersection = min(θ_A, θ_B) = {thetaOp.toFixed(2)}
                            <br />
                            N̂_intersection = |h1 ∩ h2| / θ_intersection
                        </Typography>
                    </Paper>

                    <SetCard
                        title="Sketch A (Theta Sketch)"
                        subtitle="Stores values + θ_A"
                        values={sketchA.values}
                        theta={sketchA.theta}
                        estimated={sketchA.theta > 0 ? k / sketchA.theta - 1 : 0}
                        formula="N̂ = K / θ - 1"
                        color={theme.palette.primary.main}
                    />
                    <SetCard
                        title="Sketch B (Theta Sketch)"
                        subtitle="Stores values + θ_B"
                        values={sketchB.values}
                        theta={sketchB.theta}
                        estimated={sketchB.theta > 0 ? k / sketchB.theta - 1 : 0}
                        formula="N̂ = K / θ - 1"
                        color={theme.palette.secondary.main}
                    />
                    <SetCard
                        title="Intersection Result (Theta Sketch)"
                        subtitle="Stores values + θ_intersection, so it remains composable"
                        values={intersection.values}
                        theta={intersection.theta}
                        estimated={intersection.estimated}
                        formula="N̂_intersection = |h1 ∩ h2| / θ_intersection"
                        color={theme.palette.success.main}
                    />
                </Stack>
            </Box>
        </>
    );
}

