'use client';

import { useEffect, useState } from 'react';

interface Props {
    to: number;
    suffix?: string;
}

export default function Counter({ to, suffix = '' }: Props) {
    const [val, setVal] = useState(0);

    useEffect(() => {
        let current = 0;
        const step = Math.ceil(to / 60);
        const timer = setInterval(() => {
            current = Math.min(current + step, to);
            setVal(current);
            if (current >= to) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [to]);

    return <>{val.toLocaleString()}{suffix}</>;
}