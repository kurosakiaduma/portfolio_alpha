import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface TechTagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

function normalisedTag(tag: string): string {
    return tag.trim().toLowerCase();
}

function tokenise(raw: string): string[] {
    return raw.split(/[,\s]+/).map(t => t.trim()).filter(Boolean);
}

export function TechTagInput({ tags, onChange, placeholder = 'React, TypeScript...' }: TechTagInputProps) {
    const [rawInput, setRawInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const addTags = (newTags: string[]) => {
        const existing = new Set(tags.map(normalisedTag));
        const toAdd = newTags
            .map(t => t.trim())
            .filter(t => t.length > 0 && !existing.has(normalisedTag(t)));
        if (toAdd.length > 0) {
            onChange([...tags, ...toAdd]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const tokens = tokenise(rawInput);
            if (tokens.length > 0) {
                addTags(tokens);
                setRawInput('');
            }
        } else if (e.key === 'Backspace' && rawInput === '' && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        const tokens = tokenise(pasted);
        addTags(tokens);
        setRawInput('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // If the user types a comma directly, tokenise immediately
        const val = e.target.value;
        if (val.includes(',')) {
            const tokens = tokenise(val);
            addTags(tokens);
            setRawInput('');
        } else {
            setRawInput(val);
        }
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div
            className="min-h-[42px] w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 flex flex-wrap gap-2 items-center focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-colors cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map((tag, i) => (
                <span
                    key={`${tag}-${i}`}
                    className="flex items-center gap-1 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded px-2 py-0.5"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                        aria-label={`Remove ${tag}`}
                    >
                        <X size={12} />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={rawInput}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={tags.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[120px] bg-transparent text-slate-200 text-sm outline-none placeholder:text-slate-500"
            />
        </div>
    );
}
