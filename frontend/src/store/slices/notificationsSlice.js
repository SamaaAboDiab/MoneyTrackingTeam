import { createSlice, nanoid } from "@reduxjs/toolkit";

/*
  In-app notifications, kept on this device per user (see NotificationsMenu) until the backend
  offers a notifications API.
  - events: things that happened, e.g. trying to pay or move more than an account holds.
  - readIds: ids of notifications already read, including the debt alerts that are derived
    from the debts list rather than stored here.
*/
const MAX_EVENTS = 30;

const initialState = {
  ownerId: null, // the user the events/readIds belong to, so they're never saved under someone else
  events: [],
  readIds: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notificationsLoaded(state, action) {
      const { ownerId, events, readIds } = action.payload;
      state.ownerId = ownerId;
      state.events = events ?? [];
      state.readIds = readIds ?? [];
    },
    // source: "transfer" | "cash" | "expense" | "debtPayment" | "savings"
    insufficientBalanceDetected: {
      reducer(state, action) {
        state.events.unshift(action.payload);
        state.events.length = Math.min(state.events.length, MAX_EVENTS);
      },
      prepare({ source, account, amount }) {
        return {
          payload: {
            id: `insufficient-${nanoid()}`,
            type: "insufficientBalance",
            createdAt: new Date().toISOString(),
            data: {
              source,
              accountId: account._id,
              accountName: account.name,
              amount: Number(amount),
              balance: Number(account.balance),
              currency: account.currency || "EGP",
            },
          },
        };
      },
    },
    notificationsRead(state, action) {
      const ids = new Set([...state.readIds, ...action.payload]);
      state.readIds = [...ids];
    },
  },
});

export const { notificationsLoaded, insufficientBalanceDetected, notificationsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
