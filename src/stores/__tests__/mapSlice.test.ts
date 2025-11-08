import { describe, it, expect, beforeEach } from "vitest";
import mapReducer, {
  setZoom,
  zoomIn,
  zoomOut,
  resetZoom,
  setPosition,
  setTempPosition,
  commitPosition,
  resetPosition,
  setLoading,
} from "../mapSlice";
import type { MapState } from "../mapSlice";

describe("mapSlice", () => {
  let initialState: MapState;

  beforeEach(() => {
    initialState = {
      zoom: 1,
      position: { x: 0, y: 0 },
      tempPosition: { x: 0, y: 0 },
      isLoading: false,
    };
  });

  describe("setZoom", () => {
    it("должен устанавливать значение zoom", () => {
      const action = setZoom(2.5);
      const newState = mapReducer(initialState, action);

      expect(newState.zoom).toBe(2.5);
      expect(newState.position).toEqual(initialState.position);
      expect(newState.tempPosition).toEqual(initialState.tempPosition);
      expect(newState.isLoading).toBe(initialState.isLoading);
    });

    it("должен устанавливать минимальное значение zoom", () => {
      const action = setZoom(0.1);
      const newState = mapReducer(initialState, action);

      expect(newState.zoom).toBe(0.1);
    });

    it("должен устанавливать максимальное значение zoom", () => {
      const action = setZoom(10);
      const newState = mapReducer(initialState, action);

      expect(newState.zoom).toBe(10);
    });
  });

  describe("zoomIn", () => {
    it("должен увеличивать zoom на 0.25", () => {
      const action = zoomIn();
      const newState = mapReducer(initialState, action);

      expect(newState.zoom).toBe(1.25);
    });

    it("должен ограничивать максимальный zoom до 5", () => {
      const stateWithMaxZoom: MapState = {
        ...initialState,
        zoom: 5,
      };

      const action = zoomIn();
      const newState = mapReducer(stateWithMaxZoom, action);

      expect(newState.zoom).toBe(5);
    });

    it("должен увеличивать zoom с 4.75 до 5 (максимум)", () => {
      const stateWithAlmostMaxZoom: MapState = {
        ...initialState,
        zoom: 4.75,
      };

      const action = zoomIn();
      const newState = mapReducer(stateWithAlmostMaxZoom, action);

      expect(newState.zoom).toBe(5);
    });

    it("не должен изменять другие свойства состояния", () => {
      const customState: MapState = {
        zoom: 2,
        position: { x: 100, y: 200 },
        tempPosition: { x: 150, y: 250 },
        isLoading: true,
      };

      const action = zoomIn();
      const newState = mapReducer(customState, action);

      expect(newState.zoom).toBe(2.25);
      expect(newState.position).toEqual(customState.position);
      expect(newState.tempPosition).toEqual(customState.tempPosition);
      expect(newState.isLoading).toBe(customState.isLoading);
    });
  });

  describe("zoomOut", () => {
    it("должен уменьшать zoom на 0.25", () => {
      const action = zoomOut();
      const newState = mapReducer(initialState, action);

      expect(newState.zoom).toBe(0.75);
    });

    it("должен ограничивать минимальный zoom до 0.25", () => {
      const stateWithMinZoom: MapState = {
        ...initialState,
        zoom: 0.25,
      };

      const action = zoomOut();
      const newState = mapReducer(stateWithMinZoom, action);

      expect(newState.zoom).toBe(0.25);
    });

    it("должен уменьшать zoom с 0.5 до 0.25 (минимум)", () => {
      const stateWithAlmostMinZoom: MapState = {
        ...initialState,
        zoom: 0.5,
      };

      const action = zoomOut();
      const newState = mapReducer(stateWithAlmostMinZoom, action);

      expect(newState.zoom).toBe(0.25);
    });

    it("не должен изменять другие свойства состояния", () => {
      const customState: MapState = {
        zoom: 2,
        position: { x: 100, y: 200 },
        tempPosition: { x: 150, y: 250 },
        isLoading: true,
      };

      const action = zoomOut();
      const newState = mapReducer(customState, action);

      expect(newState.zoom).toBe(1.75);
      expect(newState.position).toEqual(customState.position);
      expect(newState.tempPosition).toEqual(customState.tempPosition);
      expect(newState.isLoading).toBe(customState.isLoading);
    });
  });

  describe("resetZoom", () => {
    it("должен сбрасывать zoom до 1", () => {
      const stateWithCustomZoom: MapState = {
        ...initialState,
        zoom: 3.5,
      };

      const action = resetZoom();
      const newState = mapReducer(stateWithCustomZoom, action);

      expect(newState.zoom).toBe(1);
    });

    it("не должен изменять другие свойства состояния", () => {
      const customState: MapState = {
        zoom: 2.5,
        position: { x: 100, y: 200 },
        tempPosition: { x: 150, y: 250 },
        isLoading: true,
      };

      const action = resetZoom();
      const newState = mapReducer(customState, action);

      expect(newState.zoom).toBe(1);
      expect(newState.position).toEqual(customState.position);
      expect(newState.tempPosition).toEqual(customState.tempPosition);
      expect(newState.isLoading).toBe(customState.isLoading);
    });
  });

  describe("setPosition", () => {
    it("должен устанавливать новую позицию", () => {
      const newPosition = { x: 100, y: 200 };
      const action = setPosition(newPosition);
      const newState = mapReducer(initialState, action);

      expect(newState.position).toEqual(newPosition);
      expect(newState.tempPosition).toEqual(initialState.tempPosition);
    });

    it("должен устанавливать позицию с отрицательными координатами", () => {
      const newPosition = { x: -100, y: -200 };
      const action = setPosition(newPosition);
      const newState = mapReducer(initialState, action);

      expect(newState.position).toEqual(newPosition);
    });

    it("не должен изменять другие свойства состояния", () => {
      const customState: MapState = {
        zoom: 2,
        position: { x: 50, y: 50 },
        tempPosition: { x: 100, y: 100 },
        isLoading: true,
      };

      const newPosition = { x: 300, y: 400 };
      const action = setPosition(newPosition);
      const newState = mapReducer(customState, action);

      expect(newState.position).toEqual(newPosition);
      expect(newState.zoom).toBe(customState.zoom);
      expect(newState.tempPosition).toEqual(customState.tempPosition);
      expect(newState.isLoading).toBe(customState.isLoading);
    });
  });

  describe("setTempPosition", () => {
    it("должен устанавливать временную позицию", () => {
      const tempPosition = { x: 150, y: 250 };
      const action = setTempPosition(tempPosition);
      const newState = mapReducer(initialState, action);

      expect(newState.tempPosition).toEqual(tempPosition);
      expect(newState.position).toEqual(initialState.position);
    });

    it("не должен изменять основную позицию", () => {
      const customState: MapState = {
        zoom: 2,
        position: { x: 100, y: 200 },
        tempPosition: { x: 50, y: 50 },
        isLoading: false,
      };

      const tempPosition = { x: 300, y: 400 };
      const action = setTempPosition(tempPosition);
      const newState = mapReducer(customState, action);

      expect(newState.tempPosition).toEqual(tempPosition);
      expect(newState.position).toEqual(customState.position);
    });
  });

  describe("commitPosition", () => {
    it("должен копировать tempPosition в position", () => {
      const stateWithTempPosition: MapState = {
        ...initialState,
        tempPosition: { x: 150, y: 250 },
      };

      const action = commitPosition();
      const newState = mapReducer(stateWithTempPosition, action);

      expect(newState.position).toEqual(stateWithTempPosition.tempPosition);
      expect(newState.tempPosition).toEqual(stateWithTempPosition.tempPosition);
    });

    it("должен обновлять position из tempPosition", () => {
      const customState: MapState = {
        zoom: 2,
        position: { x: 100, y: 200 },
        tempPosition: { x: 300, y: 400 },
        isLoading: true,
      };

      const action = commitPosition();
      const newState = mapReducer(customState, action);

      expect(newState.position).toEqual({ x: 300, y: 400 });
      expect(newState.tempPosition).toEqual({ x: 300, y: 400 });
    });
  });

  describe("resetPosition", () => {
    it("должен сбрасывать position и tempPosition в { x: 0, y: 0 }", () => {
      const customState: MapState = {
        zoom: 2,
        position: { x: 100, y: 200 },
        tempPosition: { x: 150, y: 250 },
        isLoading: false,
      };

      const action = resetPosition();
      const newState = mapReducer(customState, action);

      expect(newState.position).toEqual({ x: 0, y: 0 });
      expect(newState.tempPosition).toEqual({ x: 0, y: 0 });
    });

    it("не должен изменять zoom и isLoading", () => {
      const customState: MapState = {
        zoom: 3.5,
        position: { x: 100, y: 200 },
        tempPosition: { x: 150, y: 250 },
        isLoading: true,
      };

      const action = resetPosition();
      const newState = mapReducer(customState, action);

      expect(newState.zoom).toBe(customState.zoom);
      expect(newState.isLoading).toBe(customState.isLoading);
    });
  });

  describe("setLoading", () => {
    it("должен устанавливать isLoading в true", () => {
      const action = setLoading(true);
      const newState = mapReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });

    it("должен устанавливать isLoading в false", () => {
      const stateWithLoading: MapState = {
        ...initialState,
        isLoading: true,
      };

      const action = setLoading(false);
      const newState = mapReducer(stateWithLoading, action);

      expect(newState.isLoading).toBe(false);
    });

    it("не должен изменять другие свойства состояния", () => {
      const customState: MapState = {
        zoom: 2.5,
        position: { x: 100, y: 200 },
        tempPosition: { x: 150, y: 250 },
        isLoading: false,
      };

      const action = setLoading(true);
      const newState = mapReducer(customState, action);

      expect(newState.isLoading).toBe(true);
      expect(newState.zoom).toBe(customState.zoom);
      expect(newState.position).toEqual(customState.position);
      expect(newState.tempPosition).toEqual(customState.tempPosition);
    });
  });

  describe("комплексные сценарии", () => {
    it("должен корректно обрабатывать последовательность действий zoom", () => {
      let state = initialState;

      // Увеличиваем zoom
      state = mapReducer(state, zoomIn());
      expect(state.zoom).toBe(1.25);

      // Увеличиваем еще раз
      state = mapReducer(state, zoomIn());
      expect(state.zoom).toBe(1.5);

      // Уменьшаем zoom
      state = mapReducer(state, zoomOut());
      expect(state.zoom).toBe(1.25);

      // Сбрасываем
      state = mapReducer(state, resetZoom());
      expect(state.zoom).toBe(1);
    });

    it("должен корректно обрабатывать последовательность действий позиции", () => {
      let state = initialState;

      // Устанавливаем временную позицию
      state = mapReducer(state, setTempPosition({ x: 100, y: 200 }));
      expect(state.tempPosition).toEqual({ x: 100, y: 200 });
      expect(state.position).toEqual({ x: 0, y: 0 });

      // Фиксируем позицию
      state = mapReducer(state, commitPosition());
      expect(state.position).toEqual({ x: 100, y: 200 });
      expect(state.tempPosition).toEqual({ x: 100, y: 200 });

      // Сбрасываем позицию
      state = mapReducer(state, resetPosition());
      expect(state.position).toEqual({ x: 0, y: 0 });
      expect(state.tempPosition).toEqual({ x: 0, y: 0 });
    });

    it("должен корректно обрабатывать комбинацию zoom и position", () => {
      let state = initialState;

      state = mapReducer(state, setZoom(2));
      state = mapReducer(state, setPosition({ x: 100, y: 200 }));
      state = mapReducer(state, setLoading(true));

      expect(state.zoom).toBe(2);
      expect(state.position).toEqual({ x: 100, y: 200 });
      expect(state.isLoading).toBe(true);
    });
  });
});

