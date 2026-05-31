'use client';
import { DashboardContent } from 'src/layouts/dashboard';

import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslation } from 'react-i18next';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function UserPermissionsView({ userPermissions }) {
  const { t } = useTranslation('dashboard/teams');
  console.log('this is the userPermissions', userPermissions);

  const groupPermissions = (permissions) => {
    const grouped = {};

    permissions?.forEach((perm) => {
      const parts = perm.split('.');
      let current = grouped;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? [] : {};
        }
        if (index === parts.length - 1) {
          current[part].push(perm);
        } else {
          current = current[part];
        }
      });
    });

    return grouped;
  };

  const formatPermissionName = (str) => {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  const renderPermissions = (permissionsObj) => {
    return Object.entries(permissionsObj).map(([key, value]) => {
      if (Array.isArray(value)) {
        return (
          <Box key={key} sx={{ ml: 3, mt: 0.5 }}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={3}>
              {value.map((perm) => (
                <Stack
                  key={perm}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: 220 }}
                >
                  <Checkbox checked onClick={(e) => e.preventDefault()} />
                  <Typography variant="body2">{formatPermissionName(key)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        );
      }

      return (
        <Box key={key} sx={{ ml: 2, mt: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#006A67', mb: 1 }}>
            {formatPermissionName(key)}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', ml: 2 }}>{renderPermissions(value)}</Box>
        </Box>
      );
    });
  };

  const grouped = groupPermissions(userPermissions);

  return (
    <DashboardContent>
      <Box mt={3}>
        {userPermissions?.length > 0 ? (
          <Box>{renderPermissions(grouped)}</Box>
        ) : (
          <EmptyContent
            filled
            sx={{ py: 10 }}
            title={t("role.no_permissions_found")}
            description={t("role.no_permissions_available_user")}
          />
        )}
      </Box>
    </DashboardContent>
  );
}
