import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fToNow } from 'src/utils/format-time';

export function MentionNavItem({ mention, collapse, onClick }) {
  const previewText =
    mention.contentType === 'image' ? 'Sent a photo' : mention.body || 'This message was deleted';

  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          py: 1.5,
          px: 2.5,
          gap: 2,
        }}
      >
        <Avatar
          alt={mention.sender?.fullName}
          src={mention.sender?.profileImageUrl}
          sx={{ width: 35, height: 35 }}
        />

        {!collapse && (
          <>
            <ListItemText
              primary={mention.sender?.fullName || 'Unknown Sender'}
              primaryTypographyProps={{
                noWrap: true,
                component: 'span',
                variant: 'subtitle2',
              }}
              secondary={
                mention.contentType === 'image' ? (
                  'Sent a photo'
                ) : mention.body ? (
                  mention.body
                ) : (
                  <>
                    <span style={{ fontStyle: 'italic', color: '#9e9e9e' }}>
                      This message was deleted
                    </span>
                  </>
                )
              }
              secondaryTypographyProps={{
                noWrap: true,
                component: 'span',
                variant: 'body2',
                color: 'text.secondary',
              }}
            />

            <Stack alignItems="flex-end" sx={{ alignSelf: 'stretch' }}>
              <Typography
                noWrap
                variant="body2"
                component="span"
                sx={{ mb: 1.5, fontSize: 12, color: 'text.disabled' }}
              >
                {fToNow(mention.messageCreated || mention.mentionedAt)} ago
              </Typography>
            </Stack>
          </>
        )}
      </ListItemButton>
    </Box>
  );
}
