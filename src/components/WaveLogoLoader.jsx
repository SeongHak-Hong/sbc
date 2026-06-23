import React from 'react';
import logoSbc from '../assets/logo_sbc.svg';

const WaveLogoLoader = ({ progress }) => {
    // Robust "Two Image" approach for wave fill effect
    // 1. Background Image: Faint Opacity (Base)
    // 2. Foreground Image: Full Opacity, cropped by parent container height

    return (
        <div style={{ position: 'relative', width: '300px', height: '100px' }}>
            {/* 1. Base Logo (Faint) */}
            <img
                src={logoSbc}
                alt="Loading Base"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: 0.3
                }}
            />

            {/* 2. Wave/Fill Mask Container */}
            <div style={{
                position: 'absolute',
                bottom: 0, // Fill from bottom
                left: 0,
                width: '100%',
                height: `${progress}%`, // Height controls the "fill" level
                overflow: 'hidden', // Crops the image inside
                overflow: 'hidden', // Crops the image inside
                // transition: 'height 0.1s linear' // REMOVED: JS updates drive animation directly for better smoothness
            }}>
                {/* Foreground Logo (Full Brightness) */}
                {/* Positioned at bottom so it stays anchored as container grows */}
                <img
                    src={logoSbc}
                    alt="Loading Fill"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        // Key: Height must match the ROOT container height (100px) 
                        // to ensure the image scale stays constant while cropping.
                        height: '100px',
                        objectFit: 'contain',
                        maxWidth: '300px' // Match root width
                    }}
                />
            </div>
        </div>
    );
};

export default WaveLogoLoader;
