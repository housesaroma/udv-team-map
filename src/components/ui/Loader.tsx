import React from "react";

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    overlay?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
    size = "md", 
    text = "Загрузка", 
    overlay = false 
}) => {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10", 
        lg: "w-14 h-14"
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`${sizeClasses[size]} relative`}>
                <svg 
                    viewBox="0 0 50 50" 
                    className="w-full h-full loader-spin"
                >
                    <circle 
                        cx="25" 
                        cy="25" 
                        r="20" 
                        fill="none" 
                        stroke="#28CA9E"
                        strokeWidth="4"
                        strokeOpacity="0.3"
                    />
                    <circle 
                        cx="25" 
                        cy="25" 
                        r="20" 
                        fill="none" 
                        stroke="#28CA9E"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="80 180"
                        transform="rotate(-90 25 25)"
                    />
                </svg>
            </div>
            
            {/* Текст с анимированными точками */}
            <div className="flex items-center justify-center gap-1 min-w-[140px] h-8">
                <span className="text-accent font-inter font-medium text-xl">
                    {text}
                </span>
                
                {/* Анимированные точки */}
                <div className="loading-dots ml-1">
                    <span className="dot text-2xl">.</span>
                    <span className="dot text-2xl">.</span>
                    <span className="dot text-2xl">.</span>
                </div>
            </div>
        </div>
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
};