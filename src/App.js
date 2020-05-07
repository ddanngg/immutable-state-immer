import React, { useReducer, useCallback } from "react";
import { useImmer } from "use-immer";
import { v4 as uuidv4 } from "uuid";

import Gift from "./components/gift";

import { getInitialState, addBook, giftsReducer, getBookDetail } from "./helpers/gift";

function App() {
  const [state, dispatch] = useReducer(giftsReducer, getInitialState());
  const { users, currentUser, gifts } = state;

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

  return (
    <div className="app">
      <div className="header">
        <h2>Hi, {currentUser.name}</h2>
      </div>

      <div className="actions">
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleAddBook}>Add book</button>
      </div>

      <div className="gifts">
        {gifts.map((gift) => (
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
