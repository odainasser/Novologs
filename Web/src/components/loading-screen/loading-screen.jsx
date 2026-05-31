'use client';

import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

export function LoadingScreen({ portal, sx, ...other }) {
  const content = (
    <Box
      sx={{
        px: 5,
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
      {...other}
    >
      <LinearProgress
        sx={{
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#2FBBA8',
          },
          backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
        }}
      />
    </Box>
  );

  if (portal) {
    return <Portal>{content}</Portal>;
  }

  return content;
}

