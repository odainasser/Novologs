export const chatEndpoints = {
  getChatRoom: '/Rooms/getChatRoom',
  getChatMessage: '/Messages/getChatMessage',

  addChatRoom: '/Rooms/addChatRoom',

  updateChatRoom: '/Rooms/updateChatRoom',

  deleteChatRoom: '/Rooms/deleteChatRoom',

  updateChatMessage: '/Messages/updateChatMessage',

  deleteChatMessage: '/Messages/deleteChatMessage',

  transcribeMessage: (id: string) => `/chat/Messages/transcribe/${id}`,
    getMentions: '/Messages/getMentions',
};
