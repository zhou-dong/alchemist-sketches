/**
 * Theme Picker Component
 * UI for switching between different themes
 */

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Typography,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckIcon from '@mui/icons-material/Check';
import { useTheme } from '@alchemist/shared/theme/ThemeContext';

// =============================================================================
// THEME CARD
// =============================================================================

interface ThemeCardProps {
  id: string;
  name: string;
  description: string;
  colors: [string, string, string];
  isSelected: boolean;
  onClick: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  name,
  description,
  colors,
  isSelected,
  onClick,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {/* Color preview */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          flexShrink: 0,
        }}
      >
        {colors.map((color, i) => (
          <Box
            key={i}
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: color,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </Box>

      {/* Theme info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, lineHeight: 1.2 }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Selected indicator */}
      {isSelected && (
        <CheckIcon sx={{ fontSize: 18, color: 'primary.main' }} />
      )}
    </Box>
  );
};

// =============================================================================
// THEME PICKER
// =============================================================================

export type BackgroundEffectsLevel = 'low' | 'balanced' | 'showcase';

interface ThemePickerProps {
  backgroundEffectsLevel: BackgroundEffectsLevel;
  onBackgroundEffectsLevelChange: (level: BackgroundEffectsLevel) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  backgroundEffectsLevel,
  onBackgroundEffectsLevelChange,
}) => {
  const { themeId, mode, availableThemes, setTheme, toggleMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Change theme">
        <IconButton
          onClick={handleOpen}
          color="primary"
          size="large"
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 280,
              maxWidth: 320,
              p: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Typography
          variant="subtitle2"
          sx={{ px: 1.5, py: 1, fontWeight: 600 }}
        >
          Appearance
        </Typography>

        {/* Dark/Light mode toggle */}
        <Box sx={{ px: 1.5, pb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={toggleMode}
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {mode === 'dark' ? (
                  <DarkModeIcon sx={{ fontSize: 18 }} />
                ) : (
                  <LightModeIcon sx={{ fontSize: 18 }} />
                )}
                <Typography variant="body2">
                  {mode === 'dark' ? 'Dark mode' : 'Light mode'}
                </Typography>
              </Box>
            }
            sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
            labelPlacement="start"
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Background effects level */}
        <Typography
          variant="caption"
          sx={{ px: 1.5, py: 0.5, color: 'text.secondary', display: 'block' }}
        >
          Background effects
        </Typography>
        <Box sx={{ px: 1.5, pb: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="background-effects-label">Performance</InputLabel>
            <Select
              labelId="background-effects-label"
              value={backgroundEffectsLevel}
              label="Performance"
              onChange={(event) => {
                onBackgroundEffectsLevelChange?.(event.target.value as BackgroundEffectsLevel);
              }}
            >
              <MenuItem value="low">Low (best for older Intel)</MenuItem>
              <MenuItem value="balanced">Balanced</MenuItem>
              <MenuItem value="showcase">Showcase</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Theme selection */}
        <Typography
          variant="caption"
          sx={{ px: 1.5, py: 0.5, color: 'text.secondary', display: 'block' }}
        >
          Theme
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {availableThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              id={theme.id}
              name={theme.name}
              description={theme.description}
              colors={theme.previewColors}
              isSelected={theme.id === themeId}
              onClick={() => {
                setTheme(theme.id as any);
                handleClose();
              }}
            />
          ))}
        </Box>
      </Popover>
    </>
  );
};

// =============================================================================
// THEME MODE TOGGLE (Simple dark/light toggle)
// =============================================================================

export const ThemeModeToggle: React.FC = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={toggleMode}
        color="primary"
        sx={{ width: 40, height: 40 }}
      >
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemePicker;

