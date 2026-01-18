import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';

import * as Tag from '@mui/icons-material/Tag';
import * as ScatterPlot from '@mui/icons-material/ScatterPlot';
import * as Calculate from '@mui/icons-material/Calculate';

const TagIcon = Tag.default as unknown as React.ElementType;
const ScatterPlotIcon = ScatterPlot.default as unknown as React.ElementType;
const CalculateIcon = Calculate.default as unknown as React.ElementType;

interface RequirementCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function RequirementCard({ icon, title, description }: RequirementCardProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                borderRadius: 2,
                // backgroundColor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateX(4px)',
                },
            }}
        >
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}

export default function KthSmallestEstimation() {
    const theme = useTheme();

    return (
        <Stack spacing={3}>
            {/* Title - Formula as headline */}


            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 1.5 }}>
                <CalculateIcon sx={{ color: theme.palette.primary.main, fontSize: '2rem' }} />
                <Typography
                    variant="h5"
                    sx={{
                        letterSpacing: 1,
                        color: 'text.primary',
                    }}
                >
                    N ≈ (K / θ) − 1
                </Typography>
            </Stack>

            <Typography
                variant="body1"
                sx={{
                    lineHeight: 1.8,
                    fontSize: '1.05rem',
                    color: 'text.secondary',
                }}
            >
                The <strong>K-th Smallest Estimation</strong> is a technique for estimating distinct counts in data streams.
                To apply it in big data scenarios, we need to meet these requirements:
            </Typography>


            {/* Requirements */}
            <Stack spacing={2}>
                <RequirementCard
                    icon={<TagIcon />}
                    title="Uniform Hash Function"
                    description="Hash values must be uniformly distributed in (0,1), ensuring equal probability for any value in the interval."
                />
                <RequirementCard
                    icon={<ScatterPlotIcon />}
                    title="Sufficient Sample Size"
                    description="N must be large enough to ensure hash values are evenly distributed across the interval (0,1)."
                />
            </Stack>
        </Stack>
    );
}
