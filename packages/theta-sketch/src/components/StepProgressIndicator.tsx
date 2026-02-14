import { useState } from 'react';
import { Box, Typography, alpha, useTheme, Tooltip, Fade, Collapse } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useThetaSketchProgress, THETA_SKETCH_STEPS } from '../contexts/ThetaSketchProgressContext';

import * as Check from '@mui/icons-material/Check';
import * as ChevronRight from '@mui/icons-material/ChevronRight';
import * as Replay from '@mui/icons-material/Replay';

const CheckIcon = Check.default as unknown as React.ElementType;
const ChevronRightIcon = ChevronRight.default as unknown as React.ElementType;
const ReplayIcon = Replay.default as unknown as React.ElementType;

interface StepProgressIndicatorProps {
    /** Current step ID */
    currentStepId: string;
    /** Initial visibility state */
    defaultExpanded?: boolean;
}

export default function StepProgressIndicator({
    currentStepId,
    defaultExpanded = false,
}: StepProgressIndicatorProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { getStepStatus, completedSteps, resetProgress } = useThetaSketchProgress();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const currentIndex = THETA_SKETCH_STEPS.findIndex(s => s.id === currentStepId);
    const totalSteps = THETA_SKETCH_STEPS.length;
    const completedCount = THETA_SKETCH_STEPS.reduce(
        (count, step) => (completedSteps.has(step.id) ? count + 1 : count),
        0
    );
    const progressPercent = (completedCount / totalSteps) * 100;

    return (
        <Fade in timeout={400}>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 15,
                    left: 20,
                    minWidth: 200,
                }}
            >
                {/* Collapsed View - Compact circle */}
                <Tooltip
                    title={THETA_SKETCH_STEPS[currentIndex]?.title || 'Unknown'}
                    placement="right"
                    arrow
                >
                    <Box
                        onClick={() => setIsExpanded(!isExpanded)}
                        sx={{
                            position: 'relative',
                            // Match MUI large IconButton size (48px)
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            background: alpha(theme.palette.background.paper, 0.9),
                            backdropFilter: 'blur(1px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                                background: alpha(theme.palette.background.paper, 1),
                                borderColor: alpha(theme.palette.primary.main, 0.4),
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        {/* Background circle for progress ring */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 6,
                                borderRadius: '50%',
                                border: `2px solid ${alpha(theme.palette.divider, 0.15)}`,
                            }}
                        />
                        {/* Progress arc using conic gradient */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 6,
                                borderRadius: '50%',
                                background: `conic-gradient(
                                    ${theme.palette.primary.main} ${progressPercent * 3.6}deg,
                                    transparent ${progressPercent * 3.6}deg
                                )`,
                                mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
                                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
                            }}
                        />
                        {/* Center number */}
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: 'text.primary',
                                zIndex: 1,
                            }}
                        >
                            {currentIndex + 1}/{totalSteps}
                        </Typography>
                    </Box>
                </Tooltip>

                {/* Expanded View - Step list */}
                <Collapse in={isExpanded}>
                    <Box
                        sx={{
                            mt: 1,
                            p: 1.5,
                            borderRadius: 2,
                            background: alpha(theme.palette.background.paper, 0.9),
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        }}
                    >
                        {THETA_SKETCH_STEPS.map((step, index) => {
                            const status = getStepStatus(step.id);
                            const isCurrent = step.id === currentStepId;
                            const isCompleted = status === 'completed';
                            const isLocked = status === 'locked';
                            const isClickable = !isLocked && !isCurrent;

                            return (
                                <Tooltip
                                    key={step.id}
                                    title={isLocked ? 'Complete previous steps first' : step.description}
                                    placement="right"
                                    arrow
                                >
                                    <Box
                                        onClick={() => isClickable && navigate(step.route)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 1.5,
                                            cursor: isClickable ? 'pointer' : 'default',
                                            opacity: isLocked ? 0.4 : 1,
                                            background: isCurrent
                                                ? alpha(theme.palette.primary.main, 0.1)
                                                : 'transparent',
                                            transition: 'all 0.15s ease',
                                            '&:hover': isClickable ? {
                                                background: alpha(theme.palette.primary.main, 0.08),
                                            } : {},
                                        }}
                                    >
                                        {/* Step indicator */}
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                flexShrink: 0,
                                                ...(isCompleted && {
                                                    background: theme.palette.primary.main,
                                                    color: 'white',
                                                }),
                                                ...(isCurrent && !isCompleted && {
                                                    background: 'transparent',
                                                    border: `2px solid ${theme.palette.primary.main}`,
                                                    color: theme.palette.primary.main,
                                                }),
                                                ...(!isCurrent && !isCompleted && {
                                                    background: alpha(theme.palette.divider, 0.3),
                                                    color: 'text.secondary',
                                                }),
                                            }}
                                        >
                                            {isCompleted ? (
                                                <CheckIcon sx={{ fontSize: 24 }} />
                                            ) : (
                                                index + 1
                                            )}
                                        </Box>

                                        {/* Step title */}
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                flex: 1,
                                                fontWeight: isCurrent ? 800 : 600,
                                                color: isCurrent
                                                    ? 'primary.main'
                                                    : isCompleted
                                                        ? 'text.primary'
                                                        : 'text.secondary',
                                                fontSize: '1rem',
                                            }}
                                        >
                                            {step.title}
                                        </Typography>

                                        {/* Arrow for clickable */}
                                        {isClickable && (
                                            <ChevronRightIcon
                                                sx={{
                                                    fontSize: 16,
                                                    color: 'text.secondary',
                                                    opacity: 0.5,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Tooltip>
                            );
                        })}

                        {/* Progress bar at bottom */}
                        <Box sx={{ mt: 1.5, px: 1.5 }}>
                            <Box
                                sx={{
                                    height: 3,
                                    borderRadius: 1.5,
                                    background: alpha(theme.palette.divider, 0.2),
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: `${progressPercent}%`,
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        borderRadius: 1.5,
                                        transition: 'width 0.3s ease',
                                    }}
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    mt: 0.5,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '1rem',
                                    }}
                                >
                                    {completedCount} of {totalSteps} completed
                                </Typography>
                                {completedCount > 0 && (
                                    <Tooltip title="Reset Progress" placement="top" arrow>
                                        <Box
                                            onClick={resetProgress}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                cursor: 'pointer',
                                                color: 'text.secondary',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    background: alpha(theme.palette.error.main, 0.1),
                                                    color: 'error.main',
                                                },
                                            }}
                                        >
                                            <ReplayIcon sx={{ fontSize: 16 }} />
                                        </Box>
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Collapse>
            </Box>
        </Fade>
    );
}
