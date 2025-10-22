import { useEffect } from "react";
import { resetZoom, zoomIn, zoomOut } from "../stores/mapSlice";
import { useAppDispatch } from "./redux";

export const useKeyboardShortcuts = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case "=":
                    case "+":
                        event.preventDefault();
                        dispatch(zoomIn());
                        break;
                    case "-":
                        event.preventDefault();
                        dispatch(zoomOut());
                        break;
                    case "0":
                        event.preventDefault();
                        dispatch(resetZoom());
                        break;
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [dispatch]);
};
