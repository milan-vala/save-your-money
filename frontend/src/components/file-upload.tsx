import { useCallback, useState, type MouseEvent } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Text } from "@radix-ui/themes";
import { FileText, Trash2, Upload } from "lucide-react";

const PDF_ACCEPT = {
  "application/pdf": [".pdf"],
} as const;

export type FileUploadProps = {
  onDrop: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  loading?: boolean;
  /** Hint shown under the drop zone */
  description?: string;
  /** For <label htmlFor> association with the hidden file input */
  inputId?: string;
  /** Visually emphasize validation error */
  hasError?: boolean;
  /** e.g. helper text id + error message id for screen readers */
  ariaDescribedBy?: string;
};

function formatMaxSizeMb(bytes: number): string {
  return `${bytes / 1024 / 1024} MB`;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function FileUpload({
  onDrop,
  maxFiles = 1,
  maxFileSize = 5 * 1024 * 1024,
  loading = false,
  description = "PDF only, up to the max size shown below.",
  inputId,
  hasError = false,
  ariaDescribedBy,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const syncToParent = useCallback(
    (next: File[]) => {
      setFiles(next);
      onDrop(next);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: (acceptedFiles) => {
        if (loading || acceptedFiles.length === 0) return;
        const next =
          maxFiles === 1
            ? [acceptedFiles[0]]
            : [...files, ...acceptedFiles].slice(0, maxFiles);
        syncToParent(next);
      },
      accept: PDF_ACCEPT,
      maxFiles,
      maxSize: maxFileSize,
      multiple: maxFiles > 1,
      validator: (file) => {
        const isPdf =
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
          return {
            code: "file-invalid-type",
            message: "Only PDF files are allowed.",
          };
        }
        if (file.size > maxFileSize) {
          return {
            code: "file-too-large",
            message: `File is too large (max ${formatMaxSizeMb(maxFileSize)}).`,
          };
        }
        return null;
      },
      disabled: loading,
    });

  const rootProps = getRootProps({
    ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
    ...(hasError ? { "aria-invalid": true as const } : {}),
  });

  const inputProps = getInputProps(inputId ? { id: inputId } : {});

  function handleRemove(index: number, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    const next = files.filter((_, i) => i !== index);
    syncToParent(next);
  }

  return (
    <div>
      <div
        {...rootProps}
        className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          isDragReject
            ? "cursor-not-allowed border-red-500/60 bg-red-500/5"
            : hasError
              ? "cursor-pointer border-red-500/60 bg-red-500/5"
              : isDragActive
                ? "cursor-pointer border-[--accent-8] bg-[--accent-3]/40"
                : "cursor-pointer border-[--gray-7] bg-[--gray-2]/40 hover:border-[--gray-8]"
        } ${loading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...inputProps} />
        {loading ? (
          <Text size="2" color="gray">
            Uploading…
          </Text>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload
              className="text-[--gray-11]"
              size={28}
              strokeWidth={1.75}
              aria-hidden
            />
            <Text size="2" weight="medium" className="text-[--gray-12]">
              {isDragActive
                ? "Drop the PDF here"
                : "Drag and drop a PDF here, or click to browse"}
            </Text>
            <Text size="1" color="gray" className="max-w-md">
              {description} Max {formatMaxSizeMb(maxFileSize)}
              {maxFiles > 1 ? ` · Up to ${maxFiles} files` : ""}.
            </Text>
            {isDragReject ? (
              <Text size="1" color="red">
                Only PDF files are supported.
              </Text>
            ) : null}
          </div>
        )}
      </div>

      {files.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-[--gray-6]/60 bg-[--gray-2]/40 px-3 py-2"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <FileText
                  size={18}
                  className="shrink-0 text-[--gray-11]"
                  aria-hidden
                />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium text-[--gray-12]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[--gray-11]">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                color="red"
                size="1"
                disabled={loading}
                className="shrink-0 cursor-pointer"
                aria-label={`Remove ${file.name}`}
                onClick={(event) => handleRemove(index, event)}
              >
                <Trash2 size={16} aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
