import { loadFileGambarById } from '../model/api';
import axios from 'axios';

import React from 'react'

const fungsiFileUpload = () => {
  return (
    <div>fungsiFileUpload</div>
  )
}

export default fungsiFileUpload

export const handleFileUpload = async (e: any, tabIdx: number, setImages: Function, setSelectedFiles: Function, setNamaFiles: Function, formattedName: string, selectedFile: any, fileGambar: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const imageData = reader.result;
        setImages((prevImages: any) => {
            const newImages = [...prevImages];
            newImages[tabIdx] = [imageData]; // Wrap imageData in an array
            return newImages;
        });
    };
    reader.readAsDataURL(file);

    const newFiles = [...e.target.files];
    console.log('SELECTEDFILE = ' + selectedFile);
    if (selectedFile === 'update') {
        setSelectedFiles((prevFiles: any) => [...prevFiles, { file, tabIdx }]);

        const newNamaFiles = new Array(newFiles.length).fill(formattedName);
        setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, fileGambar.substring(2, fileGambar.length - 4)]);
    }
    if (selectedFile === 'baru') {
        setSelectedFiles((prevFiles: any) => [...prevFiles, { file, tabIdx }]);

        const newNamaFiles = new Array(newFiles.length).fill(formattedName);
        setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, formattedName]);
    }
};

export const handleClick = async (totActiveTab: any, kode_entitas: string, kodeSp: string, setSelectedFile: Function, setFileGambar: Function) => {
    if (kodeSp !== '') {
        const load = await loadFileGambarById(kode_entitas, kodeSp, totActiveTab);
        if (load.length > 0) {
            setSelectedFile('update');
            setFileGambar(load[0].filegambar);
        } else {
            setFileGambar('');
            setSelectedFile('baru');
        }
    } else {
        setFileGambar('');
        setSelectedFile('baru');
    }

    const input = document.getElementById(`imageInput${totActiveTab}`) as HTMLInputElement;
    if (input) {
        input.click();
    }
};

export const handleClickPreview = async (kodeSp: any, activeTab: any, kode_entitas: string, images: any[], setSelectedImages: Function, setShowPreviewModal: Function, selectedFile: any) => {
    setShowPreviewModal(true);
    console.log(kodeSp, activeTab);
    setSelectedImages('?');
    // const response = await axios.get(`${apiUrl}/erp/load_fileGambar_byId`, {
    //     params: {
    //         entitas: kode_entitas,
    //         param1: kodeSp,
    //         param2: activeTab + 1,
    //     },
    // });

    // const fileGambarById = response.data.data;
    if(kodeSp === ''){
        setSelectedImages(images[activeTab][0] instanceof ArrayBuffer ? URL.createObjectURL(new Blob([images[activeTab][0] as ArrayBuffer])) : (images[activeTab][0] as string));
    }else{
        const load = await loadFileGambarById(kode_entitas, kodeSp, activeTab);
        console.log('test' + load + 'selectedFile' + selectedFile);
    
        if (load.length > 0) {
            if (selectedFile === 'update') {
                setSelectedImages(images[activeTab][0] instanceof ArrayBuffer ? URL.createObjectURL(new Blob([images[activeTab][0] as ArrayBuffer])) : (images[activeTab][0] as string));
            } else {
                setSelectedImages(load[0].decodeBase64_string);
                console.log(load);
            }
        } else {
            setSelectedImages(images[activeTab][0] instanceof ArrayBuffer ? URL.createObjectURL(new Blob([images[activeTab][0] as ArrayBuffer])) : (images[activeTab][0] as string));
        }

    }
};

export const cancelPreview = (setShowPreviewModal: Function) => {
    setShowPreviewModal(false);
    // setSelectedImages([]);
};

export const handleTabClick = (index: any, setActive: Function) => {
    setActive(index);
};

export const handleTabClick1 = (index: any, setActive1: Function) => {
    setActive1(index);
};

export const handleTabClick2 = (index: any, setActive2: Function) => {
    setActive2(index);
};

