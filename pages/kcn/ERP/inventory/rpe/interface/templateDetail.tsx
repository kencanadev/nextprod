import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DataManager } from '@syncfusion/ej2-data';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
import * as ReactDom from 'react-dom';
import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// Pakai fungsi dari routines ============================
import { DiskonByCalc, FillFromSQL, fetchPreferensi, frmNumber, generateNU, generateNUDivisi } from '@/utils/routines';
//========================================================
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes, faUpload, faEraser } from '@fortawesome/free-solid-svg-icons';
import { GetListHargaEkspedisi } from '../model/apiRpe';
import { swalToast } from './template';
import styles from '../rpelist.module.css';
import ExcelJS from 'exceljs';
import Draggable from 'react-draggable';
import { Document, Page as PagePDF, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

enableRipple(true);

interface templateDetailRpeProps {
    userid: any;
    kode_entitas: any;
    entitas: any;
    token: any;
    onRenderDayCell: any;
    stateDataHeader: any;
    dataBarang: any;
    tabPhuList: any;
    setStateDataHeader: Function;
    setStateDataArray: Function;
    stateDataArray: any;
    setDataBarang: Function;
    setStateDataFooter: Function;
    stateDataFooter: any;
    masterDataState: any;
    setFiles: any;
    setPreviewFile: any;
    handleFileUpload: any;
    files: any;
    previewFile: any;
    setFilesUpload: Function;
    filesUpload: any;
}

let gridKeyDataBarang = ``;
const TemplateDetailRpe: React.FC<templateDetailRpeProps> = ({
    userid,
    kode_entitas,
    entitas,
    token,
    onRenderDayCell,
    stateDataHeader,
    tabPhuList,
    dataBarang,
    setStateDataHeader,
    setStateDataArray,
    stateDataArray,
    setDataBarang,
    setStateDataFooter,
    stateDataFooter,
    masterDataState,
    setFiles,
    setPreviewFile,
    handleFileUpload,
    files,
    previewFile,
    setFilesUpload,
    filesUpload,
}: templateDetailRpeProps) => {
    gridKeyDataBarang = `${moment().format('HHmmss')}-${JSON.stringify(dataBarang?.nodes)}`;
    let currentDaftarBarang: any[] = [];
    let currentDaftarJurnal: any[] = [];
    const gridRpeListRef = useRef<GridComponent>(null);
    const gridJurnalRpeListRef = useRef<GridComponent>(null);
    const [numberId, setNumberId] = useState(-1);
    const [documentData, setDocumentData] = useState<any>(null);
    // const [previewFile, setPreviewFile] = useState<File | null>(null);

    const [modalPosition1] = useState({
        top: '15%',
        left: '35%',
        maxWidth: '50%', // Atur lebar maksimal modal di sini
        overflow: 'auto',
    });

    const [numPages, setNumPages] = useState<number | null>(null); // Tentukan tipe data numPages
    const [PreviewPdf, setPreviewPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        // Tentukan tipe data numPages
        setNumPages(numPages);
    };

    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };
    const qtyParams = { params: { format: 'N2' } };

    const getHargaEkspedisi = async (args: any) => {
        console.log('sdasdsadasdada = ', args);
        const paramObject = {
            kode_entitas: kode_entitas,
            jenis_kirim: args.jenis_kirim,
            nama_ekspedisi: stateDataHeader.namaEkspedisi,
            jenis_mobil: args.jenis_mobil,
            token: token,
        };
        const respHargaEkspedisi: any[] = await GetListHargaEkspedisi(paramObject);
        const parsedHargaEkspedisi = respHargaEkspedisi?.map((item) => ({
            ...item,
            harga: parseFloat(item.harga),
            harga_tambahan: parseFloat(item.harga_tambahan),
        }));
        await setStateDataArray((prevState: any) => ({
            ...prevState,
            dataHargaEkspedisi: parsedHargaEkspedisi,
        }));
        await setStateDataHeader((prevState: any) => ({
            ...prevState,
            dialogDaftarHargaEkspedisiVisible: true,
            indexId: args.id,
        }));
    };

    // merubah koma yang jadi 1 aja
    const editTemplateTambahanJarak = (args: any) => {
        console.log('templateTambahanJarak = ', args);
        return (
            <div>
                <input
                    style={{ textAlign: 'right', backgroundColor: 'transparent', border: 'none', marginLeft: '-21px' }}
                    id="tambahan_jarak"
                    name="tambahan_jarak"
                    value={args.tambahan_jarak}
                    disabled={true}
                />
            </div>
        );
    };

    //================ Editing template untuk kolom grid detail barang ==================
    const EditTemplateHargaEks = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="harga_eks_add" name="harga_eks_add" className="harga_eks_add" value={frmNumberSyncfusion(args.harga_eks)} disabled={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buHargaEks"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    getHargaEkspedisi(args);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const frmNumberSyncfusion = (value: any) => {
        // Menggunakan fungsi Number() untuk mengonversi string menjadi angka
        let numericValue = Number(value);

        // Memeriksa apakah nilai numerik adalah NaN
        if (isNaN(numericValue)) {
            numericValue = 0; // Mengubah NaN menjadi 0
        }

        // Menggunakan fungsi Number.toLocaleString() untuk memformat angka
        const formattedValue = numericValue.toLocaleString('de-DE', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return formattedValue;
    };

    //================ Template untuk kolom grid list data ==================
    const templatePilih = (args: any) => {
        const checkboxStyle = {
            accentColor: '#4361EE',
        };
        return <input onClick={(event: any) => handleTemplatePilih(args, event.target.checked)} type="checkbox" checked={args.idChecked > 0 ? true : false} style={checkboxStyle} readOnly />;
    };

    const editTemplatePilih = (args: any) => {
        const checkboxStyle = {
            accentColor: '#4361EE',
        };
        return <input onClick={(event: any) => handleTemplatePilih(args, event.target.checked)} type="checkbox" checked={args.idChecked > 0 ? true : false} style={checkboxStyle} readOnly />;
    };

    const handleTemplatePilih = async (args: any, event: any) => {
        const isCheck = event;
        // const id = args.id;
        const id = args.id;
        console.log('sdsadadsaadsa = ', args, dataBarang?.nodes);
        const newNodes = await dataBarang?.nodes?.map((node: any) => {
            if (node.id === id) {
                if (isCheck === true) {
                    return {
                        ...node,
                        idChecked: node.netto_rp,
                        waktuCeklis: 1,
                    };
                } else {
                    return {
                        ...node,
                        idChecked: 0,
                        waktuCeklis: 0,
                    };
                }
            } else {
                return node;
            }
        });

        let totNettoRp: any = 0;
        let beratTotal: any = 0;
        let beratKlaim: any = 0;
        let tambahanJarak: any = 0;
        let totalKlaimEkspedisi: any = 0;

        totNettoRp = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                // return acc + parseFloat(node.netto_rp);
                return acc + parseFloat(node.total_rp);
            }
            return acc;
        }, 0);
        beratTotal = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.total_berat);
            }
            return acc;
        }, 0);
        beratKlaim = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.total_berat_ekspedisi);
            }
            return acc;
        }, 0);

        tambahanJarak = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.tambahan_jarak);
            }
            return acc;
        }, 0);

        totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.total_klaim_ekspedisi);
            }
            return acc;
        }, 0);

        console.log('newNodes = ', newNodes);
        const isNoZeroPayment = newNodes.every((node: any) => node.idChecked !== 0);
        console.log('isNoZeroPayment = ', isNoZeroPayment);
        if (isNoZeroPayment) {
            await setStateDataHeader((prevState: any) => ({
                ...prevState,
                disabledResetPembayaran: false,
                disabledBayarAllInvoice: false,
                disabledBatalInvoice: false,
                disabledBatalSemuaPembayaran: true,
            }));
        } else {
            await setStateDataHeader((prevState: any) => ({
                ...prevState,
                disabledResetPembayaran: true,
                disabledBayarAllInvoice: false,
                disabledBatalInvoice: false,
                disabledBatalSemuaPembayaran: false,
            }));
        }

        console.log('tambahanJarak = ', parseFloat(stateDataFooter?.biayaLainLain));
        const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
        const total_bayar = stateDataHeader.nominalInvoice > 0 ? (total_tagihan > stateDataHeader.nominalInvoice ? stateDataHeader.nominalInvoice : total_tagihan) : 0;
        const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader.nilaiPph23) / 100 : 0;
        const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

        await setStateDataFooter((prevState: any) => ({
            ...prevState,
            subTotal: totNettoRp,
            totalTagihan: total_tagihan,
            nominalInvoice: stateDataHeader.nominalInvoice,
            totalBayar: total_tagihan > stateDataHeader.nominalInvoice ? stateDataHeader.nominalInvoice : total_tagihan,
            totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
            potonganEkspedisiLain: potongan_ekspedisi,
            nilaiPph23: nilai_pph23,
            totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
            beratTotal: beratTotal,
            beratKlaim: beratKlaim,
            tambahanJarak: tambahanJarak,
        }));
        await setDataBarang({ nodes: newNodes });
    };

    const getFormattedName = (index: number) => {
        return moment().add(index, 'second').format('YYMMDDHHmmss');
    };

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const handleUpload = async (kode_rpe: any) => {
        const formData = new FormData();
        let entitas;

        // Menggunakan state files sebagai selectedFiles
        files.forEach((file: File, index: number) => {
            const tabIdx: any = 100 + index; // Anda bisa menyesuaikan ini dengan nilai tabIdx yang sesuai
            const formattedName = getFormattedName(index);
            formData.append('myimage', file);

            const fileExtension = file.name.split('.').pop(); // Ambil ekstensi file
            formData.append('nama_file_image', `RPE${formattedName}.${fileExtension}`);
            formData.append('kode_dokumen', kode_rpe); // Pastikan kodeSp sudah diatur sebelumnya
            formData.append('id_dokumen', tabIdx);
            formData.append('dokumen', 'RPE-');
        });

        if (kode_entitas === '99999') {
            entitas = '999';
        } else {
            entitas = kode_entitas;
        }
        formData.append('ets', entitas);

        // Cetak log untuk debugging
        // console.log('Selected Files = ' + files.length);

        // console.log('FormData Contents:');
        // for (let pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }

        if (files.length > 0) {
            console.log('masuk data kalo ada yang baru');
            await axios
                .post(`${apiUrl}/upload`, formData)
                .then((response) => {
                    let jsonSimpan;
                    console.log(response.data);
                    if (Array.isArray(response.data.nama_file_image)) {
                        // Buat array JSON berdasarkan respon
                        jsonSimpan = response.data.nama_file_image?.map((namaFile: any, index: any) => {
                            return {
                                entitas: kode_entitas,
                                kode_dokumen: kode_rpe,
                                id_dokumen: response.data.id_dokumen[index],
                                dokumen: 'RPE-',
                                filegambar: namaFile,
                                fileoriginal: response.data.filesinfo[index] ? response.data.filesinfo[index].fileoriginal : null,
                            };
                        });
                        console.log(jsonSimpan);
                        console.log(JSON.stringify(jsonSimpan));
                    } else {
                        jsonSimpan = {
                            entitas: kode_entitas,
                            kode_dokumen: kode_rpe,
                            id_dokumen: response.data.id_dokumen,
                            dokumen: 'RPE-',
                            filegambar: response.data.nama_file_image,
                            fileoriginal: response.data.filesinfo,
                        };
                        console.log('satu');
                        console.log(jsonSimpan);
                    }
                    // if (response.data.status === true) {
                    //     // if (selectedFile !== 'update') {
                    //     axios
                    //         .post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan)
                    //         .then((response) => {
                    //             console.log(response);
                    //         })
                    //         .catch((error) => {
                    //             console.error('Error:', error);
                    //         });
                    //     // }
                    // }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    };

    // const clearFile = (fileIndex: any) => {
    //     setFiles((prevFiles) => prevFiles.filter((_, index) => index !== fileIndex));
    //     if (previewFile && previewFile.name === files[fileIndex].name) {
    //         setPreviewFile(null);
    //     }

    // };

    const handleHapusFile = (index: any) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
        //  setIndexHapus([...indexHapus, 101 + index]);
    };

    const clearAllFiles = () => {
        setFiles([]);
        setPreviewFile(null);
    };

    // const handleFileClick = (file: File, imageLocal: any, imageServer: any) => {
    //     setPreviewFile(file);
    //     if (!file) return null;

    //     const fileType = file.type;
    //     const fileTypeServer = imageServer;

    //     if (fileType === undefined) {
    //         setStateDataHeader((prevState: any) => ({
    //             ...prevState,
    //             isOpenPreview: true,
    //             imageDataUrl: imageServer,
    //             indexPreview: file.name,
    //         }));
    //     } else {
    //         setStateDataHeader((prevState: any) => ({
    //             ...prevState,
    //             isOpenPreview: true,
    //             imageDataUrl: URL.createObjectURL(file),
    //             indexPreview: file.name,
    //         }));
    //     }
    //     //const fileUrl = URL.createObjectURL(file);
    //     // console.log(fileType, fileUrl);
    //     // if (fileType.startsWith('image/') || fileTypeServer.startsWith('data:image/') ) {
    //     //     setStateDataHeader((prevState: any) => ({
    //     //         ...prevState,
    //     //         isOpenPreview: true,
    //     //         imageDataUrl: fileUrl,
    //     //         indexPreview: file.name,
    //     //     }));
    //     // } else {
    //     //     const link = document.createElement('a');
    //     //     link.href = fileUrl;
    //     //     link.download = file.name;
    //     //     link.click();

    //     //     // Cleanup
    //     //     URL.revokeObjectURL(fileUrl);
    //     // }
    // };

    const templateTambahanJarak = (args: any) => {
        return (
            <div>
                <input
                    style={{ textAlign: 'right', backgroundColor: 'transparent', border: 'none', marginLeft: '-30px' }}
                    id="tambahan_jarak"
                    name="tambahan_jarak"
                    value={frmNumberSyncfusion(args.tambahan_jarak)}
                    disabled={true}
                />
            </div>
        );
    };

    const handleDeleteDetail = async (tipe: any, args: any) => {
        if (tipe === 'hapus') {
            console.log('args = ', args?.getSelectedRecords());
            const dataArgs = args?.getSelectedRecords();
            if (dataArgs.length > 0) {
                console.log('dataArgs[0].id = ', dataArgs[0].id);
                const newNodes = await dataBarang?.nodes?.map((node: any) => {
                    if (node.id === dataArgs[0].id) {
                        return {
                            ...node,
                            idChecked: 0,
                            waktuCeklis: 0,
                        };
                    } else {
                        return node;
                    }
                });

                let totNettoRp: any = 0;
                let beratTotal: any = 0;
                let beratKlaim: any = 0;
                let tambahanJarak: any = 0;
                let totalKlaimEkspedisi: any = 0;

                totNettoRp = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.netto_rp);
                    }
                    return acc;
                }, 0);
                beratTotal = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.total_berat);
                    }
                    return acc;
                }, 0);
                beratKlaim = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.total_berat_ekspedisi);
                    }
                    return acc;
                }, 0);

                tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.tambahan_jarak);
                    }
                    return acc;
                }, 0);

                totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.total_klaim_ekspedisi);
                    }
                    return acc;
                }, 0);

                const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
                const total_bayar = stateDataHeader.nominalInvoice > 0 ? (total_tagihan > stateDataHeader.nominalInvoice ? stateDataHeader.nominalInvoice : total_tagihan) : 0;
                const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader.nilaiPph23) / 100 : 0;
                const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

                await setStateDataFooter((prevState: any) => ({
                    ...prevState,
                    subTotal: totNettoRp,
                    totalTagihan: total_tagihan,
                    nominalInvoice: stateDataHeader.nominalInvoice,
                    totalBayar: total_tagihan > stateDataHeader.nominalInvoice ? stateDataHeader.nominalInvoice : total_tagihan,
                    totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                    potonganEkspedisiLain: potongan_ekspedisi,
                    nilaiPph23: nilai_pph23,
                    totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                    beratTotal: beratTotal,
                    beratKlaim: beratKlaim,
                }));
                await setDataBarang({ nodes: newNodes });
            } else {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px; color:white;">Silahkan pilih data terlebih dahulu</p>',
                    width: '100%',
                    target: '#dialogFormRpe',
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                return;
            }
        } else {
            const newNodes = await dataBarang?.nodes?.map((node: any) => {
                return {
                    ...node,
                    idChecked: 0,
                    waktuCeklis: 0,
                };
            });

            let totNettoRp: any = 0;
            let beratTotal: any = 0;
            let beratKlaim: any = 0;
            let tambahanJarak: any = 0;
            let totalKlaimEkspedisi: any = 0;

            totNettoRp = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.netto_rp);
                }
                return acc;
            }, 0);
            beratTotal = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat);
                }
                return acc;
            }, 0);

            beratKlaim = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat_ekspedisi);
                }
                return acc;
            }, 0);

            tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.tambahan_jarak);
                }
                return acc;
            }, 0);

            totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_klaim_ekspedisi);
                }
                return acc;
            }, 0);

            const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
            const total_bayar = stateDataHeader.nominalInvoice > 0 ? (total_tagihan > stateDataHeader.nominalInvoice ? stateDataHeader.nominalInvoice : total_tagihan) : 0;
            const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader.nilaiPph23) / 100 : 0;
            const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

            await setStateDataFooter((prevState: any) => ({
                ...prevState,
                subTotal: totNettoRp,
                totalTagihan: total_tagihan,
                nominalInvoice: stateDataHeader.nominalInvoice,
                totalBayar: total_tagihan > stateDataHeader.nominalInvoice ? stateDataHeader.nominalInvoice : total_tagihan,
                totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                potonganEkspedisiLain: potongan_ekspedisi,
                nilaiPph23: nilai_pph23,
                totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                beratTotal: beratTotal,
                beratKlaim: beratKlaim,
            }));
            await setDataBarang({ nodes: newNodes });
        }
    };

    const pilihFilePendukung = (file: any, index: any) => {
        setNumberId(index);
        setDocumentData(file);
    };

    const clearFile = (fileIndex: any) => {
        setFiles((prevFiles: any) => prevFiles.filter((_: any, index: any) => index !== fileIndex));
        setFilesUpload((prevFiles: any) => prevFiles.filter((_: any, index: any) => index !== fileIndex));
        if (previewFile && previewFile.name === files[fileIndex].name) {
            setPreviewFile(null);
        }
    };

    const handleFileClick = async (file: File, imageLocal: any) => {
        console.log();

        setPreviewFile(file);
        if (!file) return null;

        const fileType = file.type;
        // const fileTypeServer = imageServer;
        let extension, namaFile;

        if (fileType === undefined) {
            const fileName = imageLocal.filegambar;
            namaFile = imageLocal.filegambar;
            extension = fileName.split('.').pop(); // Hasil: "pdf"

            console.log('kode_entitas = ', kode_entitas, namaFile);

            if (extension === 'pdf') {
                const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${kode_entitas}&param1=${namaFile}`);
                console.log('responsePreviewPdf = ', responsePreviewPdf);

                if (!responsePreviewPdf.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                // Assuming the response contains the URL directly
                const pdfBlob = await responsePreviewPdf.blob();
                const pdfObjectURL = URL.createObjectURL(pdfBlob);
                console.log('pdfObjectURL = ', pdfObjectURL);

                setPdfUrl(pdfObjectURL);
                setPreviewPdf(true);
            } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                setStateDataHeader((prevState: any) => ({
                    ...prevState,
                    isOpenPreview: true,
                    imageDataUrl: imageLocal.decodeBase64_string,
                    indexPreview: file.name,
                }));
            } else {
                downloadBase64Image(imageLocal.decodeBase64_string, file.name);
            }
        } else {
            const fileName = file.name;
            namaFile = file.name;
            extension = fileName.split('.').pop(); // Hasil: "pdf"

            if (extension === 'pdf') {
                const pdfObjectURL = URL.createObjectURL(file);
                setPdfUrl(pdfObjectURL);
                setPreviewPdf(true);
            } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                setStateDataHeader((prevState: any) => ({
                    ...prevState,
                    isOpenPreview: true,
                    imageDataUrl: URL.createObjectURL(file),
                    indexPreview: file.name,
                }));
            } else {
                downloadBase64Image1(imageLocal.decodeBase64_string, file.name, file);
            }
        }
    };

    const downloadBase64Image = (base64Image: string, filename: string) => {
        console.log('filename = ', filename);

        const byteString = atob(base64Image.split(',')[1]); // Decode base64
        const mimeString = base64Image.split(',')[0].split(':')[1].split(';')[0]; // Extract mime type

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });

        // Create an object URL for the blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a link element, set its href to the blob URL and download attribute
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;

        // Append link to the body, click it and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release the object URL
        URL.revokeObjectURL(blobUrl);
    };

    const downloadBase64Image1 = (base64Image: string | undefined, filename: string, documentData: File | undefined) => {
        if (base64Image) {
            try {
                const byteString = atob(base64Image.split(',')[1]); // Decode base64
                const mimeString = base64Image.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type

                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);

                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                const blob = new Blob([ab], { type: mimeString });

                // Buat URL dan trigger download
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('Error processing Base64 image:', error);
            }
        } else if (documentData) {
            try {
                const blobUrl = URL.createObjectURL(documentData);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = documentData.name; // Gunakan nama asli
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('Error downloading original file:', error);
            }
        } else {
            console.log('No Base64 or documentData available.');
        }
    };

    const cancelPreviewPdf = () => {
        setPreviewPdf(false);
        // setSelectedImages([]);
    };

    const handlePreview = async (imageLocal: any) => {
        const fileName = imageLocal.filegambar;

        if (fileName === undefined) {
            downloadBase64Image1(imageLocal.decodeBase64_string, imageLocal.name, imageLocal);
        } else {
            const extension = fileName.split('.').pop(); // Hasil: "pdf"
            if (extension === 'pdf') {
                const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${kode_entitas}&param1=${imageLocal.filegambar}`);

                if (!responsePreviewPdf.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                // Assuming the response contains the URL directly
                const pdfBlob = await responsePreviewPdf.blob();
                const pdfObjectURL = URL.createObjectURL(pdfBlob);

                setPdfUrl(pdfObjectURL);
                setPreviewPdf(true);
            } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                setStateDataHeader((prevState: any) => ({
                    ...prevState,
                    isOpenPreview: true,
                    imageDataUrl: imageLocal.decodeBase64_string,
                    indexPreview: imageLocal.name,
                }));
            } else {
                downloadBase64Image1(imageLocal.decodeBase64_string, imageLocal.name, imageLocal);
            }
        }
    };

    return (
        <div className="panel-tab !w-full !h-[calc(100%-380px)]" style={{ background: '#F7F7F7'}}>
            <TabComponent ref={(t) => (tabPhuList = t)} selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                <div className="e-tab-header !h-[30px]">
                    <div tabIndex={0}>1. Alokasi Pembayaran</div>
                    <div tabIndex={2}>3. Bukti Pendukung</div>
                </div>
                <div className="e-content !h-[calc(100%-30px)] !w-full">
                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={0}>
                        {/* <TooltipComponent ref={(t) => (tooltipDetailBarang = t)} beforeRender={beforeRenderDetailBarang} openDelay={1000} target=".e-headertext"> */}
                        <div className='w-full h-[calc(100%-50px)]'>

                        <GridComponent
                            // key={gridKeyDataBarang}
                            id="gridRpeList"
                            name="gridRpeList"
                            className="gridRpeList"
                            locale="id"
                            ref={gridRpeListRef}
                            dataSource={dataBarang?.nodes}
                            // dataSource={stateDataDetail.searchKeywordNoSj !== '' ? filteredDataBarang : dataBarang?.nodes}
                            editSettings={{ allowAdding: true, allowEditing: true, allowDeleting: true, newRowPosition: 'Bottom' }}
                            selectionSettings={{ mode: 'Row', type: 'Single' }}
                            allowResizing={true}
                            autoFit={true}
                            rowHeight={22}
                            height={"100%"} //170 barang jadi 150 barang produksi
                            gridLines={'Both'}
                            // loadingIndicator={{ indicatorType: 'Shimmer' }}
                            // actionBegin={actionBeginDetailBarang}
                            // actionComplete={actionCompleteDetailBarang}
                            recordClick={(args: any) => {
                                currentDaftarBarang = gridRpeListRef.current?.getSelectedRecords() || [];
                                if (currentDaftarBarang.length > 0) {
                                    gridRpeListRef.current?.startEdit();
                                }
                            }}
                        >
                            <ColumnsDirective>
                                {/* <ColumnDirective field="id" type="number" isPrimaryKey={true} headerText="No." headerTextAlign="Center" textAlign="Center" width="30" /> */}
                                <ColumnDirective
                                    field="no_fbm"
                                    isPrimaryKey={true}
                                    headerText="No. FBM"
                                    headerTextAlign="Center"
                                    textAlign="Left"
                                    width="120"
                                    // clipMode="EllipsisWithTooltip"
                                    // template={(args: any) => TemplateNoSj(args)}
                                    // editTemplate={EditTemplateNoSj}
                                />

                                <ColumnDirective
                                    field="nopol"
                                    isPrimaryKey={true}
                                    headerText="No. Kendaraan"
                                    headerTextAlign="Center"
                                    textAlign="Left"
                                    width="80"
                                    // editTemplate={EditTemplateNoVch}
                                />
                                <ColumnDirective
                                    field="no_mb"
                                    isPrimaryKey={true}
                                    headerText="No. MB"
                                    headerTextAlign="Center"
                                    textAlign="Left"
                                    width="120"
                                    // editTemplate={EditTemplateNoFb}
                                />
                                <ColumnDirective
                                    field="tgl_mb"
                                    isPrimaryKey={true}
                                    headerText="Tgl. MB"
                                    headerTextAlign="Center"
                                    textAlign="Center"
                                    width="80"
                                    format={formatDate}
                                    type="date"
                                    // template={(args: any) => TemplateTglFb(args)}
                                    // editTemplate={EditTemplateTglFb}
                                />
                                <ColumnDirective
                                    isPrimaryKey={true}
                                    field="nama_gudang"
                                    headerText="Gudang Asal"
                                    headerTextAlign="Center"
                                    textAlign="Left"
                                    width="200"
                                    // editTemplate={EditTemplateHari}
                                />
                                <ColumnDirective
                                    isPrimaryKey={true}
                                    field="nama_tujuan"
                                    headerText="Gudang Tujuan"
                                    headerTextAlign="Center"
                                    textAlign="Left"
                                    width="200"
                                    // editTemplate={EditTemplateHari}
                                />
                                <ColumnDirective
                                    isPrimaryKey={true}
                                    field="pph23"
                                    headerText="PPH 23"
                                    headerTextAlign="Center"
                                    textAlign="Center"
                                    width="50"
                                    // editTemplate={EditTemplateHari}
                                />
                                <ColumnDirective
                                    field="total_berat"
                                    isPrimaryKey={true}
                                    // format={formatFloat}
                                    headerText="Total Berat"
                                    headerTextAlign="Center"
                                    textAlign="Right"
                                    format="N2"
                                    edit={qtyParams}
                                    width="100"
                                    // editTemplate={EditTemplateSisa}
                                />
                                <ColumnDirective
                                    field="harga_eks"
                                    isPrimaryKey={true}
                                    // format={formatFloat}
                                    format="N2"
                                    headerText="Harga Ekspedisi"
                                    headerTextAlign="Center"
                                    textAlign="Right"
                                    width="100"
                                    editTemplate={EditTemplateHargaEks}
                                />
                                <ColumnDirective
                                    field="total_rp"
                                    isPrimaryKey={true}
                                    format="N2"
                                    edit={qtyParams}
                                    headerText="Nilai"
                                    headerTextAlign="Center"
                                    textAlign="Right"
                                    width="120"
                                    // editTemplate={EditTemplateSisa}
                                />
                                <ColumnDirective
                                    field="tambahan_jarak"
                                    isPrimaryKey={true}
                                    format="N2"
                                    headerText="Tambahan Jarak"
                                    headerTextAlign="Center"
                                    textAlign="Right"
                                    width="120"
                                    editTemplate={editTemplateTambahanJarak}
                                    template={templateTambahanJarak}
                                />
                                <ColumnDirective
                                    template={templatePilih}
                                    // field="nama_barang"
                                    headerText="Pilih"
                                    headerTextAlign="Center"
                                    textAlign="Center"
                                    width="50"
                                    editTemplate={editTemplatePilih}
                                />
                                <ColumnDirective
                                    field="total_klaim_ekspedisi"
                                    isPrimaryKey={true}
                                    format="N2"
                                    headerText="Nilai Klaim Ekspedisi FBM"
                                    headerTextAlign="Center"
                                    textAlign="Right"
                                    width="150"
                                />
                            </ColumnsDirective>

                            <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                        </GridComponent>
                        </div>
                        {/* </TooltipComponent> */}

                        <div className="panel-pager h-[40px] ">
                            <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                    <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                        <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                            <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                    <div className="mt-1 flex">
                                                        {/* <ButtonComponent
                                                                                id="buEdit1"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-primary e-small"
                                                                                iconCss="e-icons e-small e-edit"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                onClick={() => DetailBarangEdit(gridPhuList)}
                                                                            /> */}
                                                        <ButtonComponent
                                                            id="buDelete1"
                                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                            cssClass="e-warning e-small"
                                                            iconCss="e-icons e-small e-trash"
                                                            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                            // onClick={() =>
                                                            //     DetailNoFakturDelete(
                                                            //         gridPhuListRef.current,
                                                            //         swalDialog,
                                                            //         setDataBarang,
                                                            //         setStateDataFooter,
                                                            //         setStateDataHeader,
                                                            //         stateDataHeader,
                                                            //         stateDataFooter
                                                            //     )
                                                            // }
                                                            onClick={() => {
                                                                handleDeleteDetail('hapus', gridRpeListRef.current);
                                                            }}
                                                        />
                                                        <ButtonComponent
                                                            id="buDeleteAll1"
                                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                            cssClass="e-danger e-small"
                                                            iconCss="e-icons e-small e-erase"
                                                            style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                            // onClick={() =>
                                                            //     DetailNoFakturDeleteAll(
                                                            //         gridPhuListRef.current,
                                                            //         swalDialog,
                                                            //         setDataBarang,
                                                            //         setStateDataFooter,
                                                            //         setStateDataHeader,
                                                            //         stateDataHeader,
                                                            //         stateDataFooter
                                                            //     )
                                                            // }
                                                            onClick={() => {
                                                                handleDeleteDetail('hapusAll', gridRpeListRef.current);
                                                            }}
                                                        />
                                                        <div className="flex" style={{ width: '30%' }}>
                                                            <div style={{ width: '50%' }}>
                                                                <div className="set-font-11" style={{ marginRight: 2 + 'em' }}>
                                                                    <b>Berat Klaim &nbsp; : &nbsp;&nbsp;&nbsp;{frmNumber(stateDataFooter?.beratKlaim)}</b>
                                                                </div>
                                                            </div>
                                                            <div style={{ width: '50%' }}>
                                                                <div className="set-font-11" style={{ marginRight: 2 + 'em' }}>
                                                                    <b>Berat Total &nbsp;: &nbsp;&nbsp;&nbsp;{frmNumber(stateDataFooter?.beratTotal)}</b>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipComponent>
                                            </TooltipComponent>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={1}>
                        <div className="flex h-full">
                            <div style={{ width: '28%' }}>
                                <label style={{ marginLeft: '13px', fontSize: '11px' }}>Daftar File Dokumen Pendukung :</label>
                                <div className="border p-3 !h-[calc(100%-80px)]" style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11,  marginLeft: '10px', overflowY: 'scroll' }}>
                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                        {files?.map((file: any, index: any) => (
                                            <li
                                                onClick={() => pilihFilePendukung(file, index)}
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #ccc',
                                                    padding: '5px 0',
                                                    backgroundColor: numberId === index ? 'yellow' : 'white', // Ubah warna background
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <span style={{ width: '5%', textAlign: 'center', fontWeight: 'bold' }}>{index + 1} |</span>
                                                <span style={{ flex: 1, marginLeft: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>
                                                    {file.name === undefined ? file.fileoriginal : file.name}
                                                </span>
                                                {/* <button onClick={() => clearFile(index)} style={{ fontSize: '10px', marginLeft: '10px' }}>
                                                    Hapus
                                                </button> */}
                                                {/* <TooltipComponent content={`Hapus File Index ${index + 1}`} position="TopCenter">
                                                    <ButtonComponent
                                                        id="close"
                                                        cssClass="e-primary e-small"
                                                        iconCss="e-icons e-close"
                                                        style={{
                                                            color: '#121111',
                                                            cursor: 'pointer',
                                                            fontSize: '5px',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            padding: 0,
                                                            fontWeight: 'bold',
                                                        }}
                                                        // onClick={() => clearFile(index)}
                                                        onClick={() => handleHapusFile(index)}
                                                    />
                                                </TooltipComponent> */}
                                                <TooltipComponent content={`Hapus File Index ${index + 1}`} position="TopCenter">
                                                    <ButtonComponent
                                                        id="close"
                                                        cssClass="e-primary e-small"
                                                        iconCss="e-icons e-close"
                                                        style={{
                                                            color: '#121111',
                                                            cursor: 'pointer',
                                                            fontSize: '5px',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            padding: 0,
                                                            fontWeight: 'bold',
                                                        }}
                                                        onClick={() => clearFile(index)}
                                                    />
                                                </TooltipComponent>
                                                <TooltipComponent content={`Preview Index ${index + 1}`} position="TopCenter">
                                                    <ButtonComponent
                                                        id={`preview-${index}`}
                                                        cssClass="e-primary e-small custom-button"
                                                        iconCss="e-icons e-zoom-in"
                                                        style={{
                                                            marginLeft: '10px',
                                                            color: '#121111',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            fontSize: '10px',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            padding: 0,
                                                        }}
                                                        onClick={() => handleFileClick(file, file)}
                                                    />
                                                </TooltipComponent>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div style={{ width: '2%' }}></div>
                            <div style={{ width: '48%', marginTop: '25px' }}>
                                <input type="file" accept="image/*,.pdf,.xls,.xlsx,.rar" style={{ display: 'none' }} onChange={handleFileUpload} multiple id="fileInput" />
                                {masterDataState === 'BARU' || masterDataState === 'EDIT' || masterDataState === 'APPROVAL' ? (
                                    <>
                                        <input
                                            type="file"
                                            // id={`imageInput${index}`}
                                            // name={`image${index}`}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            // onChange={(e) => handleFileUpload(e, index)}
                                            multiple
                                        />
                                        <button
                                            type="button"
                                            className="btn mb-2 h-[4.5vh]"
                                            style={{
                                                backgroundColor: '#3b3f5c',
                                                color: 'white',
                                                width: '20%',
                                                height: '15%',
                                                marginTop: -7,
                                                borderRadius: '5px',
                                                fontSize: '11px',
                                            }}
                                            // onClick={() => handleClick(index)}
                                            onClick={() => document.getElementById('fileInput')!.click()}
                                        >
                                            <FontAwesomeIcon icon={faUpload} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Ambil File
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn mb-2 h-[4.5vh]"
                                            style={{
                                                backgroundColor: '#3b3f5c',
                                                color: 'white',
                                                width: '20%',
                                                height: '15%',
                                                marginTop: -7,
                                                borderRadius: '5px',
                                                fontSize: '11px',
                                            }}
                                            // onClick={() => handleUploadZip('123')}
                                            // onClick={() => clearImage(index)}
                                            onClick={() => clearAllFiles()}
                                        >
                                            <FontAwesomeIcon icon={faEraser} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Hapus Semua
                                        </button>
                                    </>
                                ) : null}
                                <button
                                    type="button"
                                    className="btn mb-2 h-[4.5vh]"
                                    style={{
                                        backgroundColor: '#3b3f5c',
                                        color: 'white',
                                        width: '20%',
                                        height: '15%',
                                        marginTop: -7,
                                        borderRadius: '5px',
                                        fontSize: '11px',
                                    }}
                                    onClick={() => downloadBase64Image1(documentData.decodeBase64_string, documentData.name, documentData)}
                                >
                                    Simpan File
                                </button>
                                <button
                                    type="submit"
                                    className="btn mb-2 h-[4.5vh]"
                                    style={{
                                        backgroundColor: '#3b3f5c',
                                        color: 'white',
                                        width: '20%',
                                        height: '15%',
                                        marginTop: -7,
                                        borderRadius: '5px',
                                        fontSize: '11px',
                                    }}
                                    onClick={() => handlePreview(documentData)}
                                    // onClick={() => handleUpload('RE0000000084')}
                                >
                                    Preview
                                </button>
                            </div>
                            {/* <div style={{ width: '100%', marginTop: '20px' }}>{openPreview()}</div> */}
                        </div>
                    </div>
                </div>
            </TabComponent>
            {/* Modal Preview File Pendukung untuk PDF 1 */}
            {PreviewPdf && (
                <>
                    <Draggable>
                        <div className={`${styles.modalPreviewPictureDragable}`} style={modalPosition1}>
                            <div className={`${styles.scrollableContent}`} style={{ maxHeight: '700px', overflowY: 'auto' }}>
                                <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <PagePDF key={`page_${index + 1}`} pageNumber={index + 1} className={styles.page} />
                                    ))}
                                </Document>
                            </div>
                            <button className={`${styles.closeButtonDetailDragable}`} onClick={cancelPreviewPdf}>
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </Draggable>
                </>
            )}
        </div>
    );
};

export default TemplateDetailRpe;
