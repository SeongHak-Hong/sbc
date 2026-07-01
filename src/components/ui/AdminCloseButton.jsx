import React from 'react';

const AdminCloseButton = ({ onClick, style, className }) => {
    return (
        <button 
            type="button"
            onClick={onClick}
            className={className}
            style={{ 
                background: 'rgba(255,0,0,0.8)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                padding: 0, 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                lineHeight: 1,
                flexShrink: 0,
                ...style 
            }}
        >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 'bold' }}>close</span>
        </button>
    );
};

export default AdminCloseButton;