export const handleBersihkanGambar = (
    activeTab: any,
    loadFilePendukung: any[], // contoh jika Anda memiliki tipe yang diperlukan
    setTipeSelectedBersihkangambar: Function,
    setSelectedBersihkangambar: Function,
    setImages: Function,
    setSelectedFiles: Function,
    setLoadFilePendukung: Function
) => {
    setTipeSelectedBersihkangambar('bersihkan');
    const foundItem = loadFilePendukung.find((item) => item.id_dokumen === activeTab + 1);

    if (foundItem) {
        setLoadFilePendukung((prevLoadFilePendukung: any) => {
            const removedIds = prevLoadFilePendukung.filter((item: any) => item.id_dokumen === activeTab + 1).map((item: any) => item.id_dokumen);
            const newLoadFilePendukung = prevLoadFilePendukung.filter((item: any) => item.id_dokumen !== activeTab + 1);

            // Mengubah array ID yang dihapus menjadi string dengan format '1,2'
            const removedIdsString = removedIds.join(',');

            // Memperbarui state selectedBersihkangambar dengan string ID yang dihapus
            setSelectedBersihkangambar((prevSelectedBersihkangambar: any) => {
                if (!prevSelectedBersihkangambar) {
                    return removedIdsString;
                } else {
                    // Memeriksa apakah ID sudah ada dalam string sebelumnya
                    const updatedString = removedIds.every((id: any) => prevSelectedBersihkangambar.indexOf(id.toString()) === -1) ? `,${removedIdsString}` : '';
                    return prevSelectedBersihkangambar + updatedString;
                }
            });

            return newLoadFilePendukung;
        });
    } else {
        // Item tidak ditemukan, lakukan penanganan kesalahan atau tindakan yang sesuai
        setImages((prevImages: any) => {
            const newImages = [...prevImages];
            newImages[activeTab] = [];
            return newImages;
        });
        setSelectedFiles([]);
    }
};

export const handleBersihkanGambarSemua = (
    activeTab: any,
    setTipeSelectedBersihkangambar: Function,
    setLoadFilePendukung: Function,
    setSelectedBersihkangambar: Function,
    setImages: Function,
    setSelectedFiles: Function
) => {
    console.log('Bersihkan Semua');
    setTipeSelectedBersihkangambar('bersihkan');
    setLoadFilePendukung((prevLoadFilePendukung: any) => {
        const removedIds = prevLoadFilePendukung.map((item: any) => item.id_dokumen); // Mengambil semua ID dokumen yang akan dihapus

        // Mengubah array ID yang dihapus menjadi string dengan format '1,2'
        const removedIdsString = removedIds.join(',');

        // Memperbarui state selectedBersihkangambar dengan string ID yang dihapus
        setSelectedBersihkangambar((prevSelectedBersihkangambar: any) => {
            if (!prevSelectedBersihkangambar) {
                return removedIdsString;
            } else {
                // Memeriksa apakah ID sudah ada dalam string sebelumnya
                const updatedString = removedIds.every((id: any) => prevSelectedBersihkangambar.indexOf(id.toString()) === -1) ? `,${removedIdsString}` : '';
                return prevSelectedBersihkangambar + updatedString;
            }
        });

        // Mengembalikan array kosong untuk menghapus semua data
        return [];
    });

    // Item tidak ditemukan, lakukan penanganan kesalahan atau tindakan yang sesuai
    setImages((prevImages: any) => {
        const newImages = [...prevImages];
        newImages[activeTab] = [];
        return newImages;
    });
    setSelectedFiles([]);
};

