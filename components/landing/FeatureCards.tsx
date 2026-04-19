'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { FEATURES } from './constants';

export default function FeatureCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 w-full border-t border-white/5 pt-14">
            {FEATURES.map((f, i) => (
                <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                >
                    <SpotlightCard>
                        <div className={`w-9 h-9 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                            <f.icon className={`w-4 h-4 ${f.color}`} />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-light mb-4">{f.desc}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors group/link">
                            Learn more
                            <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </span>
                    </SpotlightCard>
                </motion.div>
            ))}
        </div>
    );
}