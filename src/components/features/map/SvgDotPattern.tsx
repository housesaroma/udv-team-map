import React from "react";

interface SvgDotPatternProps {
    position: { x: number; y: number };
}

export const SvgDotPattern: React.FC<SvgDotPatternProps> = ({ position }) => {
    return (
        <svg
            className="absolute inset-0 pointer-events-none w-full h-full"
            style={{
                background: "transparent",
            }}
        >
            <defs>
                <pattern
                    id="dot-pattern"
                    x={position.x % 20}
                    y={position.y % 20}
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                >
                    <circle
                        cx="2"
                        cy="2"
                        r="1.5"
                        fill="rgba(156, 163, 175, 0.3)"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
    );
};