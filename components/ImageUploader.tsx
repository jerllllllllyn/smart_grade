import React, { useRef } from 'react';
import { FileWithPreview, Language } from '../types';

interface ImageUploaderProps {
  label: string;
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  accept?: string;
  maxFiles?: number;
  language: Language;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  files,
  onFilesChange,
  accept = "image/*",
  maxFiles = 5,
  language
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      clickToUpload: "Click to upload images",
      subtitle: `PNG, JPG up to ${maxFiles} pages`,
      remove: "Remove image"
    },
    zh: {
      clickToUpload: "点击上传图片",
      subtitle: `支持 PNG, JPG (最多 ${maxFiles} 页)`,
      remove: "删除图片"
    }
  };

  const text = t[language];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileWithPreview[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Convert to Base64 immediately for simplicity in this demo
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data:image/xxx;base64, prefix
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(file);
        });

        newFiles.push({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: base64,
          mimeType: file.type
        });
      }
      
      onFilesChange([...files, ...newFiles]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-blue-900 mb-3">{label}</label>
      
      {/* Grid of existing images */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {files.map((file, idx) => (
            <div key={idx} className="relative group aspect-[3/4] bg-white rounded-lg overflow-hidden border-2 border-blue-200 hover:border-blue-500 transition-colors shadow-sm">
              <img 
                src={file.previewUrl} 
                alt={`preview ${idx}`} 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label={text.remove}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button Area */}
      {files.length < maxFiles && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-colors group bg-white"
        >
          <div className="bg-yellow-100 text-blue-700 border-2 border-blue-200 p-3 rounded-full mb-3 group-hover:scale-110 group-hover:border-blue-600 group-hover:bg-yellow-300 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <p className="text-sm font-bold text-blue-900 group-hover:text-blue-700">{text.clickToUpload}</p>
          <p className="text-xs text-blue-400 mt-1 font-medium">{text.subtitle}</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept={accept} 
            multiple 
            onChange={handleFileSelect} 
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;