import React from 'react';
import WaveLogoLoader from './WaveLogoLoader';

const LoadingScreen = ({ progress, animationState }) => {
    // Define styles based on state
    const isExpanding = animationState === 'expanding';
    const isDone = animationState === 'done';

    const containerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 9999, // Place above everything
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#005394', // Keep Blue, no white flash
        opacity: (isExpanding || isDone) ? 0 : 1, // Fade out immediately when expanding starts
        pointerEvents: (isExpanding || isDone) ? 'none' : 'auto', // Pass through
        transition: 'opacity 1s ease-out', // Smooth fade out
    };

    return (
        <div style={containerStyle} className="loading-screen-root">
            <WaveLogoLoader progress={progress} />
        </div>
    );
};

export default LoadingScreen;
