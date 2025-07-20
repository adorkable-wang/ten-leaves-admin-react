import { configureStore, createSlice } from '@reduxjs/toolkit';

// 示例 reducer
const counterSlice = createSlice({
  initialState: 0,
  name: 'counter',
  reducers: {
    decrement: state => state - 1,
    increment: state => state + 1
  }
});

export const { decrement, increment } = counterSlice.actions;

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
