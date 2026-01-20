
import ThetaSketchOverview from './ThetaSketchOverview';
import StartButton from '../../components/StartButton';
import { useThetaSketchProgress } from '../../contexts/ThetaSketchProgressContext';
import NextPageButton from '@alchemist/theta-sketch/components/NextPageButton';

function ThetaSketchPageContent() {
    const { completeStep } = useThetaSketchProgress();
    const handleStart = () => {
        completeStep('theta-sketch');
    }

    return (
        <>
            <StartButton onStart={handleStart} />
            <NextPageButton nextPagePath="/theta-sketch/roadmap" title="Go to Roadmap" />
            <ThetaSketchOverview />
        </>
    );
}

export default ThetaSketchPageContent;
