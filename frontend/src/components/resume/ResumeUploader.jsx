import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { Card } from '../common/Card';
import { useToast } from '../../context/ToastContext';

export const ResumeUploader = ({ onFileUpload, onDelete, currentResume, uploading, required = false }) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    const valid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isValid = valid.includes(file.type) || file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx');
    if (!isValid) { addToast('Please upload a valid PDF or DOCX file.', 'error'); return; }
    onFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const formatSize = (bytes) => bytes ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : '';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Upload Resume {required && <span className="text-rose-400">*</span>}</h3>
          <p className="text-xs text-slate-400">Upload a PDF or DOCX resume for interview planning and resume analysis</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
          PDF & DOCX
        </span>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${isDragging ? 'border-sky-400 bg-sky-500/10 scale-[1.01]' : 'border-[#1e2a47] hover:border-sky-500/50 bg-[#090d17]/60 hover:bg-[#0c1220]'}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-sky-400/20 border border-sky-500/30 mx-auto flex items-center justify-center mb-4 text-sky-400 shadow-lg shadow-sky-500/10">
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        </div>

        <h4 className="text-sm font-semibold text-white mb-1">
          {uploading ? 'Parsing resume...' : <>Drag and drop or <span className="text-sky-400 underline underline-offset-2">browse files</span></>}
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {uploading ? 'Extracting readable text from your resume.' : 'Parsed resume text powers your interview and ATS analysis.'}
        </p>

        {!uploading && currentResume && (
          <div className="inline-flex items-center gap-3 p-2.5 px-4 rounded-xl bg-[#0e1628] border border-sky-500/30 text-xs text-slate-200 text-left mt-4">
            <FileText className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="font-semibold block truncate max-w-xs">{currentResume.originalName}</span>
              <span className="text-[10px] text-slate-400">{formatSize(currentResume.fileSize)} | {formatDate(currentResume.createdAt)}</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
          </div>
        )}
      </div>

      {currentResume && onDelete && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete resume</span>
          </button>
        </div>
      )}
    </Card>
  );
};
