import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { SetCard, useSetOperationsDemoData } from '../kmv-set-operations/SetOperationsDemoShared';
import { KmvSetOperationHeader } from '../kmv-set-operations/KmvSetOperationsSharedComponents';

const DESCRIPTION = `
Theta Sketch union keeps the same KMV value logic and explicitly stores θ in the result.
Because θ is stored, the union result is directly composable for further set operations.
`;

export default function ThetaSketchUnion() {
    const theme = useTheme();
    const k = 10;
    const { sketchA, sketchB, union } = useSetOperationsDemoData(k, 15, 20, 0);

    return (
        <>
            <KmvSetOperationHeader title="Theta Sketch Union" description={DESCRIPTION} />
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
                            Union rule in Theta Sketch
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            Merge values from both sketches, remove duplicates, sort, and keep the K smallest values.
                            Then store <strong>θ_union</strong> explicitly in the result.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                            values_union = smallestK(unique(A.values ∪ B.values))
                            <br />
                            θ_union = max(values_union), stored explicitly
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
                        title="Union Result (Theta Sketch)"
                        subtitle="Stores values + θ_union, so it remains composable"
                        values={union.values}
                        theta={union.theta}
                        estimated={union.estimated}
                        formula="N̂_union = K / θ_union - 1"
                        color={theme.palette.success.main}
                    />
                </Stack>
            </Box>
        </>
    );
}

