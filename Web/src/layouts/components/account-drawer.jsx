'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { _mock } from 'src/_mock';
import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateAvatar } from 'src/components/animate';

import { useMockedUser } from 'src/auth/hooks';

import { UpgradeBlock } from './nav-upgrade';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';
import { useAuthContext } from 'src/auth/hooks';
import { Dialog } from '@mui/material';
import { ChangePassword } from 'src/sections/account-settings/change-password';
import { EditProfile } from 'src/sections/account-settings/edit-profile';
import { ChangeStatus } from 'src/sections/account-settings/change-status';
import { AddAccount } from 'src/sections/account-settings/add-account';

import { useTranslation } from 'react-i18next';
import { getSSOLinks, generateToken } from 'src/actions/ssoLinks/ssoActions';
import { toast } from 'src/components/snackbar';
import ListItemText from '@mui/material/ListItemText';

// ----------------------------------------------------------------------

export function AccountDrawer({ data = [], anchor = 'right', sx, ...other }) {
  const { t, i18n } = useTranslation('dashboard/sign');
  const { zetaUser, checkUserSession } = useAuthContext();
  const {
    ssoLinks,
    ssoLinksLoading,
    ssoLinksError,
    mutate: mutateLinks,
  } = getSSOLinks(zetaUser?.id);

  console.log('this is the ssoLinks', ssoLinks.linkedTo);

  const storedLang = localStorage.getItem('selectedLang');

  const theme = useTheme();

  const router = useRouter();

  const pathname = usePathname();

  const { user } = useMockedUser();

  const [open, setOpen] = useState(false);

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSSOLogin = async (link) => {
    try {
      const response = await generateToken({ tenantUsersLinkedToId: link.id });
      const { ssoToken, targetDomain } = response?.response?.data?.successStatus || {};

      if (response?.success && ssoToken && targetDomain) {
        // const redirectUrl = `https://${targetDomain}/dashboard/sso-login?ssoToken=${encodeURIComponent(ssoToken)}`;
        const redirectUrl = `https://${targetDomain}/auth/jwt/sign-in/?ssoToken=${encodeURIComponent(ssoToken)}`;
        window.location.href = redirectUrl;
      } else {
        toast.error(response.error || 'Failed to generate SSO token');
      }
    } catch (error) {
      console.error('Generate token:', error);
      toast.error(error);
    }
  };

  const handleClickItem = useCallback(
    (path) => {
      handleCloseDrawer();
      router.push(path);
    },
    [handleCloseDrawer, router]
  );

  const renderAvatar = (
    <AnimateAvatar
      width={96}
      slotProps={{
        avatar: { src: zetaUser?.profileImageFileUrl, alt: zetaUser?.fullName },
        overlay: {
          border: 2,
          spacing: 3,
          color: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0)} 25%, ${theme.vars.palette.primary.main} 100%)`,
        },
      }}
    >
      {zetaUser?.fullName?.charAt(0).toUpperCase()}
    </AnimateAvatar>
  );
  const [pwDialogOpen, setPWDialogOpen] = useState(false);

  const handleOpenPWDialog = useCallback(() => {
    setPWDialogOpen(true);
    handleCloseDrawer();
  });

  const handleClosePWDialog = useCallback(() => {
    setPWDialogOpen(false);
  });

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleOpenProfileDialog = useCallback(() => {
    setProfileDialogOpen(true);
    handleCloseDrawer();
  });

  const handleCloseProfileDialog = useCallback(() => {
    setProfileDialogOpen(false);
  });

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const handleOpenStatusDialog = useCallback(() => {
    setStatusDialogOpen(true);
    handleCloseDrawer();
  });

  const handleCloseStatusDialog = useCallback(() => {
    setStatusDialogOpen(false);
  });

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  const handleOpenAccountDialog = useCallback(() => {
    setAccountDialogOpen(true);
  });

  const handleCloseAccountDialog = useCallback(() => {
    setAccountDialogOpen(false);
  });
  return (
    <>
      <AccountButton
        onClick={handleOpenDrawer}
        photoURL={zetaUser?.profileImageFileUrl || zetaUser?.fullName?.charAt(0).toUpperCase()}
        displayName={zetaUser?.fullName}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 320 } }}
        anchor={anchor}
      >
        <IconButton
          onClick={handleCloseDrawer}
          sx={{ top: 12, left: 12, zIndex: 9, position: 'absolute' }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Stack alignItems="center" sx={{ pt: 8, pb: 1 }}>
            {renderAvatar}

            <Typography variant="subtitle1" noWrap sx={{ mt: 2 }}>
              {zetaUser?.fullName}
            </Typography>
            <Typography variant="subtitle2" noWrap sx={{ color: 'text.secondary', mt: 0.5 }}>
              {zetaUser?.designationName?.value}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
              {zetaUser?.email}
            </Typography>
            {/* <Label color="warning" sx={{ mt: 1 }}>
              {zetaUser?.lastWorkStatus?.workStatus?.name?.value || 'On Duty'}
            </Label> */}
            <Label
              variant="soft"
              color={
                !zetaUser?.lastWorkStatus?.workStatus?.name?.value
                  ? 'success'
                  : zetaUser?.lastWorkStatus.workStatus.name.value === 'On Duty'
                    ? 'success'
                    : 'warning'
              }
            >
              {
                storedLang === 'ar'
                  ? zetaUser?.lastWorkStatus?.workStatus?.name.localizedStrings?.find(
                      (ls) => ls.language.toLowerCase() === 'ar'
                    )?.value ||
                    zetaUser?.lastWorkStatus?.workStatus?.name.value ||
                    'على رأس العمل'
                  : zetaUser?.lastWorkStatus?.workStatus?.name.value || 'On Duty'
              }
            </Label>
          </Stack>

          <Stack
            direction="column"
            spacing={1}
            flexWrap="wrap"
            justifyContent="center"
            sx={{ p: 3 }}
          >
            {/* {[...Array(3)].map((_, index) => (
              <Tooltip
                key={_mock.fullName(index + 1)}
                title={`Switch to: ${_mock.fullName(index + 1)}`}
              >
                <Avatar
                  alt={_mock.fullName(index + 1)}
                  src={_mock.image.avatar(index + 1)}
                  onClick={() => {}}
                />
              </Tooltip>
            ))}

            <Tooltip title={t('labels.add_account')}>
              <IconButton
                sx={{
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  border: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.32)}`,
                }}
              >
                <Iconify icon="mingcute:add-line" />
              </IconButton>
            </Tooltip> */}
            <Box key="linkedAccounts">
              <Box sx={{ display: 'flex' }} justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ ml: 1, mb: 1 }}>
                  {t('labels.linked_accounts')}
                </Typography>
                <Tooltip title={t('labels.add_account')}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      handleOpenAccountDialog();
                    }}
                    sx={{
                      width: 20,
                      height: 20,
                      ml: 2,
                      bgcolor: '#006A67',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      cursor: 'pointer',
                    }}
                  >
                    <Iconify icon="mingcute:add-line" />
                  </IconButton>
                </Tooltip>
              </Box>

              {ssoLinks?.linkedTo?.map((link) => (
                <MenuItem
                  key={link.id}
                  onClick={() => handleSSOLogin(link)}
                  sx={{
                    py: 1,
                    color: 'text.secondary',
                    fontSize: 14,
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  <Iconify
                    icon="solar:link-bold-duotone"
                    color="#006A67"
                    sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
                    width={13}
                    height={13}
                  />
                  <Avatar
                    alt={link?.targetUserFullName}
                    src={link?.targetUserProfilePictureUrl}
                    sx={{ mr: 2 }}
                  >
                    {(!link?.targetUserProfilePictureUrl &&
                      link?.targetUserFullName?.charAt(0).toUpperCase()) ||
                      link?.targetDomain?.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    secondary={
                      <>
                        <div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {link?.targetUserFullName || 'Not Available'}
                          </span>

                          <br />
                          <span style={{ fontSize: '0.75rem' }}> {link.targetDomain}</span>
                        </div>
                      </>
                    }
                    primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
                    secondaryTypographyProps={{ noWrap: true, component: 'span' }}
                    sx={{ flexGrow: 1, pr: 1 }}
                  />
                </MenuItem>
              ))}
            </Box>
          </Stack>

          <Stack
            sx={{
              py: 3,
              px: 2.5,
              borderTop: `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            {data.map((option) => {
              const rootLabel = pathname.includes('/dashboard') ? 'Home' : 'Dashboard';

              const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;

              return (
                <MenuItem
                  key={option.labelKey}
                  onClick={() => {
                    const labelKey = option.labelKey;
                    if (labelKey === 'changeStatus') {
                      handleOpenStatusDialog();
                    } else if (labelKey === 'editProfile') {
                      handleOpenProfileDialog();
                    } else if (labelKey === 'changePassword') {
                      handleOpenPWDialog();
                    } else {
                      handleClickItem(labelKey === 'home' ? rootHref : option.href);
                    }
                  }}
                  sx={{
                    py: 1,
                    color: 'text.secondary',
                    '& svg': { width: 24, height: 24 },
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {option.icon}

                  <Box component="span" sx={{ ml: 2 }}>
                    {t(`labels.${option.labelKey}`)}
                  </Box>

                  {option.info && (
                    <Label color="error" sx={{ ml: 1 }}>
                      {option.info}
                    </Label>
                  )}
                </MenuItem>
              );
            })}
          </Stack>

          {/* <Box sx={{ px: 2.5, py: 3 }}>
            <UpgradeBlock />
          </Box> */}
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={handleCloseDrawer} />
        </Box>
      </Drawer>
      <Dialog
        open={pwDialogOpen}
        onClose={handleClosePWDialog}
        fullWidth
        maxWidth="sm"
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <ChangePassword handleClosePWDialog={handleClosePWDialog} userEmail={zetaUser?.email} />
      </Dialog>

      <Dialog
        open={profileDialogOpen}
        onClose={handleCloseProfileDialog}
        fullWidth
        maxWidth="sm"
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <EditProfile
          handleCloseProfileDialog={handleCloseProfileDialog}
          zetaUser={zetaUser}
          checkUserSession={checkUserSession}
        />
      </Dialog>
      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatusDialog}
        fullWidth
        maxWidth="sm"
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <ChangeStatus
          handleCloseStatusDialog={handleCloseStatusDialog}
          zetaUser={zetaUser}
          checkUserSession={checkUserSession}
        />
      </Dialog>
      <Dialog
        open={accountDialogOpen}
        onClose={handleCloseAccountDialog}
        fullWidth
        maxWidth="sm"
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <AddAccount
          handleCloseAccountDialog={handleCloseAccountDialog}
          zetaUser={zetaUser}
          checkUserSession={checkUserSession}
          mutateLinks={mutateLinks}
        />
      </Dialog>
    </>
  );
}
