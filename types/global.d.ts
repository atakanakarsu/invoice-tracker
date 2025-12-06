// Type declarations for modules without types
declare module 'file-saver' {
    export function saveAs(data: Blob | File, filename?: string, options?: object): void;
}

declare module 'react-dropzone' {
    export interface DropzoneOptions {
        onDrop?: (acceptedFiles: File[], fileRejections: any[], event: any) => void;
        accept?: Record<string, string[]>;
        multiple?: boolean;
        maxSize?: number;
        maxFiles?: number;
        disabled?: boolean;
    }

    export interface DropzoneState {
        getRootProps: (props?: any) => any;
        getInputProps: (props?: any) => any;
        isDragActive: boolean;
        acceptedFiles: File[];
    }

    export function useDropzone(options?: DropzoneOptions): DropzoneState;
}
