import {
  giftsReducer,
  getBookDetail,
  patchGeneratingGiftsReducer,
} from "./gift";
import { applyPatches, enablePatches } from "immer";

enablePatches();

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
  gifts: {
    immer_license: {
      id: "immer_license",
      description: "Immer license",
      image: "https://avatars2.githubusercontent.com/u/45853199?s=400&v=4",
      reservedBy: 2,
    },
    egghead_description: {
      id: "egghead_description",
      description: "Egghead license",
      image:
        "https://d2eip9sf3oo6c2.cloudfront.net/series/square_covers/000/000/231/square_480/EGH_Apollo-GraphQL-React_Final.png",
      reservedBy: undefined,
    },
  },
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

  test("didn't modify initial-state", () => {
    expect(Object.keys(initialState.gifts).length).toBe(2);
  });

  test("added a gift to the collection", () => {
    expect(Object.keys(nextState.gifts).length).toBe(3);
  });
});

describe("Reserving an unreserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    payload: { id: "egghead_description" },
  });

  test("correctly stores reservedBy", () => {
    expect(nextState.gifts["egghead_description"].reservedBy).toBe(1);
  });

  test("didn't the original state", () => {
    expect(initialState.gifts["egghead_description"].reservedBy).toBe(
      undefined
    );
  });

  test("does structurally share unchanged parts of state tree", () => {
    expect(nextState).not.toBe(initialState);
    expect(nextState.gifts["egghead_description"]).not.toBe(
      initialState.gifts["egghead_description"]
    );
    expect(nextState.gifts["immer_license"]).toBe(
      initialState.gifts["immer_license"]
    );
  });

  test("can't accidentally modify the produces state", () => {
    expect(() => {
      nextState.gifts["egghead_description"].reservedBy = undefined;
    }).toThrow();
  });
});

describe("Reserving an unreserved gift with patches", () => {
  const [nextState, patches, inversePatches] = patchGeneratingGiftsReducer(
    initialState,
    {
      type: "TOGGLE_RESERVATION",
      payload: { id: "egghead_description" },
    }
  );

  test("correctly stores reservedBy", () => {
    expect(nextState.gifts["egghead_description"].reservedBy).toBe(1);
  });

  test("generates the correct patches", () => {
    expect(patches).toEqual([
      {
        op: "replace", // `remove` or `add`
        path: ["gifts", "egghead_description", "reservedBy"],
        value: 1,
      },
    ]);
  });

  test("replaying patches produces same state - 1", () => {
    expect(applyPatches(initialState, patches)).toEqual(nextState);
  });

  test("inverse patches to the original state", () => {
    expect(applyPatches(nextState, inversePatches)).toEqual(initialState);
  });

  test("correct inverse patches are generated", () => {
    expect(inversePatches).toMatchInlineSnapshot(`
      Array [
        Object {
          "op": "replace",
          "path": Array [
            "gifts",
            "egghead_description",
            "reservedBy",
          ],
          "value": undefined,
        },
      ]
    `);
  });

  test("replaying patches produces same state - 2", () => {
    expect(
      giftsReducer(initialState, {
        type: "APPLY_PATCHES",
        payload: { patches },
      })
    ).toEqual(nextState);
  });
});

describe("Reserving an already unreserved gift", () => {
  const nextState = giftsReducer(initialState, {
    type: "TOGGLE_RESERVATION",
    payload: { id: "immer_license" },
  });

  test("preserves stored reservedBy", () => {
    expect(nextState.gifts["immer_license"].reservedBy).toBe(2);
  });

  test("still produces a new gift", () => {
    expect(nextState.gifts["immer_license"]).toEqual(
      initialState.gifts["immer_license"]
    );
    expect(nextState.gifts["immer_license"]).toBe(
      initialState.gifts["immer_license"]
    );
  });

  test("still produces a new state", () => {
    expect(nextState).toEqual(initialState);
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
    expect(nextState.gifts["0201558025"].description).toBe(
      "Concrete mathematics"
    );
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
    expect(Object.keys(nextState.gifts).length).toBe(4);
  });
});
