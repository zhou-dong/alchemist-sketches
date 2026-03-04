import { Box, Typography, Card, CardActionArea, Chip, Fade, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EastIcon from '@mui/icons-material/East';

// =============================================================================
// SKETCH DATA
// =============================================================================

interface SketchInfo {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category: 'cardinality' | 'membership' | 'frequency' | 'sampling';
  status: 'available' | 'coming-soon' | 'planned';
  route?: string;
}

const sketches: SketchInfo[] = [
  {
    id: 'theta-sketch',
    name: 'Theta Sketch',
    symbol: 'θ',
    description: 'Estimate unique counts with set operations for counting distinct elements.',
    category: 'cardinality',
    status: 'available',
    route: '/sketches/theta',
  },
  {
    id: 'hyperloglog',
    name: 'HyperLogLog',
    symbol: 'HLL',
    description: 'Count distinct elements with minimal memory using probabilistic counting.',
    category: 'cardinality',
    status: 'coming-soon',
  },
  {
    id: 'bloom-filter',
    name: 'Bloom Filter',
    symbol: 'BF',
    description: 'Test set membership efficiently with zero false negatives.',
    category: 'membership',
    status: 'coming-soon',
  },
  {
    id: 'count-min-sketch',
    name: 'Count-Min Sketch',
    symbol: 'CM',
    description: 'Estimate frequency of elements in data streams.',
    category: 'frequency',
    status: 'planned',
  },
  {
    id: 'cuckoo-filter',
    name: 'Cuckoo Filter',
    symbol: 'CF',
    description: 'Membership testing with deletion support and better efficiency.',
    category: 'membership',
    status: 'planned',
  },
  {
    id: 'reservoir-sampling',
    name: 'Reservoir Sampling',
    symbol: 'RS',
    description: 'Maintain a uniform random sample from a stream.',
    category: 'sampling',
    status: 'planned',
  },
];

// =============================================================================
// CONFIG
// =============================================================================

const categoryLabels: Record<SketchInfo['category'], string> = {
  cardinality: 'Cardinality',
  membership: 'Membership',
  frequency: 'Frequency',
  sampling: 'Sampling',
};

const statusLabels: Record<SketchInfo['status'], string> = {
  available: 'Available',
  'coming-soon': 'Coming Soon',
  planned: 'Planned',
};

// =============================================================================
// SKETCH CARD COMPONENT
// =============================================================================

interface SketchCardProps {
  sketch: SketchInfo;
  index: number;
  onNavigate: (route: string) => void;
}

const SketchCard = ({ sketch, index, onNavigate }: SketchCardProps) => {
  const isAvailable = sketch.status === 'available' && sketch.route;
  const isPlanned = sketch.status === 'planned';

  return (
    <Fade in timeout={300 + index * 80}>
      <Card
        sx={{
          height: '100%',
          opacity: isPlanned ? 0.5 : 1,
          transition: 'all 0.25s ease',
          cursor: isAvailable ? 'pointer' : 'default',
          backgroundColor: 'transparent',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': isAvailable ? {
            transform: 'translateY(-6px)',
          } : {},
        }}
      >
        <CardActionArea
          onClick={() => isAvailable && onNavigate(sketch.route!)}
          disabled={!isAvailable}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            p: 0,
          }}
        >
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header: Symbol + Category */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              {/* Symbol */}
              <Typography
                sx={{
                  fontSize: sketch.symbol.length > 2 ? '1.8rem' : '2.2rem',
                  fontWeight: 300,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: 'primary.main',
                  lineHeight: 1,
                }}
              >
                {sketch.symbol}
              </Typography>

              {/* Category Badge */}
              <Chip
                label={categoryLabels[sketch.category]}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                }}
              />
            </Box>

            {/* Name */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontSize: '1.1rem',
              }}
            >
              {sketch.name}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                flex: 1,
                lineHeight: 1.6,
                fontSize: '0.875rem',
              }}
            >
              {sketch.description}
            </Typography>

            {/* Footer: Status + Action */}
            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isAvailable ? 'success.main' : 'text.disabled',
                  fontWeight: 500,
                }}
              >
                {statusLabels[sketch.status]}
              </Typography>

              {isAvailable && (
                <EastIcon
                  sx={{
                    fontSize: 18,
                    color: 'primary.main',
                    transition: 'transform 0.2s ease',
                    '.MuiCardActionArea-root:hover &': {
                      transform: 'translateX(4px)',
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </Fade>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Sketches = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const availableCount = sketches.filter(s => s.status === 'available').length;
  const totalCount = sketches.length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        pt: { xs: 10, md: 12 },
        pb: 8,
        px: { xs: 3, md: 6 },
      }}
    >
      {/* Content */}
      <Box
        sx={{
          maxWidth: 1000,
          mx: 'auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <Fade in={isLoaded} timeout={400}>
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Sketches
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 520,
                lineHeight: 1.7,
              }}
            >
              Explore probabilistic data structures for efficient streaming analytics.{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
                {availableCount} of {totalCount}
              </Box>{' '}
              available.
            </Typography>
          </Box>
        </Fade>

        {/* Sketch Grid */}
        <Grid container spacing={3}>
          {sketches.map((sketch, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sketch.id}>
              <SketchCard
                sketch={sketch}
                index={index}
                onNavigate={navigate}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Sketches;
