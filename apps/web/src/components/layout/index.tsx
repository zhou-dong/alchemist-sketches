import { Box, styled, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { ThemePicker, type BackgroundEffectsLevel } from './ThemePicker';
import { FloatingParticles, GlowOrbs } from '@alchemist/shared';
import { useLocalStorage } from '@alchemist/shared';

const placementStyles = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
};

interface ButtonContainerProps {
    placement: keyof typeof placementStyles;
}

const ButtonContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'placement',
})<ButtonContainerProps>(({ placement }) => ({
    position: 'fixed',
    ...placementStyles[placement],
    zIndex: 100,
}));

const Header = () => {
    const navigate = useNavigate();
    return (
        <IconButton
            onClick={() => navigate('/')}
            aria-label="Go to home page"
            color="primary"
            size="large"
        >
            <HomeIcon />
        </IconButton>
    );
};

const BACKGROUND_PRESETS: Record<BackgroundEffectsLevel, { orbPreset: 'minimal' | 'teal-violet' | 'vibrant'; particleCount: number }> = {
    low: { orbPreset: 'minimal', particleCount: 24 },
    balanced: { orbPreset: 'teal-violet', particleCount: 40 },
    showcase: { orbPreset: 'vibrant', particleCount: 80 },
};

const Background = ({ level }: { level: BackgroundEffectsLevel }) => (
    <>
        <GlowOrbs preset={BACKGROUND_PRESETS[level].orbPreset} />
        <FloatingParticles particleCount={BACKGROUND_PRESETS[level].particleCount} />
    </>
);

export const Layout = ({ children }: { children: ReactNode }) => {
    const [backgroundEffectsLevel, setBackgroundEffectsLevel] = useLocalStorage<BackgroundEffectsLevel>(
        'background-effects-level',
        'balanced'
    );

    return (
        <>
            <Background level={backgroundEffectsLevel} />

            <ButtonContainer placement="top-left">
                <Header />
            </ButtonContainer>

            <ButtonContainer placement="top-right">
                <ThemePicker
                    backgroundEffectsLevel={backgroundEffectsLevel}
                    onBackgroundEffectsLevelChange={setBackgroundEffectsLevel}
                />
            </ButtonContainer>

            <ButtonContainer placement="bottom-right">
                <ThemeToggle />
            </ButtonContainer>

            {children}
        </>
    );
};

export default Layout;
