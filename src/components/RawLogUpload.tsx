import { ChangeEvent, useRef, useState } from "react";
import { CheckCircle2, FileText, LoaderCircle, Plus, Upload } from "lucide-react";
import { importEventFile } from "../api/search";

type UploadStatus = "idle" | "uploading" | "accepted" | "error";

interface RawLogUploadProps {
  compact: boolean;
}

export function RawLogUpload({ compact }: RawLogUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("JSONL or canonical CSV");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setMessage("Submitting to ingest API");

    try {
      const response = await importEventFile(file);
      setStatus("accepted");
      setMessage(`${response.format.toUpperCase()} accepted`);
    } catch (uploadError) {
      setStatus("error");
      setMessage(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      event.target.value = "";
    }
  }

  const statusLine = (
    <div className="raw-upload-status">
      {status === "accepted" ? <CheckCircle2 size={14} /> : null}
      <span>{fileName || message}</span>
    </div>
  );

  return (
    <section className={`raw-upload ${compact ? "raw-upload-compact" : "raw-upload-full"} raw-upload-${status}`}>
      <button
        className="raw-upload-trigger"
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        aria-label="Send raw log file"
      >
        {status === "uploading" ? <LoaderCircle className="spin" size={compact ? 20 : 17} /> : compact ? <Plus size={23} /> : <Upload size={17} />}
        {!compact ? <span>{status === "uploading" ? "Uploading" : "Send raw log"}</span> : null}
      </button>
      <input ref={inputRef} type="file" accept=".jsonl,.csv,application/x-ndjson,text/csv" onChange={handleFileChange} />

      {!compact ? (
        <>
          {statusLine}
          {fileName ? <small>{message}</small> : null}
        </>
      ) : null}

      {!compact ? (
        <div className="raw-upload-popover">
          <div className="raw-upload-header">
            <FileText size={17} />
            <span>Raw Log Intake</span>
          </div>
          <div className="raw-upload-action">
            {status === "uploading" ? <LoaderCircle className="spin" size={17} /> : <Upload size={17} />}
            <span>{status === "uploading" ? "Uploading" : "Send raw log"}</span>
          </div>
          {statusLine}
          {fileName ? <small>{message}</small> : null}
        </div>
      ) : null}
    </section>
  );
}
