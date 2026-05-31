import { useState, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Paper from '@mui/material/Paper';
import { Scrollbar } from 'src/components/scrollbar';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function KanbanTodo({
  open,
  handleClose,
  editorRef,
  addTodo,
  todosList,
  handleDeleteTodo,
  displayedTodo,
}) {
  const [todos, setTodos] = useState(['']);
  const { t } = useTranslation('dashboard/tasks');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const handleInputChange = (index, event) => {
    const newTodos = [...todos];
    newTodos[index] = event.target.value;
    setTodos(newTodos);
  };

  const handleAddTaskField = () => {
    setTodos((prevTodos) => {
      const newTodos = [...prevTodos, ''];
      setTimeout(() => {
        const newIndex = newTodos.length - 1;
        inputRefs.current[newIndex]?.focus();
      }, 0);
      return newTodos;
    });
  };

  const handleAddTodo = () => {
    setLoading(true);
    const newTodo = {
      todos,
    };
    const todoHTML = `
      <h2>${t('tasks.todo.activities')}</h2>
      ${todos
        .map(
          (todo) => `
            <div style="display: flex; align-items: center;">
              <input type="checkbox" style="margin-right: 8px;" />
              <p style="margin: 0;">${todo}</p>
            </div>
          `
        )
        .join('')}
    `;
    addTodo(newTodo); 
    setLoading(false);
    toast.success(t('tasks.todo.add'));
    handleCancel();


  };

  const handleCancel = () => {
    setTodos(['']);
    handleClose();
  };
  const handleKeyPress = (event, index) => {
    if (event.key === 'Enter' && index === todos.length - 1) {
      handleAddTaskField();
    }
  };

  return (
    <>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress />
        </div>
      )}
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleCancel}>
        <DialogTitle sx={{ p: 2 }}>{t('tasks.todo.dialog_title')}</DialogTitle>
        <Stack spacing={2} sx={{ p: 2 }}>
          {todos.map((todo, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                value={todo}
                onChange={(event) => handleInputChange(index, event)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                inputRef={(el) => (inputRefs.current[index] = el)}
              />
              {index === todos.length - 1 && (
                <IconButton onClick={handleAddTaskField}>
                  <Iconify icon="mdi:plus" />
                </IconButton>
              )}
            </Stack>
          ))}
        </Stack>
        <DialogActions sx={{ flexShrink: 0, p: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleCancel}>
          {t('tasks.todo.cancel')}
          </Button>
          <Button variant="contained" onClick={handleAddTodo}>
          {t('tasks.todo.add')}
          </Button>
        </DialogActions>
        {todosList?.length > 0 && (
          <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {displayedTodo?.map(({ todo, groupIndex, index }) => (
                <Paper
                  key={`${groupIndex}-${index}`}
                  sx={{
                    p: 1,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Checkbox />
                    <Typography>{todo}</Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTodo(groupIndex, index)}
                    sx={{
                      width: 20,
                      height: 20,
                      cursor: 'pointer',
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          </Scrollbar>
        )}
      </Dialog>
    </>
  );
}
