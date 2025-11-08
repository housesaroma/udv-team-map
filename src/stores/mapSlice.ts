// В mapSlice.ts добавьте
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface MapState {
  zoom: number;
  position: { x: number; y: number };
  isLoading: boolean;
  // Добавляем временную позицию для плавного перемещения
  tempPosition: { x: number; y: number };
}

const initialState: MapState = {
  zoom: 1,
  position: { x: 0, y: 0 },
  tempPosition: { x: 0, y: 0 },
  isLoading: false,
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    zoomIn: state => {
      state.zoom = Math.min(state.zoom + 0.25, 5);
    },
    zoomOut: state => {
      state.zoom = Math.max(state.zoom - 0.25, 0.25);
    },
    resetZoom: state => {
      state.zoom = 1;
    },
    setPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.position = action.payload;
    },
    // Новый экшен для временной позиции (используется во время перетаскивания)
    setTempPosition: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.tempPosition = action.payload;
    },
    // Фиксируем позицию после перетаскивания
    commitPosition: state => {
      state.position = state.tempPosition;
    },
    resetPosition: state => {
      state.position = { x: 0, y: 0 };
      state.tempPosition = { x: 0, y: 0 };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setZoom,
  zoomIn,
  zoomOut,
  resetZoom,
  setPosition,
  setTempPosition,
  commitPosition,
  resetPosition,
  setLoading,
} = mapSlice.actions;
export default mapSlice.reducer;
