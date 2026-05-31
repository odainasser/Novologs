'use client';

import { useState } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Dialog,
  Avatar,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

import { navData } from 'src/layouts/config-nav-dashboard';
import { getUserDetail } from 'src/actions/user-manage/userManageActions';
import { DashboardContent } from 'src/layouts/dashboard';

export function ShowHideMenu({ userId }) {
  const { userDetails, userDetailsLoading, userDetailsError, mutate } = getUserDetail(userId);

  const menuItems = navData?.[0]?.items || [];

  const [hiddenMenus, setHiddenMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const isHidden = selectedMenu ? hiddenMenus.includes(selectedMenu.id) : false;

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedMenu) return;

    setHiddenMenus((prev) =>
      prev.includes(selectedMenu.id)
        ? prev.filter((id) => id !== selectedMenu.id)
        : [...prev, selectedMenu.id]
    );

    setOpenConfirm(false);
    setSelectedMenu(null);
  };

  const handleClose = () => {
    setOpenConfirm(false);
    setSelectedMenu(null);
  };

  const renderView = (
    <>
      {userId && (
        <CustomBreadcrumbs
          heading="Show / Hide Menu"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Users', href: paths.dashboard.user.list },
            {
              name: (
                <span style={{ fontSize: '18px', fontWeight: 500 }}>
                  {userDetails?.details?.fullName}{' '}
                </span>
              ),
            },
          ]}
          sx={{ mb: 1 }}
        />
      )}

      <Box sx={userId ? { p: 0 } : { p: 3 }}>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          {userId ? (
            <Typography variant="body2" color="text.secondary">
              Click any menu to hide or show it in the sidebar for the user <strong>{userDetails?.details?.fullName}</strong>.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Click any menu to hide or show it in the sidebar.
            </Typography>
          )}
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}
        >
          {menuItems.map((item) => {
            const hidden = hiddenMenus.includes(item.id);

            return (
              <Card
                key={item.id}
                onClick={() => handleMenuClick(item)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderRadius: 2,
                  // border: '1px solid',
                  // borderColor: '#ffffff',
                  bgcolor: hidden ? 'error.lighter' : '#ffffff',
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: hidden ? 'error.main' : '#006A67',
                      color: '#fff',
                      width: 42,
                      height: 42,
                    }}
                  >
                    {item.icon}
                  </Avatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {item.title}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.path}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={hidden ? 'Hidden' : 'Visible'}
                    color={hidden ? 'error' : 'success'}
                    variant="soft"
                  />
                </Stack>
              </Card>
            );
          })}
        </Box>

        <Dialog open={openConfirm} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogTitle>{isHidden ? 'Show this menu?' : 'Hide this menu?'}</DialogTitle>

          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to {isHidden ? 'show' : 'hide'}{' '}
              <strong>{selectedMenu?.title}</strong> menu?
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>

            <Button
              variant="contained"
              onClick={handleConfirm}
              sx={{
                bgcolor: isHidden ? '#006A67' : 'error.main',
                '&:hover': {
                  bgcolor: isHidden ? '#005B58' : 'error.dark',
                },
              }}
            >
              {isHidden ? 'Show Menu' : 'Hide Menu'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
  return <>{userId ? <DashboardContent>{renderView}</DashboardContent> : <>{renderView}</>}</>;
}
