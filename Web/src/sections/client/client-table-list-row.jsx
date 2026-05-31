'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import ListItemText from '@mui/material/ListItemText';
import { fDate } from 'src/utils/format-time';

import Typography from '@mui/material/Typography';
import { useMockedUser } from 'src/auth/hooks';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import { ClientMembers } from './client-members';
import { AddClientDetails } from './add-client-details';
import { AddUserImage } from 'src/sections/user/add-user-image';

import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

import { toast } from 'src/components/snackbar';
import { emirates } from 'src/sections/client/client-mock-data';
import { updateVendor } from 'src/actions/vendor/vendorActions';
import { updateClient } from 'src/actions/client/clientActions';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ClientTableListRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  index,
  onOpenRow,
  setTableData,
  isClientView,
  tableData,
  mutate,
  settingsList,
  isPurchaseClient,
}) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const confirm = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();
  const [mode, setMode] = useState('view');

  const [members, setMembers] = useState(false);
  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };

  const defaultProvinceValue = settingsList?.find(
    (setting) => setting.key === 'defaultProvince'
  )?.value;

  const provinceSettings = settingsList?.filter(
    (setting) => setting.key === `province${defaultProvinceValue}`
  );
  const { user } = useMockedUser();
  const [editingClientId, setEditingClientId] = useState(null);
  const [newClientId, setNewClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmirate, setNewEmirate] = useState('');

  const [openImage, setOpenImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [preview, setPreview] = useState('');
  const [profileImageFileId, setProfileImageFileId] = useState('');

  console.log('this is the avatar URL', avatarUrl);
  useEffect(() => {
    if (typeof avatarUrl === 'string') {
      setPreview(avatarUrl);
    } else if (avatarUrl instanceof File) {
      setPreview(URL.createObjectURL(avatarUrl));
    }
  }, [avatarUrl]);

  const handleOpenImage = () => {
    setOpenImage(true);
  };
  const handleImageDialogClose = () => {
    setTimeout(() => {
      setOpenImage(false);
    }, 100);
  };

  const [details, setDetails] = useState(false);
  const handleOpenDetails = () => {
    setDetails(true);
  };
  const handleDetailsDialogClose = () => {
    setTimeout(() => {
      setDetails(false);
    }, 100);
  };

  const handleEditClient = (client) => {
    setEditingClientId(client.id);
    setNewClientId(client.code);
    setNewClientName(client.name);
    setNewEmail(client.email);
    setNewEmirate(client.emirate);
    setAddress(client.address);
    setPhoneNumber(client.phonenumber);
    setWebsite(client.website);
  };
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const addNewDetails = (details) => {
    details.address = address;
    details.phoneNumber = phoneNumber;
    details.website = website;

    const location = details?.location;

    setLatitude(location?.lat ?? 25.2048);
    setLongitude(location?.lng ?? 55.2708);
  };

  const handleUpdateClient = async () => {
    const payload = {
      id: editingClientId,
      code: newClientId,
      name: newClientName,
      email: newEmail,
      emirate: newEmirate,
      avatarUrl: preview || row.avatarUrl,
      address: address || row.address,
      phonenumber: phoneNumber || row.phonenumber,
      website: website || row.website,
      logoFileId: profileImageFileId || row?.logoFileId,
      locationLatitude: latitude || row?.locationLatitude,
      locationLongitude: longitude || row?.locationLongitude,
    };
    console.log('this is the payload', payload);
    try {
      let response;
      if (isClientView) {
        response = await updateClient(payload);
      } else {
        response = await updateVendor(payload);
      }
      if (response.success) {
        toast.success(
          isClientView ? t('clients.toast.client_update') : t('clients.toast.vendor_update')
        );
        setTableData(
          tableData.map((client) =>
            client.id === editingClientId
              ? {
                  ...client,
                  code: newClientId,
                  name: newClientName,
                  email: newEmail,
                  emirate: newEmirate,
                  avatarUrl: preview || row.avatarUrl,
                  address: address || row.address,
                  phonenumber: phoneNumber || row.phonenumber,
                  website: website || row.website,
                }
              : client
          )
        );
        setEditingClientId(null);
        setNewClientId('');
        setNewClientName('');
        setNewEmail('');
        setNewEmirate('');
        setAvatarUrl(null);
        setPreview('');
        setProfileImageFileId('');
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Update client failed:', error);
    }
  };
  const clearField = () => {
    setEditingClientId(null);
  };
  const creatorName = row?.creator?.fullName || t('clients.labels.no_availble');
  const hasActionAccess = row?.creatorId === zetaUser?.id;
  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell
          sx={{
            cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
          onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
        >
          <Box>{index + 1}</Box>
        </TableCell>
        <TableCell
          sx={{
            cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
        >
          <Typography
            variant={row?.serial != null ? 'body2' : 'caption'}
            fontWeight={row?.serial != null ? 'bold' : 'normal'}
          >
            {row?.serial != null ? String(row.serial).padStart(4, '0') : 'Not Available'}
          </Typography>
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
        >
          {editingClientId === row.id ? (
            <TextField
              fullWidth
              size="small"
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateClient();
                }
              }}
              autoFocus
            />
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Typography
                variant={row?.code ? 'body1' : 'caption'}
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {row?.code || 'Not Available'}
              </Typography>
            </Box>
          )}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Avatar
              alt={row?.creator?.fullName}
              src={row?.creator?.profileImageFileUrl}
              sx={{ width: 30, height: 30 }}
            >
              {!row?.creator?.profileImageFileUrl && row?.creator?.fullName?.charAt(0)}
            </Avatar>

            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <ListItemText
                primary={creatorName}
                secondary={`On: ${fDate(row?.created) || t('clients.labels.no_availble')}`}
                primaryTypographyProps={{
                  typography: 'body1',
                  sx: {
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  },
                }}
                secondaryTypographyProps={{
                  component: 'span',
                  typography: 'caption',
                  sx: {
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  },
                }}
              />
            </Box>
          </Box>
        </TableCell>
        <TableCell
          sx={{
            cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            minWidth: 250,
          }}
          onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
        >
          <Box display="flex" gap={2} alignItems="center">
            {editingClientId === row.id ? (
              <Avatar
                onClick={() => {
                  setOpenImage(true);
                }}
                src={preview || row?.logoFileUrl}
                sx={{
                  width: 40,
                  height: 40,
                  cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
                }}
              />
            ) : (
              <Box>
                <Avatar alt={row?.name} src={row?.logoFileUrl} sx={{ width: 40, height: 40 }}>
                  {!row?.logoFileUrl && row?.name?.charAt(0)}
                </Avatar>
              </Box>
            )}

            {editingClientId === row.id ? (
              <TextField
                fullWidth
                size="small"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateClient();
                  }
                }}
                autoFocus
              />
            ) : (
              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {row?.name || t('clients.labels.no_availble')}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {row?.address || 'Address not available'}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
        >
          {editingClientId === row.id ? (
            <TextField
              fullWidth
              size="small"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateClient();
                }
              }}
              autoFocus
            />
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ mt: 0.5 }}>
                <Iconify icon="eva:email-fill" sx={{ color: '#006A67' }} width={13} />
              </Box>

              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {' '}
                  {row?.email || t('clients.labels.no_availble')}
                </Typography>
              </Box>
            </Box>
          )}
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
        >
          {editingClientId === row.id ? (
            <TextField
              select
              fullWidth
              value={newEmirate}
              onChange={(e) => setNewEmirate(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateClient();
                }
              }}
              autoFocus
              sx={{
                '& .MuiInputBase-input': {
                  padding: '9px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-5px',
                  fontSize: '10px',
                },
              }}
            >
              {provinceSettings?.length > 0 &&
                JSON.parse(provinceSettings[0].value).map((item) => (
                  <MenuItem key={item.symbol} value={item.name.value}>
                    {item.name.value}
                  </MenuItem>
                ))}
            </TextField>
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {row?.emirate || t('clients.labels.no_availble')}
              </Typography>
            </Box>
          )}
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={editingClientId ? 'center' : storedLang === 'ar' ? 'right' : 'left'}
          onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
        >
          {editingClientId === row.id ? (
            <Tooltip title={t('clients.labels.edit_client_details')} arrow>
              <IconButton
                onClick={() => {
                  setDetails(true);
                }}
              >
                <Iconify icon="mdi:account-edit" sx={{ color: '#006A67' }} />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ mt: 0.5 }}>
                  <Iconify icon="eva:link-2-fill" sx={{ color: '#006A67' }} width={13} />
                </Box>

                <Box
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {' '}
                    {row?.website || 'Website not available'}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ mt: 0.5 }}>
                  <Iconify icon="eva:phone-fill" sx={{ color: '#006A67' }} width={13} />
                </Box>

                <Box
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {' '}
                    {row?.phonenumber || t('clients.labels.no_availble')}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </TableCell>
        {!isPurchaseClient && (
          <>
            {isClientView ? (
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                  cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                }}
                align={storedLang === 'ar' ? 'right' : 'left'}
                onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    {row.leadCount || '0'}
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {t('clients.columns.leads')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center">
                    {row?.leadAmount
                      ? `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row?.leadAmount)}`
                      : `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)}`}
                  </Stack>
                </Box>
              </TableCell>
            ) : (
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                  cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                }}
                align={storedLang === 'ar' ? 'right' : 'left'}
                onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    {row.contractCount || '0'}
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {t('clients.tabs.contracts')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center">
                    {row?.contractAmount
                      ? `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row?.contractAmount)}`
                      : `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)}`}
                  </Stack>
                </Box>
              </TableCell>
            )}

            {isClientView && (
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                  cursor: !isPurchaseClient && editingClientId !== row.id ? 'pointer' : 'default',
                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                }}
                align={storedLang === 'ar' ? 'right' : 'left'}
                onClick={!isPurchaseClient && editingClientId !== row.id ? onOpenRow : undefined}
              >
                <Box
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    <Typography
                      variant="caption"
                      color="#003161"
                      sx={{
                        mr: 1,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {t('clients.columns.sales')}
                    </Typography>
                    {row?.salesAmount
                      ? `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row?.salesAmount)}`
                      : `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)}`}
                  </Stack>

                  <Stack direction="row" alignItems="center">
                    <Typography
                      variant="caption"
                      color="error.main"
                      sx={{
                        mr: 1,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {t('clients.labels.rejected')}
                    </Typography>
                    {row?.rejectedAmount
                      ? `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row?.rejectedAmount)}`
                      : `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)}`}
                  </Stack>
                </Box>
              </TableCell>
            )}
          </>
        )}

        <TableCell
          align="center"
          sx={{
            ...(storedLang === 'ar' && {
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }),
          }}
        >
          {editingClientId === row.id ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateClient}
                  size="small"
                  sx={{
                    bgcolor: '#006A67',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    textTransform: 'none',
                    padding: '4px 10px',
                  }}
                >
                  {t('clients.buttons.update')}
                </Button>
                <Tooltip title={t('clients.buttons.cancel')} arrow>
                  <Iconify
                    icon="mdi:close-circle"
                    onClick={() => clearField()}
                    sx={{
                      cursor: 'pointer',
                      height: 13,
                      width: 13,
                      color: 'error.main',
                      ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                    }}
                  />
                </Tooltip>
              </Box>
            </>
          ) : (
            <>
              {hasActionAccess && (
                <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              )}
            </>
          )}
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: {
            placement: storedLang === 'ar' ? 'left-top' : 'right-top',
          },
        }}
        sx={{
          ...(storedLang === 'ar' && {
            direction: 'rtl',
            textAlign: 'right',
          }),
        }}
      >
        <MenuList>
          {((isClientView && zetaUser?.permissions?.includes('Client.Update')) ||
            (!isClientView && zetaUser?.permissions?.includes('Vendor.Update'))) && (
            <MenuItem
              onClick={() => {
                handleEditClient(row);
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" color="#006A67" />
              {t('clients.buttons.edit')}
            </MenuItem>
          )}
          {((isClientView && zetaUser?.permissions?.includes('Client.Delete')) ||
            (!isClientView && zetaUser?.permissions?.includes('Vendor.Delete'))) && (
            <MenuItem
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
              {t('clients.buttons.delete')}
            </MenuItem>
          )}
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('clients.buttons.delete')}
        content={t('clients.dialog.delete_content2')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('clients.buttons.delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <AddClientDetails
        open={details}
        onClick={handleOpenDetails}
        handleClose={handleDetailsDialogClose}
        setAddress={setAddress}
        setPhoneNumber={setPhoneNumber}
        address={address}
        website={website}
        setWebsite={setWebsite}
        phoneNumber={phoneNumber}
        addNewDetails={addNewDetails}
        isClientView={isClientView}
        latitude={row?.locationLatitude}
        longitude={row?.locationLongitude}
      />

      <AddUserImage
        open={openImage}
        onClick={handleOpenImage}
        handleClose={handleImageDialogClose}
        avatarUrl={avatarUrl || row?.logoFileUrl}
        setAvatarUrl={setAvatarUrl}
        setProfileImageFileId={setProfileImageFileId}
      />
    </>
  );
}
