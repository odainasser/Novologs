import { FaWindows } from 'react-icons/fa';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function ProfileCover({ name, avatarUrl, role, coverUrl, country, email, phoneNumber }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const theme = useTheme();
  const userRights = [
    {
      id: 37,
      moduleId: 1,
      moduleAccessId: 1,
      name: 'Create',
      isSelected: true,
      moduleName: 'Project',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Create Projects',
      refinedArabicName: 'إنشاء المشاريع',
    },
    {
      id: 38,
      moduleId: 1,
      moduleAccessId: 2,
      name: 'ViewAll',
      isSelected: true,
      moduleName: 'Project',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'View All projects details',
      refinedArabicName: 'عرض تفاصيل جميع المشاريع (حتى إذا لم يكن عضوًا)',
    },
    {
      id: 39,
      moduleId: 2,
      moduleAccessId: 3,
      name: 'Create',
      isSelected: false,
      moduleName: 'Meeting',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Create Meetings',
      refinedArabicName: 'إنشاء الاجتماعات',
    },
    {
      id: 40,
      moduleId: 3,
      moduleAccessId: 4,
      name: 'ViewAll',
      isSelected: true,
      moduleName: 'Client',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'View All clients ',
      refinedArabicName: 'عرض جميع العملاء (حتى إذا لم يكن عضوًا)',
    },
    {
      id: 41,
      moduleId: 4,
      moduleAccessId: 5,
      name: 'Create',
      isSelected: true,
      moduleName: 'Employee',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Mark as admin',
      refinedArabicName:
        'التعيين كمدير (يمكن للمدير عرض لوحة تحكم المدير، إضافة/حذف الموظفين، تعديل الهيكل التنظيمي، عرض تفاصيل الموظفين، إلخ.)',
    },
    {
      id: 42,
      moduleId: 5,
      moduleAccessId: 6,
      name: 'Management',
      isSelected: true,
      moduleName: 'Loyalty',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Manage loyalty system',
      refinedArabicName: 'إدارة نظام الولاء (إنشاء المكافآت، الموافقة على الطلبات، إلخ)',
    },
    {
      id: 43,
      moduleId: 7,
      moduleAccessId: 8,
      name: 'CreateAI',
      isSelected: true,
      moduleName: 'Task',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Create AI Task',
      refinedArabicName: 'إنشاء مهمة بالذكاء الاصطناعي',
    },
    {
      id: 44,
      moduleId: 8,
      moduleAccessId: 9,
      name: 'Management',
      isSelected: true,
      moduleName: 'HR',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'HR Management',
      refinedArabicName: 'إدارة الموارد البشرية',
    },
    {
      id: 45,
      moduleId: 9,
      moduleAccessId: 10,
      name: 'Target',
      isSelected: true,
      moduleName: 'Sales',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Set Sales Target',
      refinedArabicName: 'تحديد الهدف البيعي',
    },
    {
      id: 7,
      moduleId: 6,
      moduleAccessId: 7,
      name: 'Create',
      isSelected: false,
      moduleName: 'Workflow',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Create Workflows',
      refinedArabicName: 'إنشاء سير عمل',
    },
    {
      id: 11,
      moduleId: 4,
      moduleAccessId: 11,
      name: 'NoAssigneTasks',
      isSelected: false,
      moduleName: 'Employee',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Prevent assigning tasks',
      refinedArabicName: 'منع اسناد المهام',
    },
    {
      id: 12,
      moduleId: 10,
      moduleAccessId: 12,
      name: 'EditSystemSettings',
      isSelected: false,
      moduleName: 'System',
      createdOn: '0001-01-01T00:00:00.0000000+00:00',
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      refinedName: 'Edit System Setting',
      refinedArabicName: 'تحرير اعدادات النظام',
    },
  ];
  return (
    <>
      <Box
        // sx={{
        //   ...bgGradient({
        //     color: `0deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.8)}, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.8)}`,
        //     imgUrl: coverUrl,
        //   }),
        //   height: 1,
        //   color: 'common.white',
        // }}
        sx={{ display: 'flex', justifyContent: 'space-between', m: 2 }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems="center"
          spacing={2} // Adds spacing between items
          sx={
            {
              // left: { md: 24 },
              // top: { md: 5 },
              // zIndex: { md: 10 },
              // pt: { xs: 6, md: 0 },
              // position: { md: 'absolute' },
            }
          }
        >
          <Avatar
            alt={name}
            src={avatarUrl}
            sx={{
              width: { xs: 64, md: 128 },
              height: { xs: 64, md: 128 },
              border: `solid 2px ${theme.vars.palette.common.white}`,
            }}
          >
            {name?.charAt(0).toUpperCase()}
          </Avatar>

          <Stack spacing={0.5}>
            <ListItemText
              primary={name}
              primaryTypographyProps={{ typography: 'h4' }}
              secondaryTypographyProps={{
                color: 'inherit',
                component: 'span',
                typography: 'body2',
                sx: { opacity: 0.48 },
              }}
            />
            <Typography variant="body2" sx={{ fontSize: '0.87rem' }}>
              IT - Web Developer
            </Typography>

            <Typography variant="body2" sx={{ fontSize: '0.87rem' }}>
              {email}
            </Typography>

            <Typography variant="body2" sx={{ fontSize: '0.87rem' }}>
              {phoneNumber}
            </Typography>

            {/* <Box sx={{ display: 'flex' }}>
              <Stack
                spacing={1}
                direction="row"
                sx={{ wordBreak: 'break-all', typography: 'body2' }}
              >
                <Label variant="soft" color="warning">
                  5
                </Label>
                <Typography sx={{ fontSize: '0.87rem' }}> {t('clients.labels.days_off')}</Typography>
              </Stack>
              <Stack
                spacing={1}
                direction="row"
                sx={{ wordBreak: 'break-all', typography: 'body2', ml: 2 }}
              >
                <Label variant="soft" color="info">
                  12
                </Label>
                <Typography sx={{ fontSize: '0.87rem' }}>{t('clients.labels.days_reported')}</Typography>
              </Stack>
              <Stack
                spacing={1}
                direction="row"
                sx={{ wordBreak: 'break-all', typography: 'body2', ml: 2 }}
              >
                <Label variant="soft" color="success">
                  30
                </Label>
                <Typography sx={{ fontSize: '0.87rem' }}>{t('clients.labels.days_work')}</Typography>
              </Stack>
            </Box> */}
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'column' }} alignItems="end" spacing={2}>
          <Label variant="soft" color="success">
            On Duty
          </Label>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2">{t('clients.sales_report.total_points')}</Typography>
            <Label variant="soft" color="warning">
              1000
            </Label>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2">{t('clients.sales_report.device')}</Typography>
            <FaWindows style={{ width: '18px', height: '18px', color: '#00A4EF' }} />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ ml: 2 }}>
        {/* <CardHeader title="User Permissions" /> */}
        <Grid container sx={{ mt: 2 }}>
          {userRights
            ?.filter(
              (permission, index, self) =>
                index === self.findIndex((p) => p.refinedName === permission.refinedName)
            )
            .map((permission) => (
              <Grid
                item
                key={permission.refinedName}
                sx={{ display: 'flex', alignItems: 'flex-start' }}
              >
                <Checkbox
                  checked={permission.isSelected}
                  indeterminate={!permission.isSelected}
                  sx={{
                    pointerEvents: 'none',
                    '&.MuiCheckbox-indeterminate': {
                      color: 'error.main',
                    },
                  }}
                />
                <Typography style={{ marginLeft: 8 }} sx={{ fontSize: '0.875rem', mt: 1 }}>
                  {permission.refinedName}
                </Typography>
              </Grid>
            ))}
        </Grid>
      </Box>
    </>
  );
}
