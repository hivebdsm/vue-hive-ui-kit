import { Ref, ref } from 'vue';

export interface IinitialFiles {
  file: File;
}

export default function (initialFilesRef: Ref<IinitialFiles[]>) {
  const files: Ref<File[]> = ref([]);

  function addFiles(newFiles: File[]) {
    let newUploadableFiles = [...newFiles]
      .map((file) => new UploadableFile(file))
      .filter((file) => !fileExists(file.id));
    files.value = files.value.concat(newUploadableFiles as unknown as File[]);
    initialFilesRef.value.length = 0;
  }

  function fileExists(otherId: string) {
    //@ts-ignore
    return files.value.some(({ id }) => id === otherId);
  }

  function removeFile(file: File) {
    const index = files.value.indexOf(file);

    if (index > -1) files.value.splice(index, 1);

    if (initialFilesRef.value.length > 0) {
      initialFilesRef.value.length = 0;
    }
  }

  return { files, addFiles, removeFile };
}

class UploadableFile implements IUploadableFile {
  constructor(file: File) {
    this.file = file;
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
    this.url = URL.createObjectURL(file);
    this.status = null;
  }
  file: File;
  id: string;
  url: string;
  status: 'uploading' | 'done' | 'error' | null;
}

interface IUploadableFile {
  file: File;
  id: string;
  url: string;
  status: 'uploading' | 'done' | 'error' | null;
}

export type { IUploadableFile };
