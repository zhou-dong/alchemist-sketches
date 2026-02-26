import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { SetCard, useSetOperationsDemoData } from '../kmv-set-operations/SetOperationsDemoShared';
import { KmvSetOperationHeader } from '../kmv-set-operations/KmvSetOperationsSharedComponents';

const DESCRIPTION = `
For Theta Sketch difference, we use θ = min(θ_A, θ_B) and store that θ in the result.
Because θ is saved, the difference result remains composable for further set operations.
`;

export default function ThetaSketchDifference() {
    const theme = useTheme();
    const k = 10;
    const { sketchA, sketchB, difference } = useSetOperationsDemoData(k, 15, 20, 0);
    const thetaOp = Math.min(sketchA.theta, sketchB.theta);

    return (
        <>
            <KmvSetOperationHeader title="Theta Sketch Difference" description={DESCRIPTION} />
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
                            Difference rule in Theta Sketch
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            Compute difference with shared θ = min(θ_A, θ_B), then store this θ in the result sketch.
                            This preserves the correct threshold for chaining later operations.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                            θ_difference = min(θ_A, θ_B) = {thetaOp.toFixed(2)}
                            <br />
                            N̂_difference = |h1 ∖ h2| / θ_difference
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
                        title="Difference Result (Theta Sketch)"
                        subtitle="Stores values + θ_difference, so it remains composable"
                        values={difference.values}
                        theta={difference.theta}
                        estimated={difference.estimated}
                        formula="N̂_difference = |h1 ∖ h2| / θ_difference"
                        color={theme.palette.success.main}
                    />
                </Stack>
            </Box>
        </>
    );
}

