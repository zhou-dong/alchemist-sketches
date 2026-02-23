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
  SetOperationsPage,
  ThetaSketchPage,
  KmvSetOperationsIndexPage,
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
              <Route path="/" element={<Home />} />
              {/* Sketches list */}
              <Route path="/sketches" element={<Sketches />} />
              {/* Theta Sketch module routes */}
              <Route path="/theta-sketch" element={<ThetaSketchWelcome />} />
              <Route path="/theta-sketch/order-statistics" element={<OrderStatisticsPage />} />
              <Route path="/theta-sketch/kse" element={<KthSmallestPage />} />
              <Route path="/theta-sketch/kmv" element={<KmvPage />} />
              <Route path="/theta-sketch/kmv-set-ops" element={<KmvSetOperationsIndexPage />} />
              <Route path="/theta-sketch/set-operations" element={<SetOperationsPage />} />
              <Route path="/theta-sketch/theta-sketch" element={<ThetaSketchPage />} />
            </Routes>
          </Layout>
        </ThetaSketchProgressProvider>
      </StepStatusProvider>
    </ThemeContextProvider>
  );
}

export default App;
