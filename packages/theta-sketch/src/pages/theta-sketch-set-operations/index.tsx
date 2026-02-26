import { useEffect, type ElementType } from 'react';
import { Box, Paper, Step, StepButton, StepConnector, Stepper, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import StepProgressIndicator from '../../components/StepProgressIndicator';

import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import JoinInnerIcon from '@mui/icons-material/JoinInner';
import DifferenceIcon from '@mui/icons-material/Difference';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import ThetaSketchSetOperationsIntro from './ThetaSketchSetOperationsIntro';
import ThetaSketchUnion from './ThetaSketchUnion';
import ThetaSketchIntersection from './ThetaSketchIntersection';
import ThetaSketchDifference from './ThetaSketchDifference';
import ThetaSketchSetOperationsFinish from './ThetaSketchSetOperationsFinish';

type Op = 'intro' | 'union' | 'intersection' | 'difference' | 'finish';

const OPS: { id: Op; label: string; Icon: ElementType }[] = [
    { id: 'intro', label: 'Intro', Icon: AutoStoriesIcon },
    { id: 'union', label: 'Union', Icon: CallMergeIcon },
    { id: 'intersection', label: 'Intersection', Icon: JoinInnerIcon },
    { id: 'difference', label: 'Difference', Icon: DifferenceIcon },
    { id: 'finish', label: 'Finish', Icon: EmojiEventsIcon },
];

function getOp(value: string | null): Op {
    if (value === 'intro' || value === 'intersection' || value === 'difference' || value === 'union' || value === 'finish')
        return value;
    return 'intro';
};

export default function ThetaSketchSetOperationsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { op: opParam } = useParams<{ op?: string }>();
    const op = getOp(opParam ?? null);

    const isValidOp =
        opParam === 'intro' ||
        opParam === 'union' ||
        opParam === 'intersection' ||
        opParam === 'difference' ||
        opParam === 'finish';
    useEffect(() => {
        if (!isValidOp) {
            navigate('/sketches/theta/set-operations/intro', { replace: true });
        }
    }, [isValidOp, navigate]);

    const handleChange = (next: Op) => {
        navigate(`/sketches/theta/set-operations/${next}`);
    };

    const activeStep = OPS.findIndex((o) => o.id === op);
    const ICON_SIZE = 40;

    return (
        <>
            <StepProgressIndicator currentStepId={5} />
            <Box
                sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '24px',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                }}
            >
                <Paper elevation={0} sx={{ border: 'none', background: 'transparent' }}>
                    <Stepper
                        nonLinear
                        connector={<StepConnector sx={{ '&.MuiStepConnector-vertical': { ml: `${ICON_SIZE / 2}px` } }} />}
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

            {op === 'intro' && <ThetaSketchSetOperationsIntro />}
            {op === 'union' && <ThetaSketchUnion />}
            {op === 'intersection' && <ThetaSketchIntersection />}
            {op === 'difference' && <ThetaSketchDifference />}
            {op === 'finish' && <ThetaSketchSetOperationsFinish />}
        </>
    );
};
