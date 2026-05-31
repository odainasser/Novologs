import { Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDate } from 'src/utils/format-time';

import { getUser, getTenantInfo } from 'src/actions/user-manage/userManageActions';

import { Label } from 'src/components/label';
import { isActive } from '@tiptap/core';

export function SystemDashboard() {
  const storedLang = localStorage.getItem('selectedLang');
  const getUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
  };
  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser(getUsersParams);
  const { tenant } = getTenantInfo();

  const superAdmin = usersList?.users.find((user) => user.code === 'ADMIN_INIT');
  return (
    <Grid container>
      <Grid xs={12} md={9}>
        <Box sx={{ p: 2, m: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  mb: 1,
                  fontWeight: 700,

                }}
              >
                License Period
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }} gap={1}>
                <Label
                  variant="soft"
                  sx={{
                    fontSize: '1rem',
                    padding: '16px 20px',
                    height: 'auto',
                  }}
                >
                  {fDate(tenant?.tenantInfo?.license?.startDate)}
                </Label>

                <Label
                  variant="soft"
                  sx={{
                    fontSize: '1rem',
                    padding: '16px 20px',
                    height: 'auto',
                  }}
                >
                  {fDate(tenant?.tenantInfo?.license?.endDate)}
                </Label>
              </Box>
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  mb: 1,
                  fontWeight: 700,

                }}
              >
                Tenant Info
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }} gap={1}>
                <Label
                  variant="soft"
                  sx={{
                    fontSize: '1rem',
                    padding: '16px 20px',
                    height: 'auto',
                  }}
                >
                  {tenant?.tenantInfo?.tenantName}
                </Label>
              </Box>
            </Box>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              mb: 1,
              fontWeight: 700,

            }}
          >
            Storage
          </Typography>
          <Box sx={{ display: 'flex', mb: 2 }} gap={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  mb: 1,
                }}
              >
                Total
              </Typography>
              <Label
                variant="soft"
                color="success"
                sx={{
                  fontSize: '1rem',
                  padding: '16px 20px',
                  height: 'auto',
                }}
              >
                {tenant?.tenantInfo?.storage?.totalGB} GB
              </Label>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  mb: 1,
                }}
              >
                Used
              </Typography>
              <Label
                variant="soft"
                color="warning"
                sx={{
                  fontSize: '1rem',
                  padding: '16px 20px',
                  height: 'auto',
                }}
              >
                {((tenant?.tenantInfo?.storage?.usedBytes ?? 0) / 1024 / 1024 / 1024).toFixed(2)} GB
              </Label>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  mb: 1,
                }}
              >
                Remaining
              </Typography>
              <Label
                variant="soft"
                color="info"
                sx={{
                  fontSize: '1rem',
                  padding: '16px 20px',
                  height: 'auto',
                }}
              >
                {((tenant?.tenantInfo?.storage?.remainingBytes ?? 0) / 1024 / 1024 / 1024).toFixed(
                  2
                )}{' '}
                GB
              </Label>
            </Box>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              mb: 1,
              fontWeight: 700,

            }}
          >
            Allowed Users
          </Typography>
          <Box sx={{ display: 'flex', mb: 2 }} gap={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  mb: 1,
                }}
              >
                Total
              </Typography>
              <Label
                variant="soft"
                color="success"
                sx={{
                  fontSize: '1rem',
                  padding: '16px 20px',
                  height: 'auto',
                }}
              >
                {tenant?.tenantInfo?.license?.totalUsers}
              </Label>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  mb: 1,
                }}
              >
                Used
              </Typography>
              <Label
                variant="soft"
                color="warning"
                sx={{
                  fontSize: '1rem',
                  padding: '16px 20px',
                  height: 'auto',
                }}
              >
                {tenant?.tenantInfo?.license?.usedUsers}
              </Label>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  mb: 1,
                }}
              >
                Remaining
              </Typography>
              <Label
                variant="soft"
                color="info"
                sx={{
                  fontSize: '1rem',
                  padding: '16px 20px',
                  height: 'auto',
                }}
              >
                {tenant?.tenantInfo?.license?.remainingUsers}
              </Label>
            </Box>
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              mb: 1,
              fontWeight: 700,

            }}
          >
            User Info
          </Typography>

          <Box component="ul">
            {tenant?.users.map((member) => (
              <UserList key={member?.id} employee={member} />
            ))}
          </Box>
        </Box>
      </Grid>
      <Grid xs={12} md={3}>
        <Typography
          variant="subtitle1"
          sx={{
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            m: 1,
            mt: 3,
            fontWeight: 700,
         
          }}
        >
          Super Admin Details
        </Typography>
        <Box sx={{ p: 2, m: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Tooltip title={superAdmin?.email} arrow>
              <Avatar
                alt={superAdmin?.fullName}
                src={superAdmin?.profileImageFileUrl}
                sx={{ mr: 2 }}
              >
                {!superAdmin?.profileImageFileUrl && superAdmin?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>

            <ListItemText
              secondary={
                <div>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#000' }}>
                    {superAdmin?.fullName}
                  </span>

                  <br />
                  <span style={{ fontSize: '0.75rem' }}>
                    Id : {String(superAdmin?.serial).padStart(4, '0') || 'Not available'}
                  </span>
                  <br />
                  <span style={{ fontSize: '0.75rem' }}>
                    Code : {superAdmin?.code || 'Not available'}
                  </span>
                  <br />

                  <span style={{ fontSize: '0.75rem' }}>
                    Designation: {superAdmin?.designationName?.value || 'Not available'}
                  </span>
                  <br />
                  <span style={{ fontSize: '0.7rem' }}>
                    Department: {superAdmin?.departmentName?.value || 'Not available'}
                  </span>
                  <br />

                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: superAdmin?.lastWorkStatus?.workStatus?.color,
                    }}
                  >
                    Status :{' '}
                    {superAdmin?.lastWorkStatus?.workStatus?.name?.value || 'Not available'}
                  </span>
                </div>
              }
              primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
              secondaryTypographyProps={{ noWrap: true, component: 'span' }}
              sx={{ flexGrow: 1, pr: 1 }}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export function UserList({ employee }) {
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <Tooltip title={employee?.email} arrow>
        <Avatar alt={employee?.fullName} src={employee?.profileImageUrl} sx={{ mr: 2 }}>
          {!employee?.profileImageUrl && employee?.fullName?.charAt(0).toUpperCase()}
        </Avatar>
      </Tooltip>

      <ListItemText
        secondary={
          <div>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#000' }}>
              {employee?.fullName}
            </span>

            <br />
            <span style={{ fontSize: '0.75rem' }}>
              Id : {String(employee?.serial).padStart(4, '0') || 'Not available'}
            </span>
            <br />
            <span style={{ fontSize: '0.75rem' }}>Code : {employee?.code || 'Not available'}</span>
            <span style={{ margin: '0 2px' }}> , </span>
            <span style={{ fontSize: '0.75rem' }}>
              Designation: {employee?.designation || 'Not available'}
            </span>
            <br />
            <span style={{ fontSize: '0.7rem' }}>
              Department: {employee?.department || 'Not available'}
            </span>
            {/* <span style={{ margin: '0 2px' }}> , </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: employee?.lastWorkStatus?.workStatus?.color,
              }}
            >
              Status : {employee?.lastWorkStatus?.workStatus?.name?.value || 'Not available'}
            </span> */}
            <br />
            <Label
              variant="soft"
              color={employee?.isActive ? 'success' : 'error'}
              sx={{
                flexShrink: 0,
              }}
            >
              {employee?.isActive ? 'Active' : 'Deactivated'}
            </Label>
          </div>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{ noWrap: true, component: 'span' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      <Box sx={{ display: 'flex', mb: 2 }} gap={1}>
        {/* <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="subtitle2"
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              mb: 1,
            }}
          >
            Total
          </Typography>
          <Label variant="soft" color="success">
            3000 GB
          </Label>
        </Box> */}

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="subtitle2"
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              mb: 1,
            }}
          >
            Used Storage
          </Typography>
          <Label variant="soft" color="warning">
            {((employee?.storageUsed ?? 0) / 1024 / 1024 / 1024).toFixed(2)} GB
          </Label>
        </Box>
      </Box>
    </Box>
  );
}
