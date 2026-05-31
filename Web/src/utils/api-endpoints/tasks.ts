export const taskEndpoints = {
  getTask: '/Task/getTaskQuery',
  createTask: '/Task/createTask',
  updateTask: '/Task/updateTask',
  deleteTask: '/Task/deleteTask',

  changeStatus: '/Task/changeStatus',

  getStatus: '/Status/getStatus',
  addStatus: '/Status/addStatus',
  updateStatus: 'task/Status/updateStatus',
  deleteStatus: '/Status/deleteStatus',

  getCategory: '/Category/getCategory',
  addCategory: '/Category/addCategory',
  updateCategory: '/Category/updateCategory',
  deleteCategory: '/Category/deleteCategory',
  getProjectCategory: '/Category/getProjectCategory',

  getPriority: '/Priority/getPriority',
  addPriority: '/Priority/addPriority',
  updatePriority: '/Priority/updatePriority',
  deletePriority: '/Priority/deletePriority',

  addTodo: '/TodoItem/addTodoItem',
  updateTodo: '/TodoItem/updateTodoItem',
  deleteTodo: '/TodoItem/deleteTodoItem',
  getTodo: '/TodoItem/getTodoItem',
  changeTodoStatus: '/TodoItem/changeStatus',

  getTaskDetails: '/Task/getTask',
  getTaskAvailableUsers: '/Task/getTaskAvailableUsers',
  transcribeTask: '/Task/transcribeTask',
};
