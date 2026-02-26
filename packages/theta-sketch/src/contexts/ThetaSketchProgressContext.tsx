import React, { createContext, useContext, useMemo, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type StepStatus = 'completed' | 'current' | 'locked';

export interface RoadmapStep {
    id: number;
    title: string;
    route: string;
}

// Step definitions (without status - status is computed dynamically)
export const THETA_SKETCH_STEPS: RoadmapStep[] = [
    {
        id: 0,
        title: 'Introduction',
        route: '/theta-sketch',
    },
    {
        id: 1,
        title: 'Order statistics',
        route: '/theta-sketch/order-statistics',
    },
    {
        id: 2,
        title: 'Kth smallest estimation',
        route: '/theta-sketch/kse',
    },
    {
        id: 3,
        title: 'KMV algorithm',
        route: '/theta-sketch/kmv',
    },
    {
        id: 4,
        title: 'KMV Set operations',
        route: '/theta-sketch/kmv-set-operations/intro',
    },
    {
        id: 5,
        title: 'Theta sketch set operations',
        route: '/theta-sketch/set-operations/intro',
    },
];

// =============================================================================
// CONTEXT
// =============================================================================

interface ThetaSketchProgressContextType {
    /** Set of completed step IDs */
    completedSteps: Set<number>;
    /** Mark a step as completed */
    completeStep: (stepId: number) => void;
    /** Reset all progress */
    resetProgress: () => void;
    /** Get status for a step (computed based on completed steps) */
    getStepStatus: (stepId: number) => StepStatus;
    /** Get all steps with their computed status */
    getStepsWithStatus: () => Array<RoadmapStep & { status: StepStatus }>;
    /** Check if a step is completed */
    isStepCompleted: (stepId: number) => boolean;
}

const ThetaSketchProgressContext = createContext<ThetaSketchProgressContextType | undefined>(undefined);

// =============================================================================
// HOOK
// =============================================================================

export const useThetaSketchProgress = () => {
    const context = useContext(ThetaSketchProgressContext);
    if (!context) {
        throw new Error('useThetaSketchProgress must be used within a ThetaSketchProgressProvider');
    }
    return context;
};

// =============================================================================
// PROVIDER
// =============================================================================

const STORAGE_KEY = 'theta-sketch-progress';

interface ThetaSketchProgressProviderProps {
    children: React.ReactNode;
}

export const ThetaSketchProgressProvider: React.FC<ThetaSketchProgressProviderProps> = ({ children }) => {
    // Load from localStorage
    const [completedStepsArray, setCompletedStepsArray] = React.useState<number[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const parsed: unknown = saved ? JSON.parse(saved) : [];
            const raw = Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : [];
            return raw;
        } catch {
            return [];
        }
    });

    // Convert to Set for O(1) lookups
    const completedSteps = useMemo(() => new Set(completedStepsArray), [completedStepsArray]);

    // Save to localStorage whenever completedSteps changes
    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedStepsArray));
    }, [completedStepsArray]);

    // Mark a step as completed
    const completeStep = useCallback((stepId: number) => {
        setCompletedStepsArray(prev => {
            if (prev.includes(stepId)) return prev;
            return [...prev, stepId];
        });
    }, [setCompletedStepsArray]);

    // Reset all progress
    const resetProgress = useCallback(() => {
        setCompletedStepsArray([]);
    }, [setCompletedStepsArray]);

    // Check if a step is completed
    const isStepCompleted = useCallback((stepId: number) => {
        return completedSteps.has(stepId);
    }, [completedSteps]);

    // Get status for a step
    // Logic: First incomplete step is "current", all before it are "completed", all after are "locked"
    const getStepStatus = useCallback((stepId: number): StepStatus => {
        const stepIndex = THETA_SKETCH_STEPS.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return 'locked';

        // Find the first incomplete step
        const firstIncompleteIndex = THETA_SKETCH_STEPS.findIndex(s => !completedSteps.has(s.id));
        if (firstIncompleteIndex === -1) {
            // All steps completed
            return 'completed';
        }

        if (stepIndex < firstIncompleteIndex) {
            return 'completed';
        } else if (stepIndex === firstIncompleteIndex) {
            return 'current';
        } else {
            return 'locked';
        }
    }, [completedSteps]);

    // Get all steps with their computed status
    const getStepsWithStatus = useCallback(() => {
        return THETA_SKETCH_STEPS.map(step => ({
            ...step,
            status: getStepStatus(step.id),
        }));
    }, [getStepStatus]);

    const value = useMemo<ThetaSketchProgressContextType>(() => ({
        completedSteps,
        completeStep,
        resetProgress,
        getStepStatus,
        getStepsWithStatus,
        isStepCompleted,
    }), [completedSteps, completeStep, resetProgress, getStepStatus, getStepsWithStatus, isStepCompleted]);

    return (
        <ThetaSketchProgressContext.Provider value={value}>
            {children}
        </ThetaSketchProgressContext.Provider>
    );
};