export const handleUpload = async (
    selectedFiles: any[],
    selectedFile: string,
    selectedNamaFiles: string[],
    fileGambar: string,
    kodeSp: any,
    kode_entitas: string,
    tipeBersihkangambar: string,
    selectedBersihkangambar: string,
    apiUrl: string,
    setTipeSelectedBersihkangambar: Function,
    setSelectedBersihkangambar: Function,
    setImages: Function,
    setSelectedFiles: Function,
    tipeBersihkanPdf: string,
    selectedBersihkanPdf: string,
    setTipeSelectedBersihkanPdf: Function,
    setSelectedBersihkanPdf: Function,
    tipeBersihkanPdf2: string,
    selectedBersihkanPdf2: string,
    setTipeSelectedBersihkanPdf2: Function,
    setSelectedBersihkanPdf2: Function
) => {
    const formData = new FormData();
    let entitas;
    selectedFiles.forEach((fileWithTabIdx: any, index: any) => {
        const file = fileWithTabIdx.file; // Ambil file dari objek fileWithTabIdx
        const tabIdx = fileWithTabIdx.tabIdx; // Ambil tabIdx dari objek fileWithTabIdx
        formData.append(`myimage`, file);
        const fileExtension = file.name.split('.').pop();
        // formData.append(`nama_file_image`, selectedFile !== 'update' ? `SP${selectedNamaFiles[index]}.${fileExtension}` : fileGambar);
        formData.append(`nama_file_image`, `SP${selectedNamaFiles[index]}.${fileExtension}`);
        formData.append(`kode_dokumen`, kodeSp);
        formData.append(`id_dokumen`, tabIdx + 1);
        formData.append(`dokumen`, 'SP');
    });

    if (kode_entitas === '99999') {
        entitas = '999';
    } else {
        entitas = kode_entitas;
    }
    formData.append('ets', entitas);
    console.log('Selected FIles = ' + selectedFiles.length);
    console.log('Selected Bersihkan Gambar = ' + selectedBersihkangambar);
    console.log('Selected Bersihkan pdf = ' + selectedBersihkanPdf);
    console.log('Selected Bersihkan pdf2 = ' + selectedBersihkanPdf2);
    console.log('Kode Sp = ' + kodeSp);
    console.log('Tipe Bersihkan Gambar = ' + tipeBersihkangambar);
    console.log('Tipe Bersihkan pdf = ' + tipeBersihkanPdf);
    console.log('Tipe Bersihkan pdf2 = ' + tipeBersihkanPdf2);

    // console.log('FormData Contents:');
    // for (let pair of formData.entries()) {
    //     console.log(pair[0], pair[1]);
    // }

    if (selectedFiles.length > 0) {
        console.log('masuk data kalo ada yang baru');
        await axios
            .post(`${apiUrl}/upload`, formData)
            .then((response) => {
                let jsonSimpan;
                console.log(response.data);
                if (Array.isArray(response.data.nama_file_image)) {
                    // Buat array JSON berdasarkan respon
                    jsonSimpan = response.data.nama_file_image.map((namaFile: any, index: any) => {
                        return {
                            entitas: kode_entitas,
                            kode_dokumen: kodeSp,
                            id_dokumen: response.data.id_dokumen[index],
                            dokumen: 'SP',
                            filegambar: namaFile,
                            fileoriginal: response.data.filesinfo[index] ? response.data.filesinfo[index].fileoriginal : null,
                        };
                    });
                    console.log(jsonSimpan);
                    console.log(JSON.stringify(jsonSimpan));
                } else {
                    jsonSimpan = {
                        entitas: kode_entitas,
                        kode_dokumen: kodeSp,
                        id_dokumen: response.data.id_dokumen,
                        dokumen: 'SP',
                        filegambar: response.data.nama_file_image,
                        fileoriginal: response.data.filesinfo,
                    };
                    console.log('satu');
                    console.log(jsonSimpan);
                }
                if (response.data.status === true) {
                    // if (selectedFile !== 'update') {
                    axios
                        .post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan)
                        .then((response) => {
                            console.log(response);
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    // }
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    if (tipeBersihkangambar === 'bersihkan') {
        console.log('masuk sini kalo ada data yang di bersihkan');
        const response = await axios.delete(`${apiUrl}/erp/hapus_file_pendukung?`, {
            params: {
                entitas: kode_entitas,
                param1: kodeSp,
                param2: selectedBersihkangambar,
            },
        });

        const hapusFilePendukung = response.data.data;
        console.log(hapusFilePendukung.serverStatus);
    }

    if (tipeBersihkanPdf === 'bersihkan') {
        console.log('masuk sini kalo ada data yang di bersihkan');
        const response = await axios.delete(`${apiUrl}/erp/hapus_file_pendukung?`, {
            params: {
                entitas: kode_entitas,
                param1: kodeSp,
                param2: selectedBersihkanPdf,
            },
        });

        const hapusFilePendukung = response.data.data;
        console.log(hapusFilePendukung.serverStatus);
    }

    if (tipeBersihkanPdf2 === 'bersihkan') {
        console.log('masuk sini kalo ada data yang di bersihkan');
        const response = await axios.delete(`${apiUrl}/erp/hapus_file_pendukung?`, {
            params: {
                entitas: kode_entitas,
                param1: kodeSp,
                param2: selectedBersihkanPdf2,
            },
        });

        const hapusFilePendukung = response.data.data;
        console.log(hapusFilePendukung.serverStatus);
    }
};

// Fungsi untuk menangani perubahan tab
export const handleTabChange = (index: any, setActiveTab: Function) => {
    setActiveTab(index);
    console.log('No = ' + index);
};

export const handleClickPdf = async (totActiveTab: any, kode_entitas: string, kodeSp: string, setSelectedFile: Function, setFileGambar: Function) => {
    const load = await loadFileGambarById(kode_entitas, kodeSp, totActiveTab);
    if (load.length > 0) {
        setSelectedFile('update');
        setFileGambar(load[0].filegambar);
    } else {
        setFileGambar('');
        setSelectedFile('baru');
    }

    const input = document.getElementById(`pdf${totActiveTab}`) as HTMLInputElement;
    if (input) {
        input.click();
    }
};

export const handleFileUploadpdf = async (
    e: any,
    tabIdx: number,
    setPdfUrl: Function,
    setSelectedFiles: Function,
    setNamaFiles: Function,
    formattedName: string,
    selectedFile: any,
    fileGambar: any,
    setFilePendukungPdf1: Function
) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('TEST PDF');

    const reader = new FileReader();
    reader.onload = () => {
        const pdfData = reader.result;
        setPdfUrl(pdfData); // Mengatur data PDF ke state setPdf
    };

    reader.readAsDataURL(file);

    const newFiles = [...e.target.files];
    console.log('SELECTEDFILE = ' + selectedFile);
    if (selectedFile === 'update') {
        setSelectedFiles((prevFiles: any) => [...prevFiles, { file, tabIdx }]);

        const newNamaFiles = new Array(newFiles.length).fill(formattedName);
        setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, fileGambar.substring(2, fileGambar.length - 4)]);
        setFilePendukungPdf1(`SP${fileGambar.substring(2, fileGambar.length - 4)}.pdf`);
    }
    if (selectedFile === 'baru') {
        setSelectedFiles((prevFiles: any) => [...prevFiles, { file, tabIdx }]);

        const newNamaFiles = new Array(newFiles.length).fill(formattedName);
        setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, formattedName]);
        setFilePendukungPdf1(`SP${formattedName}.pdf`);
    }
};

