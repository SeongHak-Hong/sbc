import React from 'react';
import { motion, useIsPresent, useReducedMotion } from 'framer-motion';

// 제목 아래 고르기 창 (교회 일정 연월 · 예배 영상 종류 · 소식 종류).
// 감쇠 1.0 스프링(튕김 없음)으로 열고 닫는다. 닫히는 동안(0.3초)엔 누름을 받지 않아,
// 그 사이 창 자리의 글을 눌러도 창 안 버튼이 눌리지 않는다
const pickerSpring = { type: 'spring', bounce: 0, duration: 0.3 };

const PickerPopover = ({ className, label, children }) => {
    const isPresent = useIsPresent();
    const reduceMotion = useReducedMotion();
    return (
        <motion.div
            role="dialog"
            aria-label={label}
            className={className}
            style={{ pointerEvents: isPresent ? undefined : 'none' }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={reduceMotion ? { duration: 0.15 } : pickerSpring}
        >
            {children}
        </motion.div>
    );
};

export default PickerPopover;
