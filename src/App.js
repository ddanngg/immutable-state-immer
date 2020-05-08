import React, { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import Gift from "./components/gift-item";

import {
  getInitialState,
  getBookDetail,
  patchGeneratingGiftsReducer,
  giftsReducer,
} from "./helpers/gift";
import { useSocket } from "./utils/useSocket";

function App() {
  const [state, setState] = useState(() => getInitialState());
  const undoStack = useRef([]);
  const undoStackPointer = useRef(-1);
  const { users, currentUser, gifts } = state;

  const dispatch = useCallback((action, undoable = true) => {
    setState((currentState) => {
      const [nextState, patches, invertPatches] = patchGeneratingGiftsReducer(
        currentState,
        action
      );
      send(patches);
      if (undoable) {
        // undoStack.current.push(invertPatches);
        const pointer = ++undoStackPointer.current;
        undoStack.current.length = pointer;
        undoStack.current[pointer] = { patches, invertPatches };
      }
      return nextState;
    });
    // eslint-disable-next-line
  }, []);

  const send = useSocket("ws://localhost:5001", function onMsg(patches) {
    // we received some patches
    setState(() =>
      giftsReducer(state, { type: "APPLY_PATCHES", payload: { patches } })
    );
  });

  const handleAdd = () => {
    const description = prompt("Gift to add");

    if (description) {
      dispatch({
        type: "ADD_GIFT",
        payload: {
          id: uuidv4(),
          description,
          image: `https://picsum.photos/id/${Math.round(
            Math.random() * 1000
          )}/200/200`,
        },
      });
    }
  };

  const handleReserve = useCallback((id) => {
    dispatch({
      type: "TOGGLE_RESERVATION",
      payload: {
        id,
      },
    });
    // eslint-disable-next-line
  }, []);

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  const handleAddBook = async () => {
    const isbn = prompt("Enter ISBN number", "0201558025");

    if (isbn) {
      const book = await getBookDetail(isbn);
      dispatch({
        type: "ADD_BOOK",
        payload: { book },
      });
    }
  };

  const handleUndo = () => {
    if (undoStackPointer.current < 0) return;
    const patches = undoStack.current[undoStackPointer.current].invertPatches;
    undoStackPointer.current--;
    dispatch(
      {
        type: "APPLY_PATCHES",
        payload: { patches },
      },
      false
    );
  };

  const handleRedo = () => {
    if (undoStackPointer.current === undoStack.current.length - 1) return;
    undoStackPointer.current = undoStack.current.length++;
    const patches = undoStack.current[undoStackPointer.current].patches;
    dispatch(
      {
        type: "APPLY_PATCHES",
        payload: { patches },
      },
      false
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h2>Hi, {currentUser.name}</h2>
      </div>

      <div className="actions">
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleAddBook}>Add book</button>
        <button onClick={handleUndo} disabled={undoStackPointer.current < 0}>
          Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={undoStackPointer.current === undoStack.current.length - 1}
        >
          Redo
        </button>
      </div>

      <div className="gifts">
        {Object.values(gifts).map((gift) => (
          <Gift
            key={gift.id}
            users={users}
            currentUser={currentUser}
            gift={gift}
            onReserve={handleReserve}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