export const handleClickPdf2 = async (totActiveTab: any, kode_entitas: string, kodeSp: string, setSelectedFile: Function, setFileGambar: Function) => {
    const load = await loadFileGambarById(kode_entitas, kodeSp, totActiveTab);
    if (load.length > 0) {
        setSelectedFile('update');
        setFileGambar(load[0].filegambar);
    } else {
        setFileGambar('');
        setSelectedFile('baru');
    }

    const input = document.getElementById(`pdf${totActiveTab}`) as HTMLInputElement;
    if (input) {
        input.click();
    }
};

export const handleFileUploadpdf2 = async (
    e: any,
    tabIdx: number,
    setPdfUrl2: Function,
    setSelectedFiles: Function,
    setNamaFiles: Function,
    formattedName: string,
    selectedFile: any,
    fileGambar: any,
    setFilePendukungPdf2: Function
) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('TEST PDF');

    const reader = new FileReader();
    reader.onload = () => {
        const pdfData = reader.result;
        setPdfUrl2(pdfData); // Mengatur data PDF ke state setPdf
    };

    reader.readAsDataURL(file);

    const newFiles = [...e.target.files];
    console.log('SELECTEDFILE = ' + selectedFile);
    if (selectedFile === 'update') {
        setSelectedFiles((prevFiles: any) => [...prevFiles, { file, tabIdx }]);

        const newNamaFiles = new Array(newFiles.length).fill(formattedName);
        setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, fileGambar.substring(2, fileGambar.length - 4)]);
        setFilePendukungPdf2(`SP${fileGambar.substring(2, fileGambar.length - 4)}.pdf`);
    }
    if (selectedFile === 'baru') {
        setSelectedFiles((prevFiles: any) => [...prevFiles, { file, tabIdx }]);

        const newNamaFiles = new Array(newFiles.length).fill(formattedName);
        setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, formattedName]);
        setFilePendukungPdf2(`SP${formattedName}.pdf`);
    }
};

