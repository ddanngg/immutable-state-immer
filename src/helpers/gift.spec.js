import { giftsReducer, getBookDetail } from "./gift";

const initialState = {
  users: [
    {
      id: 1,
      name: "Test 1 user",
    },
    {
      id: 2,
      name: "Test 2 user",
    },
  ],
  currentUser: {
    id: 1,
    name: "Test 1 user",
  },
  gifts: [
    {
      id: "immer_license",
      description: "Immer license",
      image: "https://avatars2.githubusercontent.com/u/45853199?s=400&v=4",
      reservedBy: 2,
    },
    {
      id: "egghead_description",
      description: "Egghead license",
      image:
        "https://d2eip9sf3oo6c2.cloudfront.net/series/square_covers/000/000/231/square_480/EGH_Apollo-GraphQL-React_Final.png",
      reservedBy: undefined,
    },
  ],
};

describe("Reserving an unreserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "ADD_GIFT",
    payload: {
      id: "mug",
      description: "Coffee mug",
      image: "",
    },
  });

  test("added a gift to the collection", () => {
    expect(nextState.gifts.length).toBe(3);
  });

  test("didn't modify initial-state", () => {
    expect(initialState.gifts.length).toBe(2);
  });
});

describe("Reserving an unreserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    payload: { id: "egghead_description" },
  });

  test("correctly stores reservedBy", () => {
    expect(nextState.gifts[1].reservedBy).toBe(1);
  });

  test("didn't modify an original state", () => {
    expect(initialState.gifts[1].reservedBy).toBe(undefined);
  });

  test("does structurally share unchanged parts of state tree", () => {
    expect(nextState).not.toBe(initialState);
    expect(nextState.gifts[1]).not.toBe(initialState.gifts[1]);
    expect(nextState.gifts[0]).toBe(initialState.gifts[0]);
  });

  test("can't accidentally modify the produces state", () => {
    expect(() => {
      nextState.gifts[1].reservedBy = undefined;
    }).toThrow();
  });
});

describe("Reserving an already unreserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    payload: { id: "immer_license" },
  });

  test("preserves stored reservedBy", () => {
    expect(nextState.gifts[0].reservedBy).toBe(2);
  });

  test("no new gift should be created", () => {
    expect(nextState.gifts[0]).toEqual(initialState.gifts[0]);
    expect(nextState.gifts[0]).toBe(initialState.gifts[0]);
    expect(nextState).toBe(initialState);
  });
});

describe("Can add book [async]", () => {
  test("can add math book", async () => {
    const book = await getBookDetail("0201558025");
    const nextState = giftsReducer(initialState, {
      type: "ADD_BOOK",
      payload: {
        book,
      },
    });
    expect(nextState.gifts[2].description).toBe("Concrete mathematics");
  });

  test("can add 2 books in parallel", async () => {
    const promise1 = await getBookDetail("0201558025");
    const promise2 = await getBookDetail("9781598560169");
    const book1 = {
      type: "ADD_BOOK",
      payload: { book: promise1 },
    };
    const book2 = {
      type: "ADD_BOOK",
      payload: { book: promise2 },
    };

    // const nextState = [book1, book2].reduce(
    //   (state, action) => giftsReducer(state, action),
    //   initialState
    // );

    // -- short-hand
    const nextState = [book1, book2].reduce(giftsReducer, initialState);
    expect(nextState.gifts.length).toBe(4);
  });
});
