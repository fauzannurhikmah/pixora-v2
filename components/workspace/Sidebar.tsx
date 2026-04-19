'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { TOOLS, type ToolId } from './constants';

interface Props {
    activeTool: ToolId;
    onSelect: (id: ToolId) => void;
}

export default function Sidebar({ activeTool, onSelect }: Props) {
    return (
        <aside className="relative flex flex-col h-screen w-[210px] shrink-0 p-2 z-20">
            {/* Floating glass panel */}
            <div className="absolute inset-2 rounded-[1.5rem] border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl shadow-2xl pointer-events-none" />

            {/* Logo */}
            <div className="relative px-4 pt-4 pb-3">
                <Link href="/" className="flex items-center gap-2 group w-fit">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-lg bg-indigo-500/50 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>
                    <span className="font-bold text-sm tracking-tight">Pixora</span>
                </Link>
            </div>

            <div className="relative mx-4 h-px bg-white/[0.06]" />

            {/* Tool list */}
            <nav className="relative flex flex-col gap-0.5 flex-1 px-2 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600 px-2 mb-2">
                    Tools
                </p>

                {TOOLS.map((tool) => {
                    const isActive = activeTool === tool.id;
                    return (
                        <motion.button
                            key={tool.id}
                            onClick={() => onSelect(tool.id)}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-colors duration-150
                ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {/* Animated active pill */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className={`absolute inset-0 rounded-xl border ${tool.glow}`}
                                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                />
                            )}

                            <tool.icon className={`relative w-4 h-4 shrink-0 transition-colors ${isActive ? tool.color : ''}`} />
                            <span className="relative text-xs font-medium">{tool.label}</span>

                            {/* Active dot */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-dot"
                                    className="absolute right-3 w-1 h-1 rounded-full bg-white/40"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            {/* Footer shortcut hint */}
            <div className="relative px-4 pb-4 text-center">
                <span className="text-[9px] text-gray-700">
                    Press{' '}
                    <kbd className="px-1 py-0.5 rounded border border-white/10 bg-white/[0.04] text-gray-600">?</kbd>
                    {' '}for shortcuts
                </span>
            </div>
        </aside>
    );
}