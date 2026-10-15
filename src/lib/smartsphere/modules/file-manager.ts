import type { DateInput, FileFormat, FileType, HttpCore } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface ExportItemDto {
  id?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  createdAtUtc: DateInput;
  fileType?: string | null;
  fileFormat?: string | null;
  contentLength: number;
  sha256?: string | null;
  meta?: string | null;
}

export interface ListExportsQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  fromUtc?: DateInput;
  toUtc?: DateInput;
  groupId?: string;
  search?: string;
  sortDesc?: boolean;
}

export interface ListExportsResponseDto {
  status: boolean;
  total: number;
  items?: ExportItemDto[] | null;
  message?: string | null;
}

export interface UploadInboxRequest {
  file: Blob;
  fileType?: FileType;
  fileFormat?: FileFormat;
  groupId?: string;
  uploader?: string;
  sourceEndpoint?: string;
}

export interface UploadInboxResponseDto {
  status: boolean;
  message?: string | null;
  inboxId?: string | null;
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class FileManagerModule {
  constructor(private readonly http: HttpCore) {}

  listExports(query: ListExportsQuery = {}) {
    return this.http.get<ListExportsResponseDto>(
      "/Api/v1/FileManager/Exports",
      query,
    );
  }

  downloadExport(id: string) {
    return this.http.getRaw(
      `/Api/v1/FileManager/Exports/${encodeURIComponent(id)}/Download`,
      undefined,
      { Accept: "application/pdf, application/octet-stream, */*" },
    );
  }

  downloadLatestImport(fileType?: FileType, fileFormat?: FileFormat) {
    return this.http.getRaw(
      "/Api/v1/FileManager/Imports/Latest/Download",
      { fileType, fileFormat },
      { Accept: "application/pdf, application/octet-stream, */*" },
    );
  }

  uploadFile(body: UploadInboxRequest) {
    const form = new FormData();
    form.append("File", body.file);
    if (body.fileType !== undefined)
      form.append("FileType", String(body.fileType));
    if (body.fileFormat !== undefined)
      form.append("FileFormat", String(body.fileFormat));
    if (body.groupId !== undefined) form.append("GroupId", body.groupId);
    if (body.uploader !== undefined) form.append("Uploader", body.uploader);
    if (body.sourceEndpoint !== undefined)
      form.append("SourceEndpoint", body.sourceEndpoint);
    return this.http.postForm<UploadInboxResponseDto>(
      "/Api/v1/FileManager/Uploads",
      form,
    );
  }
}
