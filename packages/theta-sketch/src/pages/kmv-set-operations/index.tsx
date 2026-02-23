import type { ElementType } from 'react';
import { Box, Paper, Step, StepButton, StepConnector, Stepper, useTheme } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import StepProgressIndicator from '../../components/StepProgressIndicator';
import KmvUnion from './KmvUnion';
import KmvIntersection from './KmvIntersection';
import KmvDifference from './KmvDifference';

import JoinFullIcon from '@mui/icons-material/JoinFull';
import JoinInnerIcon from '@mui/icons-material/JoinInner';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import KmvLimitAndSolution from './KmvLimitAndSolution';

type Op = 'union' | 'intersection' | 'difference' | 'limit-and-solution';

const OPS: { id: Op; label: string; Icon: ElementType }[] = [
    { id: 'union', label: 'Union', Icon: JoinFullIcon },
    { id: 'intersection', label: 'Intersection', Icon: JoinInnerIcon },
    { id: 'difference', label: 'Difference', Icon: RemoveCircleOutlineIcon },
    { id: 'limit-and-solution', label: 'θ Solution', Icon: LightbulbIcon },
];

function getOp(value: string | null): Op {
    if (value === 'intersection' || value === 'difference' || value === 'union' || value === 'limit-and-solution') return value;
    return 'union';
}

export default function KmvSetOperationsIndexPage() {
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();

    const op = getOp(searchParams.get('op'));

    const handleChange = (next: Op) => {
        setSearchParams((prev) => {
            const p = new URLSearchParams(prev);
            p.set('op', next);
            return p;
        });
    };

    const activeStep = OPS.findIndex((o) => o.id === op);
    const ICON_SIZE = 40;

    return (
        <>
            <StepProgressIndicator currentStepId="set-operations" />

            {/* Left navigation overlay */}
            <Box
                sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '24px',
                    transform: 'translateY(-50%)',
                    zIndex: 1300,
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
            {op === 'union' && <KmvUnion />}
            {op === 'intersection' && <KmvIntersection />}
            {op === 'difference' && <KmvDifference />}
            {op === 'limit-and-solution' && <KmvLimitAndSolution />}
        </>
    );
}
