export interface MapPosition {
  x: number;
  y: number;
}

export interface MapState {
  zoom: number;
  position: MapPosition;
  isLoading: boolean;
}
