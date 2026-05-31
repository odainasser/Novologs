'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import SpeedDial from '@mui/material/SpeedDial';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import { _socials } from 'src/_mock';
import { varAlpha, bgGradient } from 'src/theme/styles';
import { TwitterIcon, FacebookIcon, LinkedinIcon, InstagramIcon } from 'src/assets/icons';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PostDetailsHero({ title, author, coverUrl, createdAt }) {
  const theme = useTheme();

  const smUp = useResponsive('up', 'sm');

  return (
    <Box
      sx={{
        ...(coverUrl
          ? {
              // If coverUrl exists, apply the gradient background with the image
              ...bgGradient({
                color: `0deg, ${varAlpha(
                  theme.vars.palette.grey['900Channel'],
                  0.44
                )}, ${varAlpha(theme.vars.palette.grey['900Channel'], 0.64)}`,
                imgUrl: coverUrl,
              }),
              height: 480,
              backgroundSize: 'contain',
            }
          : {
              backgroundColor: 'white',
              height: 200,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 5,
            }),
        overflow: 'hidden',
      }}
    >
      <Container sx={{ height: 1, position: 'relative' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            zIndex: 9,
            color: coverUrl ? 'common.white' : 'text.primary', // Black text when no coverUrl
            position: coverUrl ? 'absolute' : 'relative',
            maxWidth: 480,
            pt: coverUrl ? { xs: 2, md: 8 } : 0, // Adjust padding when no coverUrl
          }}
        >
          {title}
        </Typography>

        <Stack
          sx={{
            left: 0,
            width: 1,
            bottom: 0,
            position: 'absolute',
          }}
        >
          {author && createdAt && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{ px: { xs: 2, md: 3 }, pb: { xs: 3, md: 8 } }}
            >
              <Avatar
                alt={author.fullName}
                src={author.profileImageUrl}
                sx={{ width: 64, height: 64, mr: 2 }}
              />

              <ListItemText
                sx={{ color: 'common.white' }}
                primary={author.fullName}
                secondary={fDate(createdAt)}
                primaryTypographyProps={{ typography: 'subtitle1', mb: 0.5 }}
                secondaryTypographyProps={{
                  color: 'inherit',
                  sx: { opacity: 0.64 },
                }}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
