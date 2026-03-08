import { useMemo } from 'react';
import { Box, keyframes } from "@mui/material";

const particleFloat = keyframes`
  0%, 100% { 
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  25% { 
    transform: translate(20px, -30px) scale(1.2);
    opacity: 0.9;
  }
  50% { 
    transform: translate(-15px, -20px) scale(0.8);
    opacity: 0.7;
  }
  75% { 
    transform: translate(10px, 25px) scale(1.1);
    opacity: 0.8;
  }
`;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  delay: number;
}

const generateParticle = (): Particle => {
  return {
    id: Math.random(),
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.6 + 0.3,
    vx: (Math.random() - 0.5) * 0.1,
    vy: (Math.random() - 0.5) * 0.1,
    delay: Math.random() * 5
  };
};

const FloatingParticle = ({ particle }: { particle: Particle }) => (
  <Box
    key={particle.id}
    sx={{
      position: 'fixed',
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: particle.size,
      height: particle.size,
      borderRadius: '50%',
      background: `radial-gradient(circle, 
          rgba(99, 102, 241, ${particle.opacity}) 0%, 
          rgba(139, 92, 246, ${particle.opacity * 0.7}) 50%, 
          transparent 100%
        )`,
      // Small particles don't need expensive glow shadows.
      boxShadow: particle.size >= 4.5
        ? `0 0 ${particle.size * 2.5}px rgba(99, 102, 241, ${particle.opacity * 0.45})`
        : 'none',
      pointerEvents: 'none',
      zIndex: -1,
      animation: `${particleFloat} ${15 + particle.id % 10}s ease-in-out infinite`,
      animationDelay: `${particle.delay}s`
    }}
  />
);

const generateParticles = (count: number): Array<Particle> => {
  return Array.from({ length: count }, () => generateParticle());
};

const FloatingParticles = ({ particleCount }: { particleCount: number }) => {

  const particles: Array<Particle> = useMemo(() => generateParticles(particleCount), [particleCount]);

  return (
    <>
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} />
      ))}
    </>
  );
}

export { FloatingParticles};
