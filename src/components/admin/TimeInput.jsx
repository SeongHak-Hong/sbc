import React, { useState, useEffect } from 'react';

const TimeInput = ({ value, onChange }) => {
    const [ampm, setAmpm] = useState('오전');
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Sync from prop to local state only when not focused, or when value is empty (reset)
    useEffect(() => {
        if (!isFocused) {
            if (!value) {
                setAmpm('오전');
                setHour('');
                setMinute('');
                return;
            }
            
            let newAmpm = '오전';
            if (value.includes('오후')) newAmpm = '오후';
            
            const matches = value.match(/\d{1,2}/g);
            let newHour = '';
            let newMinute = '';
            if (matches) {
                if (matches[0]) newHour = matches[0];
                if (matches[1]) newMinute = matches[1];
            }

            setAmpm(newAmpm);
            setHour(newHour);
            setMinute(newMinute);
        }
    }, [value, isFocused]);

    const updateParent = (a, h, m) => {
        const formattedHour = h.padStart(2, '0') || '00';
        const formattedMinute = m.padStart(2, '0') || '00';
        onChange(`${a} ${formattedHour}:${formattedMinute}`);
    };

    const handleAmpmChange = (e) => {
        const val = e.target.value;
        setAmpm(val);
        updateParent(val, hour, minute);
    };

    const handleHourChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 2);
        if (val !== '' && parseInt(val) > 12) val = '12';
        setHour(val);
        updateParent(ampm, val, minute);
    };

    const handleMinuteChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 2);
        if (val !== '' && parseInt(val) > 59) val = '59';
        setMinute(val);
        updateParent(ampm, hour, val);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select 
                value={ampm} 
                onChange={handleAmpmChange}
                style={{ padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', fontSize: '14px' }}
            >
                <option value="오전">오전</option>
                <option value="오후">오후</option>
            </select>
            <input 
                type="text" 
                value={hour} 
                onChange={handleHourChange} 
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setIsFocused(false);
                    // auto pad on blur
                    const padded = hour.padStart(2, '0');
                    if (hour !== padded) {
                        setHour(padded);
                    }
                }}
                placeholder="00"
                style={{ width: '60px', padding: '0', textAlign: 'center', height: '48px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            />
            <span style={{ fontWeight: 'bold', color: '#333' }}>:</span>
            <input 
                type="text" 
                value={minute} 
                onChange={handleMinuteChange} 
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setIsFocused(false);
                    const padded = minute.padStart(2, '0');
                    if (minute !== padded) {
                        setMinute(padded);
                    }
                }}
                placeholder="00"
                style={{ width: '60px', padding: '0', textAlign: 'center', height: '48px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            />
        </div>
    );
};

export default TimeInput;
