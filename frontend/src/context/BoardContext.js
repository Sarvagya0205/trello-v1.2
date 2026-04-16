import { createContext, useContext, useReducer, useCallback } from "react";
import * as api from "../api";

const BoardContext = createContext();

const initialState = {
  boards: [],
  board: null,
  users: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_BOARDS":
      return { ...state, boards: action.payload };
    case "SET_BOARD":
      return { ...state, board: action.payload };
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "ADD_LIST":
      return {
        ...state,
        board: {
          ...state.board,
          lists: [...state.board.lists, action.payload],
        },
      };
    case "UPDATE_LIST":
      return {
        ...state,
        board: {
          ...state.board,
          lists: state.board.lists.map((l) =>
            l.id === action.payload.id ? { ...l, ...action.payload } : l
          ),
        },
      };
    case "DELETE_LIST":
      return {
        ...state,
        board: {
          ...state.board,
          lists: state.board.lists.filter((l) => l.id !== action.payload),
        },
      };
    case "ADD_CARD":
      return {
        ...state,
        board: {
          ...state.board,
          lists: state.board.lists.map((l) =>
            l.id === action.payload.list_id
              ? { ...l, cards: [...l.cards, action.payload] }
              : l
          ),
        },
      };
    case "UPDATE_CARD":
      return {
        ...state,
        board: {
          ...state.board,
          lists: state.board.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) =>
              c.id === action.payload.id ? { ...c, ...action.payload } : c
            ),
          })),
        },
      };
    case "DELETE_CARD":
      return {
        ...state,
        board: {
          ...state.board,
          lists: state.board.lists.map((l) => ({
            ...l,
            cards: l.cards.filter((c) => c.id !== action.payload),
          })),
        },
      };
    case "REORDER_LISTS":
      return {
        ...state,
        board: { ...state.board, lists: action.payload },
      };
    case "REORDER_CARDS":
      return {
        ...state,
        board: { ...state.board, lists: action.payload },
      };
    default:
      return state;
  }
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchBoards = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.getBoards();
      dispatch({ type: "SET_BOARDS", payload: res.data });
    } catch (err) {
      console.error("Failed to fetch boards:", err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const fetchBoard = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.getBoard(id);
      dispatch({ type: "SET_BOARD", payload: res.data });
    } catch (err) {
      console.error("Failed to fetch board:", err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await api.getUsers();
    dispatch({ type: "SET_USERS", payload: res.data });
  }, []);

  const addList = useCallback(async (boardId, title) => {
    const position = (state.board?.lists?.length || 0) + 1;
    const res = await api.createList({ board_id: boardId, title, position });
    dispatch({ type: "ADD_LIST", payload: { ...res.data, cards: [] } });
  }, [state.board]);

  const editList = useCallback(async (listId, data) => {
    const res = await api.updateList(listId, data);
    dispatch({ type: "UPDATE_LIST", payload: res.data });
  }, []);

  const removeList = useCallback(async (listId) => {
    await api.deleteList(listId);
    dispatch({ type: "DELETE_LIST", payload: listId });
  }, []);

  const addCard = useCallback(async (listId, title) => {
    const list = state.board.lists.find((l) => l.id === listId);
    const position = (list?.cards?.length || 0) + 1;
    const res = await api.createCard({ list_id: listId, title, position });
    dispatch({ type: "ADD_CARD", payload: { ...res.data, members: [], labels: [], checklists: [] } });
  }, [state.board]);

  const editCard = useCallback((cardData) => {
    dispatch({ type: "UPDATE_CARD", payload: cardData });
  }, []);

  const removeCard = useCallback(async (cardId) => {
    await api.deleteCard(cardId);
    dispatch({ type: "DELETE_CARD", payload: cardId });
  }, []);

  const reorderLists = useCallback((lists) => {
    dispatch({ type: "REORDER_LISTS", payload: lists });
  }, []);

  const reorderCards = useCallback((lists) => {
    dispatch({ type: "REORDER_CARDS", payload: lists });
  }, []);

  return (
    <BoardContext.Provider
      value={{
        ...state,
        fetchBoards,
        fetchBoard,
        fetchUsers,
        addList,
        editList,
        removeList,
        addCard,
        editCard,
        removeCard,
        reorderLists,
        reorderCards,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export const useBoard = () => useContext(BoardContext);