export const handleBersihkanPdf = (
    activeTab: any,
    loadFilePendukung: any[], // contoh jika Anda memiliki tipe yang diperlukan
    setTipeSelectedBersihkanPdf: Function,
    setSelectedBersihkanPdf: Function,
    setPdfUrl: Function,
    setSelectedFiles: Function,
    setLoadFilePendukung: Function,
    setFilePendukungPdf1: Function
) => {
    setTipeSelectedBersihkanPdf('bersihkan');
    setFilePendukungPdf1('');
    const foundItem = loadFilePendukung.find((item) => item.id_dokumen === activeTab + 1);

    if (foundItem) {
        setLoadFilePendukung((prevLoadFilePendukung: any) => {
            const removedIds = prevLoadFilePendukung.filter((item: any) => item.id_dokumen === activeTab + 1).map((item: any) => item.id_dokumen);
            const newLoadFilePendukung = prevLoadFilePendukung.filter((item: any) => item.id_dokumen !== activeTab + 1);

            // Mengubah array ID yang dihapus menjadi string dengan format '1,2'
            const removedIdsString = removedIds.join(',');

            // Memperbarui state selectedBersihkangambar dengan string ID yang dihapus
            setSelectedBersihkanPdf((prevSelectedBersihkanPdf: any) => {
                if (!prevSelectedBersihkanPdf) {
                    return removedIdsString;
                } else {
                    // Memeriksa apakah ID sudah ada dalam string sebelumnya
                    const updatedString = removedIds.every((id: any) => prevSelectedBersihkanPdf.indexOf(id.toString()) === -1) ? `,${removedIdsString}` : '';
                    return prevSelectedBersihkanPdf + updatedString;
                }
            });

            return newLoadFilePendukung;
        });
    } else {
        // Item tidak ditemukan, lakukan penanganan kesalahan atau tindakan yang sesuai
        setPdfUrl();
        setSelectedFiles([]);
    }
};

export const handleBersihkanPdf2 = (
    activeTab: any,
    loadFilePendukung: any[], // contoh jika Anda memiliki tipe yang diperlukan
    setTipeSelectedBersihkanPdf2: Function,
    setSelectedBersihkanPdf2: Function,
    setPdfUrl2: Function,
    setSelectedFiles: Function,
    setLoadFilePendukung: Function,
    setFilePendukungPdf2: Function
) => {
    setTipeSelectedBersihkanPdf2('bersihkan');
    setFilePendukungPdf2('');
    const foundItem = loadFilePendukung.find((item) => item.id_dokumen === activeTab + 1);

    if (foundItem) {
        setLoadFilePendukung((prevLoadFilePendukung: any) => {
            const removedIds = prevLoadFilePendukung.filter((item: any) => item.id_dokumen === activeTab + 1).map((item: any) => item.id_dokumen);
            const newLoadFilePendukung = prevLoadFilePendukung.filter((item: any) => item.id_dokumen !== activeTab + 1);

            // Mengubah array ID yang dihapus menjadi string dengan format '1,2'
            const removedIdsString = removedIds.join(',');

            // Memperbarui state selectedBersihkangambar dengan string ID yang dihapus
            setSelectedBersihkanPdf2((prevSelectedBersihkanPdf2: any) => {
                if (!prevSelectedBersihkanPdf2) {
                    return removedIdsString;
                } else {
                    // Memeriksa apakah ID sudah ada dalam string sebelumnya
                    const updatedString = removedIds.every((id: any) => prevSelectedBersihkanPdf2.indexOf(id.toString()) === -1) ? `,${removedIdsString}` : '';
                    return prevSelectedBersihkanPdf2 + updatedString;
                }
            });

            return newLoadFilePendukung;
        });
    } else {
        // Item tidak ditemukan, lakukan penanganan kesalahan atau tindakan yang sesuai
        setPdfUrl2('');
        setSelectedFiles([]);
    }
};

export const handlePreviewPdf = (setPreviewPdf: Function) => {
    setPreviewPdf(true);
};

export const handlePreviewPdf2 = (setPreviewPdf2: Function) => {
    setPreviewPdf2(true);
};

export const cancelPreviewPdf = (setPreviewPdf: Function) => {
    setPreviewPdf(false);
    // setSelectedImages([]);
};

export const cancelPreviewPdf2 = (setPreviewPdf2: Function) => {
    setPreviewPdf2(false);
    // setSelectedImages([]);
};
