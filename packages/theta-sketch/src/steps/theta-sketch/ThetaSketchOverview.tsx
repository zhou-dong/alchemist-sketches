import { Box, Typography, Paper, Stack, Container, alpha, useTheme } from '@mui/material';

export default function ThetaSketchOverview() {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ py: 4, marginTop: '60px' }}>
            <Stack spacing={5}>
                {/* Header */}
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

                {/* KMV vs Theta Sketch Comparison */}
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
                                        value="N ≈ (K − 1) / θ"
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
                                    sx={{ color: 'success.main' }}
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

                {/* How Set Operations Work */}
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
                            explanation="Keep values < min threshold, then estimate"
                        />
                        <SetOperationCard
                            title="Intersection (A ∩ B)"
                            description="Find elements present in both sets"
                            formula="θ = min(θ_A, θ_B)"
                            explanation="Keep values in both sets that are < min threshold"
                        />
                        <SetOperationCard
                            title="Difference (A − B)"
                            description="Elements in A but not in B"
                            formula="θ = min(θ_A, θ_B)"
                            explanation="Keep A's values not in B, filter by min threshold"
                        />
                    </Stack>
                </Box>

                {/* Theta Adaptation */}
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
                                        When count exceeds nominal K
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                        Set θ to the K-th smallest normalized hash value
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
                </Box>

                {/* Summary */}
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
            </Stack>
        </Container>
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
                        ? 'success.main'
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
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
