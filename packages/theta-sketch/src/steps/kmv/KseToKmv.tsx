import { Box, Typography, alpha, useTheme, Grid, Button, Container } from '@mui/material';
import { slideUp } from '@alchemist/shared';

import * as Tag from '@mui/icons-material/Tag';
import * as ScatterPlot from '@mui/icons-material/ScatterPlot';
import * as Memory from '@mui/icons-material/Memory';
import * as PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import * as Functions from '@mui/icons-material/Functions';
import * as ArrowForward from '@mui/icons-material/ArrowForward';

const ArrowForwardIcon = ArrowForward.default as unknown as React.ElementType;
const TagIcon = Tag.default as unknown as React.ElementType;
const ScatterPlotIcon = ScatterPlot.default as unknown as React.ElementType;
const MemoryIcon = Memory.default as unknown as React.ElementType;
const PlaylistAddIcon = PlaylistAdd.default as unknown as React.ElementType;
const FunctionsIcon = Functions.default as unknown as React.ElementType;

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
    accent?: 'primary' | 'secondary' | 'info';
}

function InfoCard({ icon, title, description, delay = 0, accent = 'primary' }: InfoCardProps) {
    const theme = useTheme();
    const accentColor = theme.palette[accent].main;

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(accentColor, 0.15)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: `${slideUp} 0.5s ease-out ${delay}s both`,
                height: '100%',
                '&:hover': {
                    background: alpha(accentColor, 0.08),
                    borderColor: alpha(accentColor, 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(accentColor, 0.1)}`,
                },
            }}
        >
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(accentColor, 0.1),
                    color: accentColor,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        mb: 0.25,
                        color: 'text.primary',
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        lineHeight: 1.5,
                        color: 'text.secondary',
                    }}
                >
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}

interface StepSectionProps {
    step: number;
    title: string;
    children: React.ReactNode;
    isLast?: boolean;
    delay?: number;
}

function StepSection({ step, title, children, isLast = false, delay = 0 }: StepSectionProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 3,
                animation: `${slideUp} 0.5s ease-out ${delay}s both`,
            }}
        >
            {/* Step indicator with connector line */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                }}
            >
                {/* Step number */}
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                        flexShrink: 0,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'primary.contrastText',
                        }}
                    >
                        {step}
                    </Typography>
                </Box>

                {/* Connector line */}
                {!isLast && (
                    <Box
                        sx={{
                            width: 2,
                            flex: 1,
                            mt: 1,
                            background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                            borderRadius: 1,
                        }}
                    />
                )}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, pb: isLast ? 0 : 4 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 1.5,
                        color: 'text.primary',
                        letterSpacing: '0.01em',
                    }}
                >
                    {title}
                </Typography>
                {children}
            </Box>
        </Box>
    );
}

export default function KseToKmv({ onClose }: { onClose: () => void }) {
    const theme = useTheme();

    return (
        <Container
            maxWidth="xl"
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: 2,
            }}
        >
            {/* Section 1: The Core Insight */}
            <StepSection step={1} title="The Core Insight" delay={0.1}>
                <Typography
                    variant="body1"
                    sx={{
                        lineHeight: 1.8,
                        color: 'text.secondary',
                    }}
                >
                    From <strong>Order Statistics</strong>, we know that among N uniformly distributed values in (0,1),
                    the K-th smallest has an expected value of <strong>K / (N + 1)</strong>.
                    <strong> K-th Smallest Estimation</strong> flips this relationship: by observing <strong>θ</strong>,
                    the K-th smallest value, we can estimate the total count <strong>N ≈ (K / θ) − 1</strong>.
                </Typography>
            </StepSection>

            {/* Section 2: Requirements */}
            <StepSection step={2} title="Requirements for Practice" delay={0.2}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: 'text.secondary',
                        mb: 2,
                    }}
                >
                    To apply this in big data scenarios, we need these conditions:
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <InfoCard
                            icon={<TagIcon sx={{ fontSize: 22 }} />}
                            title="Uniform Hash Function"
                            description="Hash values uniformly distributed in (0,1), ensuring equal probability for any value."
                            delay={0.25}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <InfoCard
                            icon={<ScatterPlotIcon sx={{ fontSize: 22 }} />}
                            title="Sufficient Sample Size"
                            description="N large enough for hash values to be evenly distributed across the interval."
                            delay={0.3}
                        />
                    </Grid>
                </Grid>
            </StepSection>

            {/* Section 3: KMV Algorithm */}
            <StepSection step={3} title="KMV: The Implementation" isLast delay={0.35}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: 'text.secondary',
                        mb: 2,
                    }}
                >
                    KMV stores <strong>only</strong> K hash values in memory, regardless of stream size:
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <InfoCard
                            icon={<MemoryIcon sx={{ fontSize: 22 }} />}
                            title="Initialize"
                            description="Container for K smallest hash values (initially empty)."
                            delay={0.4}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <InfoCard
                            icon={<PlaylistAddIcon sx={{ fontSize: 22 }} />}
                            title="Process"
                            description="Hash to (0,1). If smaller than K-th, add and remove largest."
                            delay={0.45}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <InfoCard
                            icon={<FunctionsIcon sx={{ fontSize: 22 }} />}
                            title="Estimate"
                            description="Calculate N ≈ (K / θ) − 1 using K-th smallest value."
                            delay={0.5}
                        />
                    </Grid>
                </Grid>
            </StepSection>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 50,
            }}>
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={onClose}
                    sx={{
                        px: 5,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        letterSpacing: '0.03em',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                        animation: `${slideUp} 0.5s ease-out ${0.5}s both`,
                    }}
                >
                    Configure & Start Demo
                </Button>
            </div>
        </Container>
    );
}
