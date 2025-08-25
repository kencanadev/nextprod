import { useRef, useState } from 'react';
import { UploaderComponent } from '@syncfusion/ej2-react-inputs';
import moment from 'moment';
import axios from 'axios';
import JSZip from 'jszip';
import swal from 'sweetalert2';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
const useUploadFiles = (props: any) => {
    const { kode_opname, kode_entitas, activeSubTab } = props;

    //   const [dataKsg, setDataKsg] = useState([]);
    const [dataKsg, setDataKsg] = useState<any[]>([]);
    const [dataFb, setDataFb] = useState<any[]>([]);
    const [dataVb, setDataVb] = useState<any[]>([]);
    const [dataForm, setDataForm] = useState<any[]>([]);
    const [dataKss, setDataKss] = useState<any[]>([]);

    let uploaderRefKsg = useRef<UploaderComponent>(null);
    let uploaderRefFb = useRef<UploaderComponent>(null);
    let uploaderRefVb = useRef<UploaderComponent>(null);
    let uploaderRefForm = useRef<UploaderComponent>(null);
    let uploaderRefKss = useRef<UploaderComponent>(null);

    const handleFileSelect = (args: any, jenis: string) => {
        const file = args.filesData[0].rawFile;
        const fileName = file.name.toLowerCase();
        const lastDotIndex = fileName.lastIndexOf('.');
        const fileExtension = fileName.substring(lastDotIndex + 1).toLowerCase();
        const modifiedName = `OP_${kode_entitas}_${moment().format('YYMMDDHHmmssSSS')}.${fileExtension}`;

        if (jenis === 'kartu-stok-gudang') {
            const fileData = {
                id: dataKsg.length + 1,
                name: fileName,
                modifiedName,
                preview: URL.createObjectURL(file),
                rawFile: new Blob([file], { type: file.type }),
                type: fileExtension,
                dokumen: 'OP1',
            };
            setDataKsg((prev: any) => [...prev, fileData]);
        } else if (jenis === 'foto-barang') {
            const fileData = {
                id: dataFb.length + 1,
                name: fileName,
                modifiedName,
                preview: URL.createObjectURL(file),
                rawFile: new Blob([file], { type: file.type }),
                type: fileExtension,
                dokumen: 'OP2',
            };
            setDataFb((prev: any) => [...prev, fileData]);
        } else if (jenis === 'vidio-barang') {
            const fileData = {
                id: dataVb.length + 1,
                name: fileName,
                modifiedName,
                preview: URL.createObjectURL(file),
                rawFile: new Blob([file], { type: file.type }),
                type: fileExtension,
                dokumen: 'OP3',
            };
            setDataVb((prev: any) => [...prev, fileData]);
        } else if (jenis === 'form-ttb') {
            const fileData = {
                id: dataForm.length + 1,
                name: fileName,
                modifiedName,
                preview: URL.createObjectURL(file),
                rawFile: new Blob([file], { type: file.type }),
                type: fileExtension,
                dokumen: 'OP4',
            };
            setDataForm((prev: any) => [...prev, fileData]);
        } else if (jenis === 'kartu-stok-sistem') {
            const fileData = {
                id: dataKss.length + 1,
                name: fileName,
                modifiedName,
                preview: URL.createObjectURL(file),
                rawFile: new Blob([file], { type: file.type }),
                type: fileExtension,
                dokumen: 'OP5',
            };
            setDataKss((prev: any) => [...prev, fileData]);
        }
    };

    const handleUpload = async () => {
        const filesArray = dataKsg.concat(dataFb, dataVb, dataForm, dataKss);
        // for (const item of filesArray) {
        //   const filename = item.name;
        //   const file = item.rawFile;
        //   zip.file(filename, file);
        // }

        try {
            for (let i = 0; i < filesArray.length; i++) {
                const id_dokumen = i + 101;

                await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kode_opname,
                        param2: id_dokumen, // id di tbm_images
                    },
                });
            }

            for (let i = 0; i < filesArray.length; i++) {
                const item = filesArray[i];

                const zip = new JSZip();

                // const filename = item.name;
                const filename = filesArray[i].modifiedName;
                const file = item.rawFile;
                zip.file(filename, file, { binary: true });
                // zip.file(filename, file);

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const formData = new FormData();
                formData.append('myimage', zipBlob);
                formData.append('ets', kode_entitas);
                formData.append('nama_file_image', `${filesArray[i].modifiedName.split('.')[0]}.zip`);

                // console.log('FormData Contents:');
                // for (let pair of formData.entries()) {
                //     console.log(pair[0], pair[1]);
                // }

                const response = await axios.post(`${apiUrl}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (response.status !== 200) {
                    console.error(`Upload gagal untuk file: ${item.name}`);
                }
            }
            // const zipBlob = await zip.generateAsync({ type: 'blob' });
            // const nama_file = `OP_${kode_entitas}_${moment().format('YYMMDDHHss')}`;
            // const formData = new FormData();
            // formData.append('myimage', zipBlob);
            // formData.append('ets', kode_entitas);
            // formData.append('nama_file_image', `${nama_file}.zip`);

            const createJson = (id: any, nameImage: any, originalName: any, dokumen: any) => ({
                entitas: kode_entitas,
                kode_dokumen: kode_opname,
                id_dokumen: id,
                dokumen,
                filegambar: nameImage,
                fileoriginal: originalName,
            });

            const combinedArray = filesArray.map((item, index) => createJson(index + 101, item.modifiedName, item.name, item.dokumen)).filter(Boolean);

            console.log(combinedArray);
            try {
                const insertResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, combinedArray);
            } catch (error) {
                console.error('error saat menyimpan data baru: ', error);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleDelete = (id: number, jenis: string) => {
        if (jenis === 'kartu-stok-gudang') {
            setDataKsg((prev) => prev.filter((item) => item.id !== id));
        } else if (jenis === 'foto-barang') {
            setDataFb((prev) => prev.filter((item) => item.id !== id));
        } else if (jenis === 'vidio-barang') {
            setDataVb((prev) => prev.filter((item) => item.id !== id));
        } else if (jenis === 'form-ttb') {
            setDataForm((prev) => prev.filter((item) => item.id !== id));
        } else if (jenis === 'kartu-stok-sistem') {
            setDataKss((prev) => prev.filter((item) => item.id !== id));
        }
    };

    const handleDeleteAllFiles = (jenis: string) => {
        if (jenis === 'kartu-stok-gudang') {
            setDataKsg([]);
            uploaderRefKsg.current?.clearAll();
        } else if (jenis === 'foto-barang') {
            setDataFb([]);
            uploaderRefFb.current?.clearAll();
        } else if (jenis === 'vidio-barang') {
            setDataVb([]);
            uploaderRefVb.current?.clearAll();
        } else if (jenis === 'form-ttb') {
            setDataForm([]);
            uploaderRefForm.current?.clearAll();
        } else if (jenis === 'kartu-stok-sistem') {
            setDataKss([]);
            uploaderRefKss.current?.clearAll();
        }
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
        uploaderRefKsg,
        uploaderRefFb,
        uploaderRefVb,
        uploaderRefForm,
        uploaderRefKss,
        dataKsg,
        setDataKsg,
        dataFb,
        setDataFb,
        dataVb,
        setDataVb,
        dataForm,
        setDataForm,
        dataKss,
        setDataKss,
    };
};

export default useUploadFiles;
