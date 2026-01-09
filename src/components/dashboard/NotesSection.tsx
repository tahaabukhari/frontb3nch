
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

interface Note {
    id: string;
    title: string;
    content: string;
    date: number; // timestamp
    tags?: string[];
}

// --- Icons (Simple SVG Wrappers or Emojis) ---
const Icons = {
    Plus: () => <span className="text-xl">+</span>,
    Search: () => <span className="text-lg">🔍</span>,
    Trash: () => <span className="text-lg">🗑️</span>,
    Save: () => <span className="text-lg">💾</span>,
    Magic: () => <span className="text-lg">✨</span>,
    Back: () => <span className="text-lg">⬅️</span>,
    Edit: () => <span className="text-lg">✏️</span>,
};

// --- Modal Component ---

const AIModal = ({ isOpen, onClose, onGenerate }: { isOpen: boolean; onClose: () => void; onGenerate: (topic: string, desc: string) => void }) => {
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onGenerate(topic, description);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icons.Magic /> AI Note Generator
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Topic</label>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="e.g. Photosynthesis, The French Revolution"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description / Focus</label>
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white h-32 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Specific subtopics or requirements..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Generating...' : 'Generate Notes'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

// --- Main Component ---

export function NotesSection() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Load notes
    useEffect(() => {
        const saved = localStorage.getItem('user_notes');
        if (saved) {
            try {
                setNotes(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse notes", e);
            }
        }
    }, []);

    // Save notes
    useEffect(() => {
        localStorage.setItem('user_notes', JSON.stringify(notes));
    }, [notes]);

    const activeNote = notes.find(n => n.id === activeNoteId);

    const handleCreateNote = () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'Untitled Note',
            content: '',
            date: Date.now(),
        };
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote.id);
    };

    const handleDeleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this note?')) {
            setNotes(notes.filter(n => n.id !== id));
            if (activeNoteId === id) setActiveNoteId(null);
        }
    };

    const updateActiveNote = (updates: Partial<Note>) => {
        if (!activeNoteId) return;
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, ...updates, date: Date.now() } : n));
    };

    const handleAIGenerate = async (topic: string, description: string) => {
        const response = await fetch('/api/notes/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, description }),
        });

        const data = await response.json();

        if (data.content) {
            const newNote: Note = {
                id: crypto.randomUUID(),
                title: topic,
                content: data.content,
                date: Date.now(),
            };
            setNotes([newNote, ...notes]);
            setActiveNoteId(newNote.id);
        } else {
            alert('Failed to generate notes.');
        }
    };

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col md:flex-row h-[700px] border border-white/10 rounded-3xl bg-black/40 backdrop-blur-md overflow-hidden animate-in fade-in duration-500">
            <AIModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerate={handleAIGenerate}
            />

            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-white/10 flex flex-col bg-black/20 ${activeNoteId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/10 space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search notes..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:bg-white/10 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute left-3 top-2.5 opacity-50"><Icons.Search /></div>
                        </div>
                        <button
                            onClick={handleCreateNote}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                            title="New Note"
                        >
                            <Icons.Plus />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className="w-full py-2 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-200 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                        <Icons.Magic /> AI Generate Note
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredNotes.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10 text-sm">No notes found.</div>
                    ) : (
                        filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => setActiveNoteId(note.id)}
                                className={`p-3 rounded-xl cursor-pointer transition-all group relative ${activeNoteId === note.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <h4 className={`font-bold text-sm truncate ${activeNoteId === note.id ? 'text-indigo-200' : 'text-gray-300'}`}>{note.title || 'Untitled'}</h4>
                                <p className="text-xs text-gray-500 truncate mt-1">{note.content.substring(0, 50)}</p>
                                <span className="text-[10px] text-gray-600 mt-2 block">{new Date(note.date).toLocaleDateString()}</span>

                                <button
                                    onClick={(e) => handleDeleteNote(note.id, e)}
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400 transition-all"
                                >
                                    <Icons.Trash />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className={`flex-1 flex flex-col bg-black/10 ${!activeNoteId ? 'hidden md:flex' : 'flex'}`}>
                {activeNote ? (
                    <>
                        <div className="border-b border-white/10 p-4 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveNoteId(null)} className="md:hidden text-gray-400 hover:text-white">
                                    <Icons.Back />
                                </button>
                                <input
                                    type="text"
                                    value={activeNote.title}
                                    onChange={(e) => updateActiveNote({ title: e.target.value })}
                                    className="bg-transparent text-xl font-bold text-white focus:outline-none placeholder-gray-600"
                                    placeholder="Note Title"
                                />
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(activeNote.date).toLocaleString()}
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={activeNote.content}
                                onChange={(e) => updateActiveNote({ content: e.target.value })}
                                className="w-full h-full bg-transparent p-6 text-gray-300 leading-relaxed resize-none focus:outline-none scrollbar-thin scrollbar-thumb-white/10"
                                placeholder="Start typing your notes here..."
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50 pointer-events-none">
                        <span className="text-6xl mb-4">📓</span>
                        <p>Select a note or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
}
