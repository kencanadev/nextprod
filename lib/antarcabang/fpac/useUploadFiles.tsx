import { useRef, useState } from 'react';
import { UploaderComponent } from '@syncfusion/ej2-react-inputs';
import moment from 'moment';
import axios from 'axios';
import JSZip from 'jszip';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
const useUploadFiles = (props: any) => {
  const { kode_dokumen, kode_entitas } = props;

  const [dataFiles, setDataFiles] = useState<any>([]);

  let uploaderRefFiles = useRef<UploaderComponent>(null);

  const handleFileSelect = (args: any) => {
    const file = args.filesData[0].rawFile;
    const fileName = file.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf('.');
    const fileExtension = fileName.substring(lastDotIndex + 1).toLowerCase();
    const modifiedName = `AC${moment().format('YYMMDDHHmmss')}.${fileExtension}`;

    const fileData = {
      id: dataFiles.length + 101,
      name: fileName,
      modifiedName,
      preview: URL.createObjectURL(file),
      rawFile: new Blob([file], { type: file.type }),
      type: fileExtension,
      dokumen: 'AC',
    };

    console.log('file: ', fileData);
    setDataFiles((prev: any) => [...prev, fileData]);
  };

  const handleUpload = async (kode_dokumen: any) => {
    let combinedArray: any[] = [];
    try {
      // Hapus File di tb images
      for (let i = 0; i < dataFiles.length; i++) {
        const id_dokumen = i + 101;

        await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
          params: {
            entitas: kode_entitas,
            param1: kode_dokumen,
            param2: id_dokumen, // id di tbm_images
          },
        });
      }

      console.log('dataFiles: ', dataFiles);

      for (const file of dataFiles) {
        try {
          const latDotIndex = file.name.lastIndexOf('.');
          const fileExtension = file.name.slice(latDotIndex + 1).toLowerCase();
          const namaImage = file.modifiedName ? `AC${moment().format('YYMMDDHHmmss')}.${fileExtension}` : file.modifiedName;

          const formData = new FormData();
          formData.append('myimage', file.rawFile);
          formData.append('ets', kode_entitas);
          formData.append('nama_file_image', namaImage);
          formData.append('id', file.id.toString());
          formData.append('dokumen', file.dokumen);
          formData.append('kode_dokumen', kode_dokumen);

          const response = await axios.post(`${apiUrl}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (response.status == 200) {
            try {
              await axios.delete(`${apiUrl}/erp/hapus_file_pendukung_ftp`, {
                params: {
                  entitas: kode_entitas,
                  param1: file.modifiedName,
                },
              });
            } catch (error) {
              console.error('Error deleting FTP File: ', file.modifiedName);
            }

            const json = {
              entitas: kode_entitas,
              kode_dokumen,
              id_dokumen: file.id.toString(),
              dokumen: file.dokumen,
              filegambar: namaImage,
              fileoriginal: file.name,
            };

            combinedArray.push(json);
          }
        } catch (error) {
          const json = {
            entitas: kode_entitas,
            kode_dokumen,
            id_dokumen: file.id.toString(),
            dokumen: file.dokumen,
            filegambar: file.modifiedName,
            fileOriginal: file.name,
          };

          combinedArray.push(json);
        }
      }

      // for (let i = 0; i < dataFiles.length; i++) {
      //   const item = dataFiles[i];

      //   const zip = new JSZip();

      //   const filename = item.name;
      //   const file = item.rawFile;
      //   zip.file(filename, file);

      //   const zipBlob = await zip.generateAsync({ type: 'blob' });
      //   const formData = new FormData();
      //   formData.append('myimage', zipBlob);
      //   formData.append('ets', kode_entitas);
      //   formData.append('nama_file_image', `${item.modifiedName}`);
      //   formData.append('id', item.id.toString());
      //   formData.append('dokumen', 'AC');
      //   formData.append('kode_dokumen', kode_dokumen);

      //   const response = await axios.post(`${apiUrl}/upload`, formData, {
      //     headers: { 'Content-Type': 'multipart/form-data' },
      //   });

      //   if (response.status !== 200) {
      //     console.error(`Upload gagal untuk file: ${item.name}`);
      //   }

      //   const josn = {
      //     entitas: kode_entitas,
      //     kode_dokumen,
      //     id_dokumen: item.id.toString(),
      //     dokumen: 'AC',
      //     filegambar: item,
      //   };

      //   combinedArray.push(josn);
      // }

      try {
        // Simpan data ke database
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const insertResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, combinedArray);
        console.log(insertResponse);
      } catch (error) {
        console.error('Error saat menyimpan data baru:', error);
      }
    } catch (error) {
      console.error('Error uploading file: ', error);
    }
  };

  const handleDelete = (id: number) => {
    setDataFiles((prev: any) => prev.filter((item: any) => item.id_dokumen !== id));
  };

  const handleDeleteAllFiles = () => {
    setDataFiles([]);
    uploaderRefFiles.current?.clearAll();
  };

  const downloadFile = (file: any, filename: string) => {
    const link = document.createElement('a');
    link.href = file;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    handleFileSelect,
    handleDelete,
    handleDeleteAllFiles,
    handleUpload,
    downloadFile,
    uploaderRefFiles,
    dataFiles,
    setDataFiles,
  };
};

export default useUploadFiles;
