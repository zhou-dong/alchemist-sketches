import { useEffect, type ElementType } from 'react';
import { Box, Paper, Step, StepButton, StepConnector, Stepper, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import StepProgressIndicator from '../../components/StepProgressIndicator';
import KmvUnion from './KmvUnion';
import KmvIntersection from './KmvIntersection';
import KmvDifference from './KmvDifference';
import KmvSetOperationsIntroPage from './KmvSetOperationsIntro';

import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import JoinFullIcon from '@mui/icons-material/JoinFull';
import JoinInnerIcon from '@mui/icons-material/JoinInner';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import KmvLimitAndSolution from './KmvLimitAndSolution';

type Op = 'intro' | 'union' | 'intersection' | 'difference' | 'solution';

const OPS: { id: Op; label: string; Icon: ElementType }[] = [
    { id: 'intro', label: 'Intro', Icon: AutoStoriesIcon },
    { id: 'union', label: 'Union', Icon: JoinFullIcon },
    { id: 'intersection', label: 'Intersection', Icon: JoinInnerIcon },
    { id: 'difference', label: 'Difference', Icon: RemoveCircleOutlineIcon },
    { id: 'solution', label: 'Solution', Icon: LightbulbIcon },
];

function getOp(value: string | null): Op {
    if (value === 'intro' || value === 'intersection' || value === 'difference' || value === 'union' || value === 'solution') return value;
    return 'intro';
}

export default function KmvSetOperationsIndexPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { op: opParam } = useParams<{ op?: string }>();

    const op = getOp(opParam ?? null);

    // Keep old base route working by redirecting to /intro.
    // Also guards invalid route params.
    const isValidOp =
        opParam === 'intro' ||
        opParam === 'union' ||
        opParam === 'intersection' ||
        opParam === 'difference' ||
        opParam === 'solution';
    useEffect(() => {
        if (!isValidOp) {
            navigate('/sketches/theta/kmv-set-operations/intro', { replace: true });
        }
    }, [isValidOp, navigate]);

    const handleChange = (next: Op) => {
        navigate(`/sketches/theta/kmv-set-operations/${next}`);
    };

    const activeStep = OPS.findIndex((o) => o.id === op);
    const ICON_SIZE = 40;

    return (
        <>
            <StepProgressIndicator currentStepId={4} />

            {/* Left navigation overlay */}
            <Box
                sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '24px',
                    transform: 'translateY(-50%)',
                    zIndex: 100,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        border: 'none',
                        background: 'transparent',
                    }}
                >
                    <Stepper
                        nonLinear
                        connector={
                            <StepConnector
                                sx={{
                                    '&.MuiStepConnector-vertical': { ml: `${ICON_SIZE / 2}px` },
                                }}
                            />
                        }
                        activeStep={activeStep}
                        orientation="vertical"
                        sx={{
                            '& .MuiStepLabel-label': { fontWeight: 700 },
                            '& .MuiStepLabel-iconContainer': { pr: 1 },
                        }}
                    >
                        {OPS.map((o) => (
                            <Step key={o.id}>
                                <StepButton
                                    onClick={() => handleChange(o.id)}
                                    icon={<o.Icon sx={{ fontSize: 40, color: o.id === op ? theme.palette.primary.main : theme.palette.text.disabled }} />}
                                >
                                    {o.label}
                                </StepButton>
                            </Step>
                        ))}
                    </Stepper>
                </Paper>
            </Box>

            {/* Render exactly one animated page at a time */}
            {op === 'intro' && <KmvSetOperationsIntroPage />}
            {op === 'union' && <KmvUnion />}
            {op === 'intersection' && <KmvIntersection />}
            {op === 'difference' && <KmvDifference />}
            {op === 'solution' && <KmvLimitAndSolution />}
        </>
    );
}
