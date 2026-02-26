import { CssBaseline } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { ThemeContextProvider, GlobalAnimationStyles } from '@alchemist/shared';
import { Layout } from './components/layout';
import { StepStatusProvider } from '../../../packages/shared/src/components/roadmap/contexts/StepStatusContext';
import Home from './pages/Home';
import Sketches from './pages/Sketches';
// Import theta-sketch module
import {
  ThetaSketchWelcome,
  ThetaSketchProgressProvider,
  OrderStatisticsPage,
  KthSmallestPage,
  KmvPage,
  KmvSetOperationsPage,
  ThetaSketchSetOperationsPage,
} from '@alchemist/theta-sketch';

function App() {
  return (
    <ThemeContextProvider defaultTheme="neo-glass" defaultMode="dark">
      <StepStatusProvider>
        <ThetaSketchProgressProvider>
          <CssBaseline />
          <GlobalAnimationStyles />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />˝
              {/* Sketches list */}
              <Route path="/sketches" element={<Sketches />} />
              {/* Theta Sketch module routes */}
              <Route path="/sketches/theta" element={<ThetaSketchWelcome />} />
              <Route path="/sketches/theta/order-statistics" element={<OrderStatisticsPage />} />
              <Route path="/sketches/theta/kse" element={<KthSmallestPage />} />
              <Route path="/sketches/theta/kmv" element={<KmvPage />} />
              <Route path="/sketches/theta/kmv-set-operations" element={<KmvSetOperationsPage />} />
              <Route path="/sketches/theta/kmv-set-operations/:op" element={<KmvSetOperationsPage />} />
              <Route path="/sketches/theta/set-operations" element={<ThetaSketchSetOperationsPage />} />
              <Route path="/sketches/theta/set-operations/:op" element={<ThetaSketchSetOperationsPage />} />
            </Routes>
          </Layout>
        </ThetaSketchProgressProvider>
      </StepStatusProvider>
    </ThemeContextProvider>
  );
}

export default App;
