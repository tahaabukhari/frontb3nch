'use client';

import type { DragEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';

type UploadState = 'idle' | 'reading' | 'ready' | 'error';

const ImportPage = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [status, setStatus] = useState<UploadState>('idle');
  const [error, setError] = useState<string>('');
  const { upload, setUploadSource } = useStore(
    useShallow((state) => ({
      upload: state.upload,
      setUploadSource: state.actions.setUploadSource,
    }))
  );

  const persistFile = useCallback(
    (file?: File) => {
      if (!file) return;
      if (file.type !== 'application/pdf') {
        setStatus('error');
        setError('Please upload a PDF file. DOC/DOCX will be supported later.');
        return;
      }
      setStatus('reading');
      setError('');
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        setUploadSource({
          name: file.name,
          size: file.size,
          dataUrl,
          lastModified: file.lastModified,
        });
        setStatus('ready');
      };
      reader.onerror = () => {
        setStatus('error');
        setError('Unable to read file. Please try another PDF.');
      };
      reader.readAsDataURL(file);
    },
    [setUploadSource]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      const [file] = Array.from(event.dataTransfer.files);
      persistFile(file);
    },
    [persistFile]
  );

  const goToDifficulty = () => {
    if (!upload) {
      setStatus('error');
      setError('Upload a PDF first so we can generate questions later.');
      return;
    }
    router.push('/play/difficulty?quiz=upload');
  };

  return (
    <motion.section
      className="min-h-screen bg-dark-bg px-4 py-14 sm:px-6 sm:py-16"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="sr-only">Upload PDF for quiz generation</h1>
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <header>
          <p className="text-3xl font-bold text-white sm:text-4xl">Upload your PDF</p>
          <p className="mt-3 text-base text-gray-400 sm:text-lg">Upload your PDF</p>
        </header>
        <label
          htmlFor="uploader"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-slate-600 transition hover:border-primary hover:bg-white cursor-pointer sm:px-8 sm:py-16"
        >
          <span className="text-lg font-semibold text-slate-800">
            {fileName || 'Drag & drop or click to browse'}
          </span>
          {status === 'ready' && upload && (
            <span className="text-sm text-emerald-700">✓ Ready to continue</span>
          )}
          {status === 'reading' && <span className="text-sm text-slate-500">Reading file...</span>}
          {error && <span className="text-sm text-rose-600">{error}</span>}
          <input
            id="uploader"
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(event) => persistFile(event.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          onClick={goToDifficulty}
          className="min-h-[48px] w-full rounded-2xl bg-gradient-gold px-6 py-3.5 text-base font-semibold text-dark-bg shadow-lg transition hover:opacity-90 sm:text-lg">
          Continue
        </button>
      </div>
    </motion.section>
  );
};

export default ImportPage;
