import { useState } from "react"
import {
  AlertCircleIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileText,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  Trash2Icon,
  UploadIcon,
  VideoIcon,
  XIcon,
} from "lucide-react"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { Viewer, Worker } from "@react-pdf-viewer/core"
import "@react-pdf-viewer/core/lib/styles/index.css"

const initialFiles = [
  {
    name: "example.pdf",
    size: 102400,
    type: "application/pdf",
    url: "https://example.com/example.pdf",
    id: "example-123",
  },
  {
    name: "intro.zip",
    size: 252873,
    type: "application/zip",
    url: "https://example.com/intro.zip",
    id: "intro.zip-1744638436563-8u5xuls",
  },
]

const getFileIcon = (file) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  const iconMap = {
    pdf: {
      icon: FileTextIcon,
      conditions: (type, name) =>
        type.includes("pdf") ||
        name.endsWith(".pdf") ||
        type.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx"),
    },
    archive: {
      icon: FileArchiveIcon,
      conditions: (type, name) =>
        type.includes("zip") ||
        type.includes("archive") ||
        name.endsWith(".zip") ||
        name.endsWith(".rar"),
    },
    excel: {
      icon: FileSpreadsheetIcon,
      conditions: (type, name) =>
        type.includes("excel") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx"),
    },
    video: {
      icon: VideoIcon,
      conditions: (type) => type.includes("video/"),
    },
    audio: {
      icon: HeadphonesIcon,
      conditions: (type) => type.includes("audio/"),
    },
    image: {
      icon: ImageIcon,
      conditions: (type) => type.startsWith("image/"),
    },
  }

  for (const { icon: Icon, conditions } of Object.values(iconMap)) {
    if (conditions(fileType, fileName)) {
      return <Icon className="size-5 opacity-60" />
    }
  }

  return <FileIcon className="size-5 opacity-60" />
}

const simulateUpload = (totalBytes, onProgress, onComplete) => {
  let timeoutId
  let uploadedBytes = 0
  let lastProgressReport = 0

  const simulateChunk = () => {
    const chunkSize = Math.floor(Math.random() * 300000) + 2000
    uploadedBytes = Math.min(totalBytes, uploadedBytes + chunkSize)

    const progressPercent = Math.floor((uploadedBytes / totalBytes) * 100)

    if (progressPercent > lastProgressReport) {
      lastProgressReport = progressPercent
      onProgress(progressPercent)
    }

    if (uploadedBytes < totalBytes) {
      const delay = Math.floor(Math.random() * 450) + 50
      const extraDelay = Math.random() < 0.05 ? 500 : 0
      timeoutId = setTimeout(simulateChunk, delay + extraDelay)
    } else {
      onComplete()
    }
  }

  timeoutId = setTimeout(simulateChunk, 100)

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

export default function DocumentUploader({onPreviewPdf }) {
  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024
  const maxFiles = 6

  const [uploadProgress, setUploadProgress] = useState([])
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null)

  const handleFilesAdded = (addedFiles) => {
    const newProgressItems = addedFiles.map((file) => ({
      fileId: file.id,
      progress: 0,
      completed: false,
    }))
    setUploadProgress((prev) => [...prev, ...newProgressItems])

    const cleanupFunctions = []

    addedFiles.forEach((file) => {
      const fileSize = file.file instanceof File ? file.file.size : file.file.size

      const cleanup = simulateUpload(
        fileSize,
        (progress) => {
          setUploadProgress((prev) =>
            prev.map((item) =>
              item.fileId === file.id ? { ...item, progress } : item
            )
          )
        },
        () => {
          setUploadProgress((prev) =>
            prev.map((item) =>
              item.fileId === file.id ? { ...item, completed: true } : item
            )
          )
        }
      )

      cleanupFunctions.push(cleanup)
    })

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }

  const handleFileRemoved = (fileId) => {
    setUploadProgress((prev) => prev.filter((item) => item.fileId !== fileId))
  }

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    initialFiles,
    onFilesAdded: handleFilesAdded,
  })

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors"
      >
        <input {...getInputProps()} className="sr-only" aria-label="Upload file" />
        {files.length > 0 ? (
          <div className="flex flex-col w-full gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium truncate">
                Ficheiros ({files.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" type="button" size="sm" onClick={openFileDialog}>
                  <UploadIcon className="mr-1 size-4" />
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setUploadProgress([])
                    clearFiles()
                    setSelectedPdfUrl(null)
                  }}
                >
                  <Trash2Icon className="mr-1 size-4" />
                  Remover tudo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {files.map((file) => {
                const fileProgress = uploadProgress.find((p) => p.fileId === file.id)
                const isUploading = fileProgress && !fileProgress.completed
                const fileUrl =
                  file.file instanceof File
                    ? URL.createObjectURL(file.file)
                    : file.file.url

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-2 p-2 border rounded-md bg-background"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-1 border rounded">{getFileIcon(file)}</div>
                      <div className="flex flex-col text-sm">
                        <span className="truncate max-w-[200px] font-medium">
                          {file.file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(file.file.size)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.file.type.includes("pdf") && (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => onPreviewPdf(fileUrl)}
                        >
                          Visualizar
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          handleFileRemoved(file.id)
                          removeFile(file.id)
                        }}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <FileText className="mx-auto mb-2 size-6 text-muted-foreground" />
            <p>Arraste os ficheiros aqui ou clique abaixo:</p>
            <Button variant="outline" type="button" className="mt-3" onClick={openFileDialog}>
              <UploadIcon className="mr-1 size-4" />
              Selecionar ficheiros
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircleIcon className="size-4" />
          {errors[0]}
        </div>
      )}

      {selectedPdfUrl && (
        <div className="mt-6 border rounded-lg overflow-hidden h-[80vh]">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={selectedPdfUrl} />
          </Worker>
        </div>
      )}
    </div>
  )
}
