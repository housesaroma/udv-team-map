import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import { setZoom } from "../stores/mapSlice";

export const useKeyboardShortcuts = () => {
    const dispatch = useAppDispatch();
    const currentZoom = useAppSelector((state) => state.map.zoom);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case "=":
                    case "+":
                        event.preventDefault();
                        dispatch(setZoom(Math.min(currentZoom + 0.25, 5)));
                        break;
                    case "-":
                        event.preventDefault();
                        dispatch(setZoom(Math.max(currentZoom - 0.25, 0.25)));
                        break;
                    case "0":
                        event.preventDefault();
                        dispatch(setZoom(1));
                        break;
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [dispatch, currentZoom]); // Добавляем currentZoom в зависимости
};
