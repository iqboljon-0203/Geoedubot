import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

export const FileUpload = ({
  file,
  onFileSelect,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/msword': ['.doc', '.docx'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
}: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    return '📎';
  };

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                'relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer',
                isDragActive
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-zinc-300 hover:border-blue-500 hover:bg-zinc-50'
              )}
            >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center">
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className={cn(
                  'w-16 h-16 rounded-2xl mb-4 flex items-center justify-center',
                  isDragActive ? 'bg-blue-600' : 'bg-zinc-100'
                )}
              >
                <Upload
                  className={cn(
                    'w-8 h-8',
                    isDragActive ? 'text-white' : 'text-zinc-600'
                  )}
                />
              </motion.div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                {isDragActive ? 'Drop file here' : 'Upload file'}
              </h3>
              <p className="text-sm text-zinc-600 mb-4">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-zinc-500">
                PDF, DOC, DOCX, PNG, JPG (Max {formatFileSize(maxSize)})
              </p>
            </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative border-2 border-zinc-200 rounded-3xl p-6 bg-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{getFileIcon(file.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-zinc-900 truncate mb-1">
                  {file.name}
                </h4>
                <p className="text-xs text-zinc-600">
                  {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onFileSelect(null)}
                className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-red-600" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
