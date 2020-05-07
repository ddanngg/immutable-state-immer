import produce from "immer";
import { allUsers, getCurrentUser } from "../misc/users";
import defaultGifts from "../misc/gifts.json";

export const giftsReducer = produce((draft, action) => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case "ADD_GIFT":
      const { id, description, image } = action.payload;
      draft.gifts.push({
        id,
        description,
        image,
        reservedBy: undefined,
      });
      break;
    case "TOGGLE_RESERVATION":
      const gift = draft.gifts.find((gift) => gift.id === action.payload.id);
      if (!gift) return;
      gift.reservedBy =
        gift.reservedBy === undefined
          ? draft.currentUser.id
          : gift.reservedBy === draft.currentUser.id
          ? undefined
          : gift.reservedBy;
      break;
    case "ADD_BOOK":
      const { book } = action.payload;
      draft.gifts.push({
        id: book.identifiers.isbn_10[0],
        description: book.title,
        image: book.cover.medium,
        reservedBy: undefined,
      });
      break;
    case "RESET":
      return getInitialState();
  }
});

export function getInitialState() {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts,
  };
}

// -------------------------------
// ------------ ASYNC ------------
export async function getBookDetail(isbn) {
  const response = await fetch(
    `http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`,
    {
      mode: "cors",
    }
  );
  const book = (await response.json())["ISBN:" + isbn];
  return book;
}
