import React from 'react';

export const Grainient = ({
    color1 = "#FBC2EB",
    color2 = "#A6C1EE",
    color3 = "#B497CF",
    timeSpeed = 0.25,
    noiseScale = 2,
    grainAmount = 0.1,
    // Other props are ignored in this pure CSS fallback
    ...props
}) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            overflow: 'hidden',
            zIndex: 0,
            background: `linear-gradient(120deg, ${color1}, ${color2}, ${color3})`,
            backgroundSize: '400% 400%',
            animation: `grainientMove ${10 / (timeSpeed || 0.25)}s ease infinite`,
        }}>
            {grainAmount > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${noiseScale * 0.4}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    opacity: grainAmount,
                    mixBlendMode: 'overlay',
                    pointerEvents: 'none',
                }}></div>
            )}
            <style>
                {`
                @keyframes grainientMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                `}
            </style>
        </div>
    );
};
