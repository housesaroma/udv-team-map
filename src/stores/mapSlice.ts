import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type MapState } from "../types/map";

const initialState: MapState = {
    zoom: 1,
    position: { x: 0, y: 0 },
    isLoading: false,
};

const mapSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
        setZoom: (state, action: PayloadAction<number>) => {
            state.zoom = action.payload;
        },
        setPosition: (
            state,
            action: PayloadAction<{ x: number; y: number }>
        ) => {
            state.position = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        resetMap: (state) => {
            state.zoom = 1;
            state.position = { x: 0, y: 0 };
        },
    },
});

export const { setZoom, setPosition, setLoading, resetMap } = mapSlice.actions;
export default mapSlice.reducer;
