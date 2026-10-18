'use client';
import { ArrowDownTray } from '@cms/icons';
import { clx, Text } from '@cms/ui';
import { useEffect, useId, useRef, useState } from 'react';
export interface FileType {
  id: string;
  url: string;
  file: File /** Release a temporary object URL before this uploader unmounts. */;
  revoke: () => void;
}
export interface RejectedFile {
  file: File;
  reason: 'size' | 'format' | 'multiple';
}
export interface FileUploadProps {
  label: string;
  multiple?: boolean;
  hint?: string;
  hasError?: boolean;
  formats?: string[];
  maxFileSize?: number;
  onUploaded: (files: FileType[], rejectedFiles: RejectedFile[]) => void;
  disabled?: boolean;
  createPreview?: boolean;
  className?: string;
}
export function isFileFormatAccepted(file: Pick<File, 'name' | 'type'>, formats: readonly string[]): boolean {
  if (!formats.length || formats.includes('*') || formats.includes('*/*')) return true;
  return formats.some((format) => {
    const normalized = format.toLowerCase().trim();
    const type = file.type.toLowerCase();
    if (normalized.endsWith('/*')) return type.startsWith(normalized.slice(0, -1));
    if (normalized.includes('/')) return type === normalized;
    return file.name.toLowerCase().endsWith(normalized.startsWith('.') ? normalized : `.${normalized}`);
  });
}
export function FileUpload({
  label,
  hint,
  multiple = true,
  hasError,
  formats = [],
  maxFileSize = 1024 * 1024,
  onUploaded,
  disabled,
  createPreview = true,
  className,
}: FileUploadProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef(new Set<string>());
  const [dragging, setDragging] = useState(false);
  useEffect(
    () => () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current.clear();
    },
    [],
  );
  const receive = (files: FileList | null) => {
    if (disabled || !files) return;
    const accepted: FileType[] = [];
    const rejected: RejectedFile[] = [];
    const limit = Number.isNaN(maxFileSize) ? 1024 * 1024 : Math.max(0, maxFileSize);
    for (const file of Array.from(files)) {
      if (!isFileFormatAccepted(file, formats)) {
        rejected.push({ file, reason: 'format' });
        continue;
      }
      if (file.size > limit) {
        rejected.push({ file, reason: 'size' });
        continue;
      }
      if (!multiple && accepted.length) {
        rejected.push({ file, reason: 'multiple' });
        continue;
      }
      const url = createPreview && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '';
      if (url) urls.current.add(url);
      accepted.push({
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${accepted.length}-${Math.random().toString(36).slice(2)}`,
        file,
        url,
        revoke: () => {
          if (url && urls.current.delete(url)) URL.revokeObjectURL(url);
        },
      });
    }
    try {
      onUploaded(accepted, rejected);
    } catch (error) {
      accepted.forEach((file) => file.revoke());
      throw error;
    }
    if (input.current) input.current.value = '';
  };
  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        aria-invalid={hasError || undefined}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          receive(event.dataTransfer.files);
        }}
        className={clx(
          'bg-ui-bg-component border-ui-border-strong hover:border-ui-border-interactive focus-visible:shadow-borders-focus flex w-full flex-col items-center gap-2 rounded-lg border border-dashed p-8 outline-none disabled:cursor-not-allowed disabled:opacity-50',
          (dragging || hasError) && 'border-ui-border-interactive',
          hasError && 'border-ui-border-error',
        )}
      >
        <ArrowDownTray className="text-ui-fg-muted" />
        <Text size="small" weight="plus">
          {label}
        </Text>
        {hint && (
          <Text id={`${id}-hint`} size="small" className="text-ui-fg-subtle">
            {hint}
          </Text>
        )}
      </button>
      <input
        ref={input}
        type="file"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        disabled={disabled}
        multiple={multiple}
        accept={formats.map((format) => (format.includes('/') || format.startsWith('.') ? format : `.${format}`)).join(',') || undefined}
        onChange={(event) => receive(event.target.files)}
      />
    </div>
  );
}
