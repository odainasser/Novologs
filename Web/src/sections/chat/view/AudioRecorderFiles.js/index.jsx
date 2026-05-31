import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

// Red dot "beeping" animation
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

const RecordingDot = styled('div')({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: 'red',
  animation: `${pulse} 1s infinite`,
  marginLeft: '10px', // Space between the time and the dot
});

const CustomVoiceRecorder = ({
  isRecording,
  setIsRecording,
  audioUrl,
  setAudioUrl,
  isAudioUploading,
  elapsedTime,
  setElapsedTime,
  mediaRecorderRef,
  audioChunksRef,
  streamRef,
  handleSendAudioMessage,
  intervalRef,
  startRecording,
  stopRecording,
  discardRecording,
  handleSendMessage,
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent={'space-between'}
      spacing={2}
      width="100%"
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAudioUploading}
          >
            <Iconify icon={isRecording ? 'ic:baseline-stop' : 'mdi:microphone'} />
          </IconButton>

          {/* Red Dot Beeping */}
          {isRecording && <RecordingDot />}
        </Stack>

        {/* Elapsed Time Display */}
        {isRecording && (
          <Typography variant="caption" color="textSecondary">
            {elapsedTime}s
          </Typography>
        )}
        {isAudioUploading && <CircularProgress size={24} />}

        {audioUrl && <audio controls src={audioUrl} style={{ width: '350px' }} />}

        {audioUrl && (
          <IconButton onClick={discardRecording}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        )}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {audioUrl && (
          <IconButton
            onClick={() => {
              handleSendMessage();
            }}
            download="recording.webm"
          >
            <Iconify icon="eva:paper-plane-fill" />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};

export default CustomVoiceRecorder;
