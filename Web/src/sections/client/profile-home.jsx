import { useRef } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { fNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useTranslation } from 'react-i18next';

import { AppTaskDetails } from 'src/sections/overview/app/app-task-details';

// ----------------------------------------------------------------------

export function ProfileHome({ info, posts }) {
  const {t, i18n } = useTranslation('dashboard/client');



  const fileRef = useRef(null);

  const handleAttach = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const renderFollows = (
    <Card sx={{ py: 3, textAlign: 'center', typography: 'h4' }}>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
      >
        <Stack width={1}>
          {fNumber(info.totalFollowers)}
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            Follower
          </Box>
        </Stack>

        <Stack width={1}>
          {fNumber(info.totalFollowing)}
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            Following
          </Box>
        </Stack>
      </Stack>
    </Card>
  );

  const renderAbout = (
    <Card>
      <CardHeader title="About" />

      <Stack spacing={2} sx={{ p: 3, typography: 'body2' }}>
        <Box>{info.quote}</Box>

        <Box display="flex">
          <Iconify width={24} icon="mingcute:location-fill" sx={{ mr: 2 }} />
          Live at
          <Link variant="subtitle2" color="inherit">
            &nbsp;{info.country}
          </Link>
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="fluent:mail-24-filled" sx={{ mr: 2 }} />
          {info.email}
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="ic:round-business-center" sx={{ mr: 2 }} />
          {info.role} {`at `}
          <Link variant="subtitle2" color="inherit">
            &nbsp;{info.company}
          </Link>
        </Box>

        <Box display="flex">
          <Iconify width={24} icon="ic:round-business-center" sx={{ mr: 2 }} />
          {`Studied at `}
          <Link variant="subtitle2" color="inherit">
            &nbsp;{info.school}
          </Link>
        </Box>
      </Stack>
    </Card>
  );

  const renderPostInput = (
    <Card sx={{ p: 3 }}>
      <InputBase
        multiline
        fullWidth
        rows={4}
        placeholder="Share what you are thinking here..."
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 1,
          border: (theme) => `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
        }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <Fab size="small" color="inherit" variant="softExtended" onClick={handleAttach}>
            <Iconify icon="solar:gallery-wide-bold" width={24} sx={{ color: 'success.main' }} />
            Image/Video
          </Fab>

          <Fab size="small" color="inherit" variant="softExtended">
            <Iconify icon="solar:videocamera-record-bold" width={24} sx={{ color: 'error.main' }} />
            Streaming
          </Fab>
        </Stack>

        <Button variant="contained">Post</Button>
      </Stack>

      <input ref={fileRef} type="file" style={{ display: 'none' }} />
    </Card>
  );

  const renderSocials = (
    <Card>
      <CardHeader title="Task Details" />

      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
          <Label variant="soft" color="warning">
            24
          </Label>
          <Typography> Active tasks</Typography>
        </Stack>
        <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
          <Label variant="soft" color="info">
            12
          </Label>
          <Typography> Not active</Typography>
        </Stack>
        <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
          <Label variant="soft" color="success">
            5
          </Label>
          <Typography> Completed</Typography>
        </Stack>
      </Stack>
    </Card>
  );

  const renderProjects = (
    <Card>
      <CardHeader title="Projects" />
      <Box
        sx={{
          maxHeight: 310,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 10,
          },
        }}
      >
        <Stack spacing={2} sx={{ p: 3 }}>
          <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.light',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {`Hawala App`.charAt(0).toUpperCase()}
            </Avatar>
            <ListItemText
              primary="Hawala App"
              secondary={
                <span>
                  <Typography component="span" fontWeight="bold">
                    15
                  </Typography>{' '}
                  pending tasks
                </span>
              }
              primaryTypographyProps={{ typography: 'body1' }}
              secondaryTypographyProps={{
                color: 'inherit',
                component: 'span',
                typography: 'body2',
                fontSize: '0.87rem',
                sx: { opacity: 0.48 },
              }}
            />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'secondary.light',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {`Islam Web`.charAt(0).toUpperCase()}
            </Avatar>
            <ListItemText
              primary="Islam Web"
              secondary={
                <span>
                  <Typography component="span" fontWeight="bold">
                    13
                  </Typography>{' '}
                  pending tasks
                </span>
              }
              primaryTypographyProps={{ typography: 'body1' }}
              secondaryTypographyProps={{
                color: 'inherit',
                component: 'span',
                typography: 'body2',
                fontSize: '0.87rem',
                sx: { opacity: 0.48 },
              }}
            />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.light',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {`Hawala App`.charAt(0).toUpperCase()}
            </Avatar>
            <ListItemText
              primary="Hawala App"
              secondary={
                <span>
                  <Typography component="span" fontWeight="bold">
                    21
                  </Typography>{' '}
                  pending tasks
                </span>
              }
              primaryTypographyProps={{ typography: 'body1' }}
              secondaryTypographyProps={{
                color: 'inherit',
                component: 'span',
                typography: 'body2',
                fontSize: '0.87rem',
                sx: { opacity: 0.48 },
              }}
            />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'secondary.light',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {`Islam Web`.charAt(0).toUpperCase()}
            </Avatar>
            <ListItemText
              primary="Islam Web"
              secondary={
                <span>
                  <Typography component="span" fontWeight="bold">
                    3
                  </Typography>{' '}
                  pending tasks
                </span>
              }
              primaryTypographyProps={{ typography: 'body1' }}
              secondaryTypographyProps={{
                color: 'inherit',
                component: 'span',
                typography: 'body2',
                fontSize: '0.87rem',
                sx: { opacity: 0.48 },
              }}
            />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.light',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {`Hawala App`.charAt(0).toUpperCase()}
            </Avatar>
            <ListItemText
              primary="Hawala App"
              secondary={
                <span>
                  <Typography component="span" fontWeight="bold">
                    23
                  </Typography>{' '}
                  pending tasks
                </span>
              }
              primaryTypographyProps={{ typography: 'body1' }}
              secondaryTypographyProps={{
                color: 'inherit',
                component: 'span',
                typography: 'body2',
                fontSize: '0.87rem',
                sx: { opacity: 0.48 },
              }}
            />
          </Stack>

          <Stack spacing={2} direction="row" sx={{ wordBreak: 'break-all', typography: 'body2' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'info.light',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {`Tairra`.charAt(0).toUpperCase()}
            </Avatar>
            <ListItemText
              primary="Tairra"
              secondary={
                <span>
                  <Typography component="span" fontWeight="bold">
                    3
                  </Typography>{' '}
                  pending tasks
                </span>
              }
              primaryTypographyProps={{ typography: 'body1' }}
              secondaryTypographyProps={{
                color: 'inherit',
                component: 'span',
                typography: 'body2',
                fontSize: '0.87rem',
                sx: { opacity: 0.48 },
              }}
            />
          </Stack>
        </Stack>
      </Box>
    </Card>
  );

  const renderSales = (
    <Card>
      <CardHeader title="Sales" />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> Total Clients</Typography>
          <Label variant="soft" color="warning">
            5
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> Total Leads</Typography>
          <Label variant="soft" color="info">
            2
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>Sales Target</Typography>
          <Label variant="soft" color="success">
            5000
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>Leads Amount</Typography>
          <Label variant="soft" color="warning">
            3000
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>Awarded Amount</Typography>
          <Label variant="soft" color="success">
            2000
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> Rejected Amount</Typography>
          <Label variant="soft" color="error">
            1000
          </Label>
        </Stack>
      </Stack>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={6}>
        <AppTaskDetails
          title="Tasks Year to Date"
          chart={{
            series: [
              { label: 'Completed on time', value: 12 },
              { label: 'Completed late', value: 5 },
              { label: 'Overdue', value: 1 },
              { label: 'Working on', value: 7 },
              { label: 'Not Started', value: 3 },
              { label: 'On hold', value: 2 },
              { label: 'Waiting for approval', value: 4 },
            ],
          }}
        />
      </Grid>
      <Grid xs={12} md={3}>
        <Stack spacing={3}>{renderProjects}</Stack>
      </Grid>
      <Grid xs={12} md={3}>
        <Stack spacing={3}>{renderSales}</Stack>
      </Grid>
    </Grid>
  );
}
