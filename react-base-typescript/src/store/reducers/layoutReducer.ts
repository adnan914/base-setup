import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LayoutState = {
    isSideBar: boolean
}

const initialState: LayoutState = {
    isSideBar: true,
};

export const layoutSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    toggleSideBar: (state, action: PayloadAction<LayoutState>) => {
      state.isSideBar = action.payload.isSideBar;
    },
  },
});
export const { toggleSideBar } = layoutSlice.actions;

export default layoutSlice.reducer;
