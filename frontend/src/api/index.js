import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
});

export const getBoards = () => api.get("/api/boards");
export const createBoard = (data) => api.post("/api/boards", data);
export const getBoard = (id) => api.get(`/api/boards/${id}`);
export const updateBoard = (id, data) => api.patch(`/api/boards/${id}`, data);
export const deleteBoard = (id) => api.delete(`/api/boards/${id}`);

export const createList = (data) => api.post("/api/lists", data);
export const updateList = (id, data) => api.patch(`/api/lists/${id}`, data);
export const deleteList = (id) => api.delete(`/api/lists/${id}`);

export const createCard = (data) => api.post("/api/cards", data);
export const getCard = (id) => api.get(`/api/cards/${id}`);
export const updateCard = (id, data) => api.patch(`/api/cards/${id}`, data);
export const deleteCard = (id) => api.delete(`/api/cards/${id}`);

export const addCardMember = (cardId, userId) => api.post(`/api/cards/${cardId}/members/${userId}`);
export const removeCardMember = (cardId, userId) => api.delete(`/api/cards/${cardId}/members/${userId}`);

export const addCardLabel = (cardId, labelId) => api.post(`/api/cards/${cardId}/labels/${labelId}`);
export const removeCardLabel = (cardId, labelId) => api.delete(`/api/cards/${cardId}/labels/${labelId}`);

export const getBoardLabels = (boardId) => api.get(`/api/boards/${boardId}/labels`);
export const createBoardLabel = (boardId, data) => api.post(`/api/boards/${boardId}/labels`, data);
export const updateBoardLabel = (boardId, labelId, data) => api.patch(`/api/boards/${boardId}/labels/${labelId}`, data);
export const deleteBoardLabel = (boardId, labelId) => api.delete(`/api/boards/${boardId}/labels/${labelId}`);

export const createChecklist = (cardId, data) => api.post(`/api/cards/${cardId}/checklists`, data);
export const updateChecklist = (id, data) => api.patch(`/api/checklists/${id}`, data);
export const deleteChecklist = (id) => api.delete(`/api/checklists/${id}`);

export const createChecklistItem = (checklistId, data) => api.post(`/api/checklists/${checklistId}/items`, data);
export const updateChecklistItem = (id, data) => api.patch(`/api/checklist-items/${id}`, data);
export const deleteChecklistItem = (id) => api.delete(`/api/checklist-items/${id}`);

export const getUsers = () => api.get("/api/users");

export const searchCards = (boardId, params) => api.get(`/api/boards/${boardId}/search`, { params });
