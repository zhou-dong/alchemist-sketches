import React, { createContext, useContext, useMemo, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type StepStatus = 'completed' | 'current' | 'locked';

export interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    duration: string;
    route: string;
}

// Step definitions (without status - status is computed dynamically)
export const THETA_SKETCH_STEPS: RoadmapStep[] = [
    {
        id: 'order-statistics',
        title: 'Order Statistics',
        description: 'Understanding sorted values and their properties. The foundation for minimum-based estimation.',
        duration: '~5 min',
        route: '/theta-sketch/order-statistics',
    },
    {
        id: 'kse',
        title: 'K-th Smallest Estimation',
        description: 'How the k-th smallest value relates to the total count. The key insight behind KMV.',
        duration: '~8 min',
        route: '/theta-sketch/kse',
    },
    {
        id: 'kmv',
        title: 'KMV Algorithm',
        description: 'K Minimum Values - tracking the k smallest hashed values to estimate cardinality.',
        duration: '~10 min',
        route: '/theta-sketch/kmv',
    },
    {
        id: 'set-operations',
        title: 'Set Operations',
        description: 'Union, intersection, and difference. Combining sketches while preserving accuracy.',
        duration: '~8 min',
        route: '/theta-sketch/set-operations',
    },
    {
        id: 'theta-sketch',
        title: 'Theta Sketch',
        description: 'The complete algorithm - combining KMV with theta for efficient set operations.',
        duration: '~12 min',
        route: '/theta-sketch/theta-sketch',
    },
];

// =============================================================================
// CONTEXT
// =============================================================================

interface ThetaSketchProgressContextType {
    /** Set of completed step IDs */
    completedSteps: Set<string>;
    /** Mark a step as completed */
    completeStep: (stepId: string) => void;
    /** Reset all progress */
    resetProgress: () => void;
    /** Get status for a step (computed based on completed steps) */
    getStepStatus: (stepId: string) => StepStatus;
    /** Get all steps with their computed status */
    getStepsWithStatus: () => Array<RoadmapStep & { status: StepStatus }>;
    /** Check if a step is completed */
    isStepCompleted: (stepId: string) => boolean;
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
    const [completedStepsArray, setCompletedStepsArray] = React.useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
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
    const completeStep = useCallback((stepId: string) => {
        setCompletedStepsArray(prev => {
            if (prev.includes(stepId)) return prev;
            return [...prev, stepId];
        });
    }, []);

    // Reset all progress
    const resetProgress = useCallback(() => {
        setCompletedStepsArray([]);
    }, []);

    // Check if a step is completed
    const isStepCompleted = useCallback((stepId: string) => {
        return completedSteps.has(stepId);
    }, [completedSteps]);

    // Get status for a step
    // Logic: First incomplete step is "current", all before it are "completed", all after are "locked"
    const getStepStatus = useCallback((stepId: string): StepStatus => {
        const stepIndex = THETA_SKETCH_STEPS.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return 'locked';

        // Find the first incomplete step
        let firstIncompleteIndex = THETA_SKETCH_STEPS.findIndex(s => !completedSteps.has(s.id));
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
