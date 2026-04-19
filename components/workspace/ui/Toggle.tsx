'use client';

import { motion } from 'framer-motion';

interface Option<T extends string> {
    value: T;
    label: string;
}

interface Props<T extends string> {
    options: Option<T>[];
    value: T;
    onChange: (v: T) => void;
}

export default function Toggle<T extends string>({ options, value, onChange }: Props<T>) {
    return (
        <div className="inline-flex p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.06] w-full">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`relative flex-1 py-2 rounded-[10px] text-xs font-medium transition-colors duration-200
            ${value === opt.value ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {value === opt.value && (
                        <motion.div
                            layoutId="toggle-bg"
                            className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-indigo-600/60 to-purple-600/50 border border-indigo-500/30"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                    )}
                    <span className="relative">{opt.label}</span>
                </button>
            ))}
        </div>
    );
}