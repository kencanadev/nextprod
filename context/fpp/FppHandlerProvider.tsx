import React, { createContext, useContext, useRef, useState } from 'react';
import moment from 'moment';
import JSZip from 'jszip';
import axios from 'axios';
import { FocusInEventArgs, TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { resPdf } from '@/pages/kcn/ERP/fa/fpp/utils/resource';

interface ImageData {
    entitas: string;
    kode_dokumen: string;
    id_dokumen: string;
    dokumen: string;
    filegambar: string;
    fileOriginal: any;
}

interface FppHandlerContextType {
    imageUrl: string;
    setImageUrl: (url: string) => void;
    openPreview: boolean;
    setOpenPreview: (open: boolean) => void;
    triggerData: boolean;
    setTriggerData: (trigger: boolean) => void;
    isDragging: any;
    setIsDragging: any;
    offset: any;
    setOffset: any;
    position: any;
    setPosition: any;
    rotationAngle: any;
    setRotationAngle: any;
    zoomScale: any;
    setZoomScale: any;
    handleFileSelect?: any;
    deleteImage?: any;
    loadImage?: any;
    handleRotateLeft?: any;
    handleRotateRight?: any;
    handleMouseDown?: any;
    handleMouseMove?: any;
    handleMouseUp?: any;
    HandleZoomIn?: any;
    HandleZoomOut?: any;
    showDialogUpload?: any;
    setShowDialogUpload?: any;
    imageFile: any;
    setImageFile: any;
    updateStateImg?: any;
    handleFileSelect2: any;
    uploaderRef: any;
    handleUpload2: any;
    setMasterData: any;
    handleWheel: any;
}

const FppHandlerContext = createContext<FppHandlerContextType | undefined>(undefined);

export const FppHandlerProvider = ({ children }: { children: React.ReactNode }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [openPreview, setOpenPreview] = useState(false);
    const [triggerData, setTriggerData] = useState(false);
    const [showDialogUpload, setShowDialogUpload] = useState(false);
    const [masterData, setMasterData] = useState<any>({});

    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [zoomScale, setZoomScale] = useState(0.5);

    const [refData, setRefData] = useState<any>(null);
    const [imageFile, setImageFile] = useState({
        nameImage: '',
        nameZip: '',
        previewImg: '',
    });

    const updateStateImg = (field: any, value: any) => {
        setImageFile((prevState: any) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const uploaderRef = useRef<UploaderComponent>(null);

    const [rotationAngle, setRotationAngle] = useState(0);

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, args: any, kode_entitas: string, token: string, userid: string) => {
        event.preventDefault();

        const response = await axios.get(`${apiUrl}/erp/master_detail_fpp`, {
            params: {
                entitas: kode_entitas,
                param1: args.kode_fpp,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { master, detail } = response.data.data;

        const file = event.target?.files?.[0];

        if (file) {
            const fileName = file.name.toLowerCase();
            const lastDotIndex = fileName.lastIndexOf('.');
            const fileExt = fileName.slice(lastDotIndex + 1).toLowerCase();

            // IMG_FPP250224FP0000000018.jpg
            const nameImage = `IMG_FPP${moment().format('YYMMDD')}${args.kode_fpp}.${fileExt}`;
            const nameImage2 = `IMG_FPP${moment().format('YYMMDD')}${args.kode_fpp}.zip`;

            const zip = new JSZip();
            zip.file(nameImage, file);

            try {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const formData = new FormData();
                formData.append('myimage', zipBlob);
                formData.append('ets', kode_entitas);
                formData.append('nama_file_image', nameImage2);

                const response = await axios.post(`${apiUrl}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 200) {
                    const combinedArray: ImageData[] = [
                        {
                            entitas: kode_entitas,
                            kode_dokumen: args.kode_fpp,
                            id_dokumen: '1',
                            dokumen: 'FP',
                            filegambar: nameImage,
                            fileOriginal: file.name,
                        },
                        {
                            entitas: kode_entitas,
                            kode_dokumen: args.kode_fpp,
                            id_dokumen: '999',
                            dokumen: 'FP',
                            filegambar: nameImage2,
                            fileOriginal: nameImage2,
                        },
                    ];

                    try {
                        const insertResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, combinedArray);
                        if (insertResponse.status === 201) {
                            const modifiedBody = {
                                ...master,
                                detail,
                                entitas: kode_entitas,
                                filegambar: nameImage,
                                tgl_scan: moment().format('YYYY-MM-DD HH:mm:ss'),
                                user_scan: userid,
                                tgl_approval: master.tgl_approval === null ? null : moment(master.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_bayar: master.tgl_bayar === null ? null : moment(master.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_fpp: master.tgl_fpp === null ? null : moment(master.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_harus_bayar: master.tgl_harus_bayar === null ? null : moment(master.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_cek_nota_asli: master.tgl_cek_nota_asli === null ? null : moment(master.tgl_cek_nota_asli).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_update: master.tgl_update === null ? null : moment(master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_cek_nota_coret: master.tgl_cek_nota_coret === null ? null : moment(master.tgl_cek_nota_coret).format('YYYY-MM-DD HH:mm:ss'),
                            };

                            const res = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            if (res.status === 200) {
                                setTriggerData(true);
                            }
                        }
                    } catch (error) {
                        console.error('Error inserting image data:', error);
                        return false;
                    }
                }
            } catch (error) {
                console.error('Error processing file:', error);
                return false;
            }
        }
        return false;
    };

    const handleFileSelect2 = async (args: any) => {
        setRefData(uploaderRef.current);
        const file = args.filesData[0].rawFile;

        const fileName = file.name.toLowerCase();
        const lastDotIndex = fileName.lastIndexOf('.');
        const fileExtension = fileName.slice(lastDotIndex + 1).toLowerCase();

        const nameImage = `IMG_FPP${moment().format('YYMMDD')}${masterData?.kode_fpp}.${fileExtension}`;
        const nameZip = `IMG_FPP${moment().format('YYMMDD')}${masterData?.kode_fpp}.zip`;

        updateStateImg('nameImage', nameImage);
        updateStateImg('nameZip', nameZip);
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (e: any) => {
            console.log('Image Preview:', e.target.result as string);
            const tipe = getMimeTypeFromBase64(e.target.result as string);
            updateStateImg('previewImg', e.target.result);
            // if (tipe === 'application/pdf') {
            //   updateStateImg('previewImg', resPdf);
            // } else {
            //   updateStateImg('previewImg', e.target.result);
            // }
        };
    };

    const base64ToFile = (base64String: string, fileName: string) => {
        try {
            // Hapus prefix data URL jika ada (misal: data:image/jpeg;base64,)
            const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;

            // Decode base64 ke binary
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Tentukan MIME type berdasarkan ekstensi file
            const extension = fileName.split('.').pop()?.toLowerCase();
            let mimeType = 'application/octet-stream';

            switch (extension) {
                case 'jpg':
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'gif':
                    mimeType = 'image/gif';
                    break;
                case 'pdf':
                    mimeType = 'application/pdf';
                    break;
            }

            return new File([bytes], fileName, { type: mimeType });
        } catch (error) {
            console.error('Error converting base64 to file:', error);
            throw new Error('Failed to convert base64 to file');
        }
    };

    const handleUpload2 = async (kode_entitas: string, token: string, userid: string) => {
        if (!refData) return;

        try {
            // Validasi data terlebih dahulu
            if (!imageFile.previewImg || !imageFile.nameImage) {
                throw new Error('Image data is missing');
            }

            console.log('Starting upload process...');

            const rawFile = base64ToFile(imageFile.previewImg, imageFile.nameImage);
            const nameImage = imageFile.nameImage;
            const nameZip = imageFile.nameZip;

            console.log({
                nameImage,
                nameZip,
                rawFile,
                fileSize: rawFile.size,
                fileType: rawFile.type,
            });

            // Validasi file
            if (!rawFile || rawFile.size === 0) {
                throw new Error('Invalid file generated from base64');
            }

            // Buat zip dengan konfigurasi yang lebih explicit
            const zip = new JSZip();
            zip.file(nameImage, rawFile, {
                binary: true,
                createFolders: false,
            });

            console.log('Generating zip file...');

            // Generate zip dengan konfigurasi yang lebih spesifik
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6,
                },
                platform: 'UNIX',
            });

            console.log('Zip generated successfully:', {
                zipSize: zipBlob.size,
                zipType: zipBlob.type,
            });

            // Validasi zip blob
            if (!zipBlob || zipBlob.size === 0) {
                throw new Error('Failed to generate zip file');
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('myimage', zipBlob, nameZip);
            formData.append('ets', kode_entitas);
            formData.append('nama_file_image', nameZip);

            console.log('Uploading file...');

            const uploadResponse = await axios.post(`${apiUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 detik timeout
            });

            if (uploadResponse.status === 200) {
                console.log('Upload successful, updating data...');

                // Lanjutkan dengan update data
                const dataResponse = await axios.get(`${apiUrl}/erp/master_detail_fpp`, {
                    params: {
                        entitas: kode_entitas,
                        param1: masterData?.kode_fpp,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const { master, detail } = dataResponse.data.data;

                const modifiedBody = {
                    ...master,
                    detail,
                    entitas: kode_entitas,
                    filegambar: nameImage,
                    tgl_scan: moment().format('YYYY-MM-DD HH:mm:ss'),
                    user_scan: userid.toUpperCase(),
                    tgl_approval: master.tgl_approval === null ? null : moment(master.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_bayar: master.tgl_bayar === null ? null : moment(master.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_fpp: master.tgl_fpp === null ? null : moment(master.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_harus_bayar: master.tgl_harus_bayar === null ? null : moment(master.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_cek_nota_asli: master.tgl_cek_nota_asli === null ? null : moment(master.tgl_cek_nota_asli).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: master.tgl_update === null ? null : moment(master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_cek_nota_coret: master.tgl_cek_nota_coret === null ? null : moment(master.tgl_cek_nota_coret).format('YYYY-MM-DD HH:mm:ss'),
                };

                const updateResponse = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (updateResponse.status === 200) {
                    setTriggerData(true);
                    setShowDialogUpload(false);
                    console.log('Process completed successfully');
                }
            }
        } catch (error: any) {
            console.error('Error in upload process:', error);

            // Log detail error untuk debugging
            if (error.response) {
                console.error('Server response:', error.response.data);
            }

            // Tampilkan pesan error ke user jika perlu
            // setErrorMessage(error.message || 'Upload failed');
        }
    };

    const deleteImage = async (args: any, kode_entitas: string, token: string, userid: string) => {
        const response = await axios.get(`${apiUrl}/erp/master_detail_fpp`, {
            params: {
                entitas: kode_entitas,
                param1: args.kode_fpp,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { master, detail } = response.data.data;

        const modifiedBody = {
            ...master,
            entitas: kode_entitas,
            filegambar: null,
            tgl_scan: null,
            user_scan: null,
            detail,
            tgl_approval: master.tgl_approval === null ? null : moment(master.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
            tgl_bayar: master.tgl_bayar === null ? null : moment(master.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
            tgl_fpp: master.tgl_fpp === null ? null : moment(master.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
            tgl_harus_bayar: master.tgl_harus_bayar === null ? null : moment(master.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
            tgl_cek_nota_asli: master.tgl_cek_nota_asli === null ? null : moment(master.tgl_cek_nota_asli).format('YYYY-MM-DD HH:mm:ss'),
            tgl_update: master.tgl_update === null ? null : moment(master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
            tgl_cek_nota_coret: master.tgl_cek_nota_coret === null ? null : moment(master.tgl_cek_nota_coret).format('YYYY-MM-DD HH:mm:ss'),
        };

        try {
            const response = await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
                params: {
                    entitas: kode_entitas,
                    param1: args.kode_fpp,
                    param2: '1,999',
                },
            });

            if (response.status === 200) {
                const res = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 200) {
                    setTriggerData(true);
                }
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    };

    const loadImage = async (args: any, kode_entitas: string) => {
        setZoomScale(0.5); // Reset zoom scale
        setPosition({ x: 0, y: 0 }); // Reset position
        setImageUrl('');

        const filename = args.filegambar;
        const newFilename = filename.replace(/\.(jpg|jpeg|png|pdf)$/i, '.zip');

        try {
            const responsePreviewImg = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                params: {
                    entitas: kode_entitas,
                    nama_zip: newFilename,
                },
            });

            const url = responsePreviewImg.data.images[0].imageUrl;
            const tipe = getMimeTypeFromBase64(url);
            if (tipe === 'application/pdf') {
                const byteCharacters = atob(url.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Create a URL for the blob and open it in a new tab
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');

                // Clean up the URL object after the tab is opened
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 100);
            } else {
                setImageUrl(url);
                setOpenPreview(true);
            }
        } catch (error) {
            console.error('Error loading image:', error);
        }
    };

    function getMimeTypeFromBase64(base64: string): string {
        const mimeMatch = base64.match(/^data:(.*?);base64,/);

        if (mimeMatch) {
            return mimeMatch[1];
        }

        return 'application/octet-stream';
    }

    const handleMouseDown = (event: any) => {
        setIsDragging(true);
        setOffset({
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        });
    };

    const handleMouseMove = (event: any) => {
        if (isDragging) {
            setPosition({
                x: event.clientX - offset.x,
                y: event.clientY - offset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const HandleZoomIn = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    };

    const HandleZoomOut = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    };

    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);

    const handleWheel = (event: any) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            // Scroll up
            setZoomScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
        } else {
            // Scroll down
            setZoomScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
        }
    };

    return (
        <FppHandlerContext.Provider
            value={{
                imageUrl,
                setImageUrl,
                openPreview,
                setOpenPreview,
                triggerData,
                setTriggerData,
                isDragging,
                setIsDragging,
                offset,
                setOffset,
                position,
                setPosition,
                rotationAngle,
                setRotationAngle,
                setZoomScale,
                zoomScale,
                handleRotateLeft,
                handleRotateRight,
                loadImage,
                deleteImage,
                handleFileSelect,
                handleMouseUp,
                handleMouseDown,
                handleMouseMove,
                HandleZoomIn,
                HandleZoomOut,
                showDialogUpload,
                setShowDialogUpload,
                imageFile,
                setImageFile,
                updateStateImg,
                handleFileSelect2,
                uploaderRef,
                handleUpload2,
                setMasterData,
                handleWheel,
            }}
        >
            {children}
        </FppHandlerContext.Provider>
    );
};

export const useFppHandlerContext = () => {
    const context = useContext(FppHandlerContext);
    if (!context) {
        throw new Error('useImageHandlerContext must be used within an ImageHandlerProvider');
    }
    return context;
};
