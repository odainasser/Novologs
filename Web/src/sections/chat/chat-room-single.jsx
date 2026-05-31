import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';

import { CollapseButton } from './styles';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export function ChatRoomSingle({ participant, onlineUsers }) {
  const { t } = useTranslation('dashboard/chat');
  const collapse = useBoolean(true);

  const isOnline = onlineUsers?.some((u) => u.id === participant?.id);

  const renderInfo = (
    <Stack alignItems="center" sx={{ py: 2, position: 'relative' }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          alt={participant?.name}
          src={participant?.avatarUrl}
          sx={{ width: 80, height: 80, mb: 1 }}
        />
       {isOnline && (
        <Box
          sx={{
            position: 'absolute',
            left: -22,
            bottom: -20,
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: '#006A67',
            border: '2px solid white',
          }}
        />
      )}
      </Box>

      <Typography variant="subtitle1">{participant?.name}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {participant?.role}
      </Typography>
    </Stack>
  );

  const contactItems = [
    { icon: 'mingcute:location-fill', value: participant?.address },
    { icon: 'solar:phone-bold', value: participant?.phoneNumber },
    { icon: 'fluent:mail-24-filled', value: participant?.email },
  ];

  const filteredContactItems = contactItems.filter((item) => item.value && item.value.trim());

  const renderContact = (
    <Stack spacing={2} sx={{ px: 2, py: 1 }}>
      {filteredContactItems.length > 0 ? (
        filteredContactItems.map((item) => (
          <Stack
            key={item.icon}
            spacing={1}
            direction="row"
            sx={{ typography: 'body2', wordBreak: 'break-all' }}
          >
            <Iconify icon={item.icon} sx={{ flexShrink: 0, color: '#006A67' }} />
            {item.value}
          </Stack>
        ))
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No contact information available.
        </Typography>
      )}
    </Stack>
  );

  return (
    <>
      {renderInfo}

      <CollapseButton selected={collapse.value} onClick={collapse.onToggle}>
        {t('chat.information')}
      </CollapseButton>

      <Collapse in={collapse.value}>{renderContact}</Collapse>
    </>
  );
}
