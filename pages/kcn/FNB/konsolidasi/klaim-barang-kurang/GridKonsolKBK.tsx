import React, { useEffect, useRef } from 'react';
import {
    Grid,
    GridComponent,
    ColumnDirective,
    ColumnsDirective,
    Inject,
    Page,
    Edit,
    Sort,
    Filter,
    Group,
    Resize,
    Reorder,
    Selection,
    ExcelExport,
    PdfExport,
    rowSelected,
} from '@syncfusion/ej2-react-grids';
import { createContext, useContext, useState } from 'react';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

let openModalEdit = false;
const zeroValueAccessor = (field: string, data: any, column: any) => {
    return data[field] === 0 || isNaN(data[field]) ? '' : data[field]; // If the value is 0, return empty string
};

const pageSet = {
    pageSize: 25,
    pageCount: 5,
    pageSizes: ['25', '50', '100', 'All'],
};

const rowrice = (args: any) => {
    const rowData = args.data as any;
    if (rowData.pelunasan === 'Belum lunas') {
        args.row.style.backgroundColor = '#f8d7da'; // Warna merah muda
    }
};
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faCheck, faEdit } from '@fortawesome/free-solid-svg-icons';

import DIalogSerhakan from './DIalogSerhakan';
import moment from 'moment';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useProgress } from '@/context/ProgressContext';
import { useExample } from '../../../../../utils/konsolidasi/klaim-barang-kurang/ContexKlaimBarangKurang';

const colderice = (args: any) => {
    if (args.column.field === 'pu_serah') {
        // Contoh: Warnai berdasarkan nilai
        args.cell.style.backgroundColor = '#fbf5a3'; // Warna merah muda
    }
    if (args.column.field === 'pu_tanggal') {
        // Contoh: Warnai berdasarkan nilai
        args.cell.style.backgroundColor = '#fbf5a3'; // Warna merah muda
    }
    if (args.column.field === 'pu_userid') {
        // Contoh: Warnai berdasarkan nilai
        args.cell.style.backgroundColor = '#fbf5a3'; // Warna merah muda
    }
    if (args.column.field === 'ku_terima') {
        // Contoh: Warnai berdasarkan nilai
        args.cell.style.backgroundColor = '#ceffce'; // Warna merah muda
    }
    if (args.column.field === 'ku_tanggal') {
        // Contoh: Warnai berdasarkan nilai
        args.cell.style.backgroundColor = '#ceffce'; // Warna merah muda
    }
    if (args.column.field === 'ku_userid') {
        // Contoh: Warnai berdasarkan nilai
        args.cell.style.backgroundColor = '#ceffce'; // Warna merah muda
    }
};

const headerNewLine = (value1: any, value2: any) => (
    <div style={{ textAlign: 'center', lineHeight: '1.5em' }}>
        {value1}
        <div>{value2}</div>
    </div>
);

const editOptions = {
    allowAdding: true,
    allowDeleting: true,
    allowEditing: true,
};
const formatDateWaktu: Object = { type: 'date', format: 'dd-MM-yyyy' };
const isObjectUpdated = (obj1: Record<string, any>, obj2: Record<string, any>): boolean => {
    for (const key in obj1) {
        if (String(obj1[key]) !== String(obj2[key])) {
            if (key === 'umur' || key === 'nominal' || key === 'sisa_nominal') {
                continue;
            }
            console.log('key', key);

            console.log('key awal', obj1[key]);
            console.log('key kedua', obj2[key]);

            return true; // Jika ada perbedaan, kembalikan true
        }
    }
    return false; // Jika semua data sama, kembalikan false
};

const checkValueAccessorLevel2 = (field: string, data: any, column: any) => {
    return data[field] === 'Y' ? `✔️` : ''; // If the value is 0, return empty string
};

const EditTemplateSerah = (args: any) => {
    const { setDialogOpen } = useExample();
    return (
        <div style={{ position: 'relative' }}>
            <TextBoxComponent id="diserahkan-id" style={{ fontSize: '12px' }} value={args.nip} />
            <button style={{ position: 'absolute', top: '15px', right: '5px', background: 'none', border: 'none' }} type="button">
                <FontAwesomeIcon
                    icon={faEdit}
                    className="ml-2"
                    width="15"
                    height="15"
                    onClick={() => {
                        setDialogOpen(true);
                    }}
                />
            </button>
        </div>
    );
};
const GridKonsolKBK = ({
    handleSelect,
    handleRecordDoubleClick,
    formatDate,
    gridKBK,
    setSelectedKBK,
    showDetail,
    dialogOpen,
    setDialogOpen,
    selectedKBK,
    refreshData
}: {
    handleSelect: any;
    handleRecordDoubleClick: any;
    formatDate: any;
    gridKBK: any;
    setSelectedKBK: any;
    showDetail: any;
    dialogOpen: any;
    setDialogOpen: any;
    selectedKBK: any;
    refreshData: any
}) => {
    const { sessionData } = useSession();
    const { startProgress, isLoading, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const userid = sessionData?.userid ?? '';
    const token = sessionData?.token ?? '';
    const [indexSelect, setIndexSelect] = useState<any>(null);

    // file pendukung
    const [indexPreview, setIndexPreview] = useState(0);
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [imageTipe, setImageTipe] = useState('');
    const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [isOpenPreviewDobel, setIsOpenPreviewDobel] = useState(false);
    const [isOpenPreviewDobelTtd, setIsOpenPreviewDobelTtd] = useState(false);
    const [zoomScale, setZoomScale] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [imageDataUrlTtd, setImageDataUrlTtd] = useState('');
    const [imageDataUrlTtp, setImageDataUrlTtp] = useState('');
    const [zoomScaleTtd, setZoomScaleTtd] = useState(0.5);
    const [positionTtd, setPositionTtd] = useState({ x: 0, y: 0 });
    const [rotationAngle, setRotationAngle] = useState(0);

    //fungsi file pendukung
    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);
    const handleZoom = (tipe: any) => {
        if (tipe === 'ttd') {
            setZoomScaleTtd(1);
            setPositionTtd({ x: 0, y: 0 }); // Reset position
            setImageDataUrlTtd('');
        }
    };

    const HandleZoomIn = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    };

    const HandleZoomOut = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    };

    const HandleCloseZoom = (setIsOpenPreview: Function) => {
        setIsOpenPreview(false);
    };

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

    useEffect(() => {
        if (isOpenPreview) {
            window.addEventListener('wheel', handleWheel, { passive: false });
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isOpenPreview, handleMouseMove, handleMouseUp, handleWheel]);

    const actionCompleteHandle = async (args: any) => {
        if (args.requestType === 'save') {
            const isUpdatedData = isObjectUpdated(args.data, args.rowData);
            let dataPersiapan: any;

            try {
                if (isUpdatedData === true) {
                    if (confirm('Akan Meng Update Data ?')) {
                        startProgress();
                        setLoadingMessage('Menyimpan Data...');
                        if (args.data.tipe === 'FBM') {
                            console.log('tipe data fbm');
                            const jsonTemp = {
                                method: 'GET',
                                entitas: args.data.entitas_master,
                                kode_ba: args.data.kode_ba,
                                tipe: 'FBM',
                            };
                            const res = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, jsonTemp, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            dataPersiapan = res.data.data?.[0];
                            console.log('res', res);
                            console.log('res tgl', args.data.pu_ket_tanggal ,moment(args.data.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'));
                            const kirimFBM = {
                                entitas: dataPersiapan.entitas_master,
                                method: 'POST',
                                kode_ba: dataPersiapan.kode_ba,
                                no_ba: dataPersiapan.no_ba,
                                entitas_master: dataPersiapan.entitas_master,
                                tgl_ba_dikirim: moment(args.data.tgl_ba_dikirim).isValid()
                                    ? moment(args.data.tgl_ba_dikirim, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss')
                                    : null,
                                pu_serah: args.data.pu_serah,
                                pu_tanggal: moment(args.data.pu_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(args.data.pu_tanggal, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                                pu_userid: args.data.pu_userid,
                                pu_keterangan: args.data.pu_keterangan,
                                ku_terima: args.data.ku_terima,
                                ku_tanggal: moment(args.data.ku_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(args.data.ku_tanggal, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                                ku_userid: args.data.ku_userid,
                                ku_keterangan: args.data.ku_keterangan,
                                komplit: dataPersiapan.komplit,
                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                userid: userid.toUpperCase(),
                                ku_ket_tanggal: moment(args.data.ku_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid()
                                    ? moment(args.data.ku_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
                                    : null,
                                ku_ket_userid: args.data.ku_ket_userid,
                                pu_ket_tanggal: args.data.pu_ket_tanggal !== null ? moment(args.data.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                                pu_ket_userid: args.data.pu_ket_userid,
                                tipe: args.data.tipe,
                                no_fj: args.data.no_fj,
                                tgl_fbm: moment(args.data.tgl_fbm, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(args.data.tgl_fbm, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                                tgl_rba: moment(args.data.tgl_rba, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(args.data.tgl_rba, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                            };
                            console.log('kirimFBM', kirimFBM, args, args.data.pu_ket_tanggal, 'valid :', moment(args.data.pu_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid());
                            const resKirim = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, kirimFBM, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });

                            if (resKirim) {
                                setLoadingMessage('Berhasil');
                                endProgress();
                                console.log(resKirim);
                            }
                        } else if (args.data.tipe === 'Faktur') {
                            const jsonTemp = {
                                method: 'GET',
                                entitas: args.data.entitas_master,
                                no_fj: args.data.no_fj,
                            };
                            const res = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, jsonTemp, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            dataPersiapan = res.data.data?.[0];
                            console.log('dataPersiapan', dataPersiapan);
                            console.log('dataPersiapan args', args.data);

                            const tgl_rba = new Date(args.data.tgl_fbm)
                            const tgl_rba1 =  args.data.tgl_rba === null ? new Date(args.data.tgl_rba) : new Date(args.data.tgl_rba)

                            console.log('tgl_rba',args.data.tgl_fbm, tgl_rba);
                            

                            const kirim = {
                                entitas: dataPersiapan.entitas_master,
                                method: 'POST',
                                kode_ba: args.data.kode_fbm == '' || args.data.kode_fbm == null ?  args.data.no_fj :  args.data.kode_fbm,
                                kode_fbm: args.data.kode_fbm == '' || args.data.kode_fbm == null ? '' : args.data.kode_fbm,
                                no_ba: args.data.no_ba == '' || args.data.no_ba == null ? dataPersiapan.no_fj : args.data.no_ba,
                                entitas_master: dataPersiapan.entitas_master,
                                tgl_ba_dikirim: moment(args.data.tgl_ba_dikirim).isValid() ? moment(args.data.tgl_ba_dikirim).format('YYYY-MM-DD HH:mm:ss') : null,
                                pu_serah: args.data.pu_serah,
                                pu_tanggal: moment(args.data.pu_tanggal).isValid() ? moment(args.data.pu_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                                pu_userid: args.data.pu_userid,
                                pu_keterangan: args.data.pu_keterangan,
                                ku_terima: args.data.ku_terima,
                                ku_tanggal: moment(args.data.ku_tanggal).isValid() ? moment(args.data.ku_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                                ku_userid: args.data.ku_userid,
                                ku_keterangan: args.data.ku_keterangan,
                                komplit: dataPersiapan.komplit,
                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                userid: userid.toUpperCase(),
                                ku_ket_tanggal: moment(args.data.ku_ket_tanggal).isValid() ? moment(args.data.ku_ket_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                                ku_ket_userid: args.data.ku_ket_userid,
                                pu_ket_tanggal: args.data.pu_ket_tanggal !== null ? moment(args.data.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                                pu_ket_userid: args.data.pu_ket_userid,
                                tipe: args.data.tipe,
                                no_fj: args.data.no_fj,
                                tgl_fbm: moment(args.data.tgl_fbm).isValid() ? moment(tgl_rba).format('YYYY-MM-DD') + ' '+ moment().format('HH:mm:ss') : null,
                                tgl_rba: moment(args.data.tgl_rba).isValid() ? moment(tgl_rba1).format('YYYY-MM-DD') + ' '+ moment().format('HH:mm:ss') : null,
                                no_rba: args.data.no_rba == '' || args.data.no_rba == null ? null : args.data.no_rba,
                            };

                            console.log('kirim',kirim);
                            

                            const resKirim = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, kirim, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });

                            if (resKirim) {
                                console.log(resKirim);
                                setLoadingMessage('Berhasil');
                                endProgress();
                            }
                        }
                    } else {
                        console.log('args.data', args);
                        await refreshData()
                        return;
                        
                    }

                    console.log('data ter update', isUpdatedData, args.data, args.rowData, dataPersiapan);
                    // if(dataPersiapan.length !== 0 ) {

                    // }
                }
            } catch (error: any) {
                if (error) {
                    setLoadingMessage('Gagal');
                    endProgress();
                    console.log(error);
                    Swal.fire({
                        title: 'Gagal Simpan',
                        text: `${error?.response?.data?.message} 
                    (${error?.response?.data?.error})`,
                        target: '#main-target',
                        icon: 'warning',
                    });
                }
            }
            endProgress();
        }
    };

    const templateTombolTTD = (args: any) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
                    {args.filegambar !== '' ? (
                        <input
                            readOnly={true}
                            style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                borderRadius: '5px', // Atur sesuai dengan kebutuhan
                                fontSize: '16px', // Sesuaikan ukuran font
                            }}
                            value={'✔'}
                        />
                    ) : null}
                </div>
                <div onClick={() => previewImage(args)}>{args.filegambar !== '' ? <FontAwesomeIcon icon={faCamera} width="18" height="18" /> : null}</div>
            </div>
        );
    };

    const templateEditTemplateFilePendukung = (args: any) => {
        return (
            <div style={{ position: 'relative' }}>
                <TextBoxComponent id="diserahkan-id" style={{ fontSize: '12px' }} value={args.filegambar ? '✔️' : ''} readOnly />
                <button style={{ position: 'absolute', top: '15px', right: '5px', background: 'none', border: 'none' }} type="button">
                    <FontAwesomeIcon
                        icon={faCamera}
                        className="ml-2"
                        width="15"
                        height="15"
                        onClick={() => {
                            previewImage(args);
                        }}
                    />
                </button>
            </div>
        );
    };

    const previewImage = async (args: any) => {
        console.log('args.kode_rpeba', args.kode_rpeba);
        if (args.filegambar == '' || args.filegambar == null || args.filegambar == undefined) {
            return alert('Tidak ada file gambar untuk dokumen tersebut');
        }
        const resFilePendukung: any = await axios.get(`${apiUrl}/erp/load_fileGambar_byId`, {
            params: {
                entitas: args.entitas_master,
                param1: `${args.entitas_master}RPEBA${args.kode_rpeba}`,
                param2: '101',
                param3: '',
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
        });
        console.log('resFilePendukung', resFilePendukung.data.data?.[0].decodeBase64_string);
        console.log('resFilePendukung tipe', resFilePendukung.data.data?.[0].filegambar.split('.')[1]);
        setIsOpenPreview(true);
        const mimeType = resFilePendukung.data.data?.[0].decodeBase64_string.split(':')[1].split(';')?.[0];
        setImageTipe(mimeType);
        setImageDataUrl(resFilePendukung.data.data?.[0].decodeBase64_string);
    };
    const tanggalUserSC = (args: any) => {
        const temp = gridKBK.current.dataSource?.[0].dummyUser;
        console.log('temp', gridKBK.current);

        const formEle = (gridKBK.current as any).element.querySelector('form').ej2_instances?.[0];
        if (formEle.getInputElement('pu_keterangan').value !== '') {
            formEle.getInputElement('pu_ket_tanggal').value = moment().toDate();
            formEle.getInputElement('pu_ket_userid').value = temp;
        } else {
            formEle.getInputElement('pu_ket_tanggal').value = null;
            formEle.getInputElement('pu_ket_userid').value = '';
        }
    };
    const keteranganSCParam: any = { params: { input: tanggalUserSC } };

    const tanggalUserKeuangan = (args: any) => {
        const temp = gridKBK.current.dataSource?.[0].dummyUser;
        console.log('temp', gridKBK.current);

        const formEle = (gridKBK.current as any).element.querySelector('form').ej2_instances?.[0];
        if (formEle.getInputElement('ku_terima').value !== '') {
            formEle.getInputElement('ku_tanggal').value = moment().toDate();
            formEle.getInputElement('ku_userid').value = temp;
        } else {
            formEle.getInputElement('ku_tanggal').value = null;
            formEle.getInputElement('ku_userid').value = '';
        }
    };
    const keteranganKeuanganParam: any = { params: { input: tanggalUserKeuangan } };

    const tanggalUserFinance = (args: any) => {
        const temp = gridKBK.current.dataSource?.[0].dummyUser;
        console.log('temp', gridKBK.current);

        const formEle = (gridKBK.current as any).element.querySelector('form').ej2_instances?.[0];
        if (formEle.getInputElement('ku_keterangan').value !== '') {
            formEle.getInputElement('ku_ket_tanggal').value = moment().toDate();
            formEle.getInputElement('ku_ket_userid').value = temp;
        } else {
            formEle.getInputElement('ku_ket_tanggal').value = null;
            formEle.getInputElement('ku_ket_userid').value = '';
        }
    };
    const keteranganFinanceParam: any = { params: { input: tanggalUserFinance } };
    const editACell = (args: any) => {
        gridKBK.current.editModule.editCell(parseInt(args.getAttribute('index')), gridKBK.current.getColumnByIndex(parseInt(args.getAttribute('data-colindex'))).field);
    };
    const load = (): void => {
        let instance = (document.getElementById('GridKonsolKBKData') as any).ej2_instances?.[0];
        if (instance) {
            instance.element.addEventListener('mouseup', function (e: any) {
                if ((e.target as HTMLElement).classList.contains('e-rowcell')) {
                    if (instance.isEdit) instance.endEdit();
                    const test = (e.target as any).getAttribute('data-colindex');
                    let index: number = parseInt((e.target as any).getAttribute('Index'));
                    setIndexSelect(index);
                    setSelectedKBK(index);
                    instance.selectRow(index);
                    instance.startEdit();
                    console.log('test', test);

                    if (test == 12) {
                        document.getElementById('GridKonsolKBKDatatgl_ba_kirim')?.focus();
                    } else if (test == 16) {
                        document.getElementById('GridKonsolKBKDatag')?.focus();
                    } else if (test == 17) {
                        document.getElementById('GridKonsolKBKDatapu_tanggal')?.focus();
                        document.getElementById('diserahkan-id')?.focus();
                    } else if (test == 20) {
                        document.getElementById('GridKonsolKBKDatapu_keterangan')?.focus();
                    } else if (test == 26) {
                        document.getElementById('GridKonsolKBKDataku_keterangan')?.focus();
                    }
                }
            });
        }
    };

    const simpanKetPem = async(rowData : any) => {
        let dataPersiapan: any;
        if (rowData.tipe === 'FBM') {
            console.log('tipe data fbm');
            const jsonTemp = {
                method: 'GET',
                entitas: rowData.entitas_master,
                kode_ba: rowData.kode_ba,
                tipe: 'FBM',
            };
            const res = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, jsonTemp, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dataPersiapan = res.data.data?.[0];
            console.log('res', res);
            console.log('res tgl', rowData.pu_ket_tanggal ,moment(rowData.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'));
            const kirimFBM = {
                entitas: dataPersiapan.entitas_master,
                method: 'POST',
                kode_ba: dataPersiapan.kode_ba,
                no_ba: dataPersiapan.no_ba,
                entitas_master: dataPersiapan.entitas_master,
                tgl_ba_dikirim: moment(rowData.tgl_ba_dikirim).isValid()
                    ? moment(rowData.tgl_ba_dikirim, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss')
                    : null,
                pu_serah: 'Y',
                pu_tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                pu_userid: userid.toUpperCase(),
                pu_keterangan: rowData.pu_keterangan,
                ku_terima: rowData.ku_terima,
                ku_tanggal: moment(rowData.ku_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(rowData.ku_tanggal, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                ku_userid: rowData.ku_userid,
                ku_keterangan: rowData.ku_keterangan,
                komplit: dataPersiapan.komplit,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                ku_ket_tanggal: moment(rowData.ku_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid()
                    ? moment(rowData.ku_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
                    : null,
                ku_ket_userid: rowData.ku_ket_userid,
                pu_ket_tanggal: rowData.pu_ket_tanggal !== null ? moment(rowData.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                pu_ket_userid: rowData.pu_ket_userid,
                tipe: rowData.tipe,
                no_fj: rowData.no_fj,
                tgl_fbm: moment(rowData.tgl_fbm, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(rowData.tgl_fbm, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                tgl_rba: moment(rowData.tgl_rba, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(rowData.tgl_rba, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
            };
            console.log('kirimFBM', kirimFBM, rowData, rowData.pu_ket_tanggal, 'valid :', moment(rowData.pu_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid());
            const resKirim = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, kirimFBM, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (resKirim) {
                setLoadingMessage('Berhasil');
                refreshData();
                endProgress();
                console.log(resKirim);
            }
        } else if (rowData.tipe === 'Faktur') {
            const jsonTemp = {
                method: 'GET',
                entitas: rowData.entitas_master,
                no_fj: rowData.no_fj,
            };
            const res = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, jsonTemp, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dataPersiapan = res.data.data?.[0];
            console.log('dataPersiapan', dataPersiapan);
            console.log('dataPersiapan args', rowData);

            const tgl_rba =  new Date(rowData.tgl_fbm)
                        const tgl_rba1 =  new Date(rowData.tgl_rba)

            console.log('tgl_rba',rowData.tgl_fbm, tgl_rba);
            

            const kirim = {
                entitas: dataPersiapan.entitas_master,
                method: 'POST',
                kode_ba: rowData.kode_fbm == '' || rowData.kode_fbm == null ?  rowData.no_fj :  rowData.kode_fbm,
                kode_fbm: rowData.kode_fbm == '' || rowData.kode_fbm == null ? '' : rowData.kode_fbm,
                no_ba: rowData.no_ba == '' || rowData.no_ba == null ? dataPersiapan.no_fj : rowData.no_ba,
                entitas_master: dataPersiapan.entitas_master,
                tgl_ba_dikirim: moment(rowData.tgl_ba_dikirim).isValid() ? moment(rowData.tgl_ba_dikirim).format('YYYY-MM-DD HH:mm:ss') : null,
                pu_serah: 'Y',
                pu_tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                pu_userid: userid.toUpperCase(),
                pu_keterangan: rowData.pu_keterangan,
                ku_terima: rowData.ku_terima,
                ku_tanggal: moment(rowData.ku_tanggal).isValid() ? moment(rowData.ku_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                ku_userid: rowData.ku_userid,
                ku_keterangan: rowData.ku_keterangan,
                komplit: dataPersiapan.komplit,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                ku_ket_tanggal: moment(rowData.ku_ket_tanggal).isValid() ? moment(rowData.ku_ket_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                ku_ket_userid: rowData.ku_ket_userid,
                pu_ket_tanggal: rowData.pu_ket_tanggal !== null ? moment(rowData.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                pu_ket_userid: rowData.pu_ket_userid,
                tipe: rowData.tipe,
                no_fj: rowData.no_fj,
                tgl_fbm: moment(rowData.tgl_fbm).isValid() ? moment(tgl_rba).format('YYYY-MM-DD') + ' '+ moment().format('HH:mm:ss') : null,
                tgl_rba: moment(rowData.tgl_rba).isValid() ? moment(tgl_rba1).format('YYYY-MM-DD') + ' '+ moment().format('HH:mm:ss') : null,
                no_rba: rowData.no_rba == '' || rowData.no_rba == null ? null : rowData.no_rba,
            };

            console.log('kirim',kirim);
            

            const resKirim = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, kirim, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (resKirim) {
                console.log(resKirim);
                refreshData();
                setLoadingMessage('Berhasil');
                endProgress();
            }
        }
    }
    const simpanKetKeuangan = async(rowData : any) => {
        let dataPersiapan: any;
        if (rowData.tipe === 'FBM') {
            console.log('tipe data fbm');
            const jsonTemp = {
                method: 'GET',
                entitas: rowData.entitas_master,
                kode_ba: rowData.kode_ba,
                tipe: 'FBM',
            };
            const res = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, jsonTemp, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dataPersiapan = res.data.data?.[0];
            console.log('res', res);
            console.log('res tgl', rowData.pu_ket_tanggal ,moment(rowData.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'));
            const kirimFBM = {
                entitas: dataPersiapan.entitas_master,
                method: 'POST',
                kode_ba: dataPersiapan.kode_ba,
                no_ba: dataPersiapan.no_ba,
                entitas_master: dataPersiapan.entitas_master,
                tgl_ba_dikirim: moment(rowData.tgl_ba_dikirim).isValid()
                    ? moment(rowData.tgl_ba_dikirim, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss')
                    : null,
                pu_serah: dataPersiapan.pu_serah,
                pu_tanggal: moment(dataPersiapan.pu_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(dataPersiapan.pu_tanggal, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                pu_userid: dataPersiapan.pu_userid,
                pu_keterangan: rowData.pu_keterangan,
                ku_terima:  'Y',
                ku_tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                ku_userid: userid.toUpperCase(),
                ku_keterangan: rowData.ku_keterangan,
                komplit: dataPersiapan.komplit,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                ku_ket_tanggal: moment(rowData.ku_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid()
                    ? moment(rowData.ku_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
                    : null,
                ku_ket_userid: rowData.ku_ket_userid,
                pu_ket_tanggal: rowData.pu_ket_tanggal !== null ? moment(rowData.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                pu_ket_userid: rowData.pu_ket_userid,
                tipe: rowData.tipe,
                no_fj: rowData.no_fj,
                tgl_fbm: moment(rowData.tgl_fbm, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(rowData.tgl_fbm, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                tgl_rba: moment(rowData.tgl_rba, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(rowData.tgl_rba, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
            };
            console.log('kirimFBM', kirimFBM, rowData, rowData.pu_ket_tanggal, 'valid :', moment(rowData.pu_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid());
            const resKirim = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, kirimFBM, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (resKirim) {
                setLoadingMessage('Berhasil');
                refreshData();
                endProgress();
                console.log(resKirim);
            }
        } else if (rowData.tipe === 'Faktur') {
            const jsonTemp = {
                method: 'GET',
                entitas: rowData.entitas_master,
                no_fj: rowData.no_fj,
            };
            const res = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, jsonTemp, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dataPersiapan = res.data.data?.[0];
            console.log('dataPersiapan', dataPersiapan);
            console.log('dataPersiapan args', rowData);

            const tgl_rba = rowData.tgl_rba === null ? new Date(rowData.tgl_fbm) : new Date(rowData.tgl_fbm)
                        const tgl_rba1 =  new Date(rowData.tgl_rba)

            console.log('tgl_rba',rowData.tgl_fbm,'tgl rba ', tgl_rba);
            

            const kirim = {
                entitas: dataPersiapan.entitas_master,
                method: 'POST',
                kode_ba: rowData.kode_fbm == '' || rowData.kode_fbm == null ?  rowData.no_fj :  rowData.kode_fbm,
                kode_fbm: rowData.kode_fbm == '' || rowData.kode_fbm == null ? '' : rowData.kode_fbm,
                no_ba: rowData.no_ba == '' || rowData.no_ba == null ? dataPersiapan.no_fj : rowData.no_ba,
                entitas_master: dataPersiapan.entitas_master,
                tgl_ba_dikirim: moment(rowData.tgl_ba_dikirim).isValid() ? moment(rowData.tgl_ba_dikirim).format('YYYY-MM-DD HH:mm:ss') : null,
                pu_serah: dataPersiapan.pu_serah,
                pu_tanggal: moment(dataPersiapan.pu_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(dataPersiapan.pu_tanggal, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                pu_userid: dataPersiapan.pu_userid,
                pu_keterangan: rowData.pu_keterangan,
                ku_terima:  'Y',
                ku_tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                ku_userid: userid.toUpperCase(),
                ku_keterangan: rowData.ku_keterangan,
                komplit: dataPersiapan.komplit,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                ku_ket_tanggal: moment(rowData.ku_ket_tanggal).isValid() ? moment(rowData.ku_ket_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                ku_ket_userid: rowData.ku_ket_userid,
                pu_ket_tanggal: rowData.pu_ket_tanggal !== null ? moment(rowData.pu_ket_tanggal, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null,
                pu_ket_userid: rowData.pu_ket_userid,
                tipe: rowData.tipe,
                no_fj: rowData.no_fj,
                tgl_fbm: moment(rowData.tgl_fbm).isValid() ? moment(tgl_rba).format('YYYY-MM-DD') + ' '+ moment().format('HH:mm:ss') : null,
                tgl_rba: moment(rowData.tgl_rba).isValid() ? moment(tgl_rba1).format('YYYY-MM-DD') + ' '+ moment().format('HH:mm:ss') : null,
                no_rba: rowData.no_rba == '' || rowData.no_rba == null ? null : rowData.no_rba,
            };

            console.log('kirim',kirim);
            

            const resKirim = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, kirim, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (resKirim) {
                console.log(resKirim);
                refreshData();
                setLoadingMessage('Berhasil');
                endProgress();
            }
        }
    }

    const selectedRow = (args: any) => {
        console.log('args', args);

        setIndexSelect(args.rowIndex);
        setSelectedKBK(args.rowIndex);
    };

    const rowClick = (args: any) => {
        if(args.cellIndex == 17) {
            Swal.fire({
                title: "Validasi serah terima dokumen berita acara Dept. Pembelian",
                input: "text",
                inputAttributes: {
                  autocapitalize: "off",
                  placeholder: 'No Ba'
                },
                showCancelButton: true,
                confirmButtonText: "Simpan",
                showLoaderOnConfirm: true,
                preConfirm: async (login) => {
             
                    
                    if(login === args.rowData.no_ba) {
                        await simpanKetPem(args.rowData)

                    } else {
                        return Swal.fire({
                            title: `No KBK Tidak sama`,
                          });
                    }
                  
                },
                allowOutsideClick: () => !Swal.isLoading()
              }).then((result) => {
                console.log('result', result);
                
              });
        } else if (args.cellIndex == 23) {
            Swal.fire({
                title: "Validasi serah terima dokumen berita acara Dept. Keuangan",
                input: "text",
                inputAttributes: {
                  autocapitalize: "off",
                  placeholder: 'No Ba'
                },
                showCancelButton: true,
                confirmButtonText: "Simpan",
                showLoaderOnConfirm: true,
                preConfirm: async (login) => {
             
                    
                    if(login === args.rowData.no_ba) {
                        await simpanKetKeuangan(args.rowData)

                    } else {
                        return Swal.fire({
                            title: `No KBK Tidak sama`,
                          });
                    }
                  
                },
                allowOutsideClick: () => !Swal.isLoading()
              }).then((result) => {
                console.log('result', result);
                
              });
        }
        
    }

    return (
        <>
            {dialogOpen && <DIalogSerhakan visible={dialogOpen} onClose={() => setDialogOpen(false)} gridRef={gridKBK} indexSelect={indexSelect} />}
            <GridComponent
                id="GridKonsolKBKData"
                locale="id"
                // dataSource={bokList}
                height={!showDetail ? '470px' : '300px'}
                rowSelected={selectedRow}
                recordDoubleClick={handleRecordDoubleClick}
                allowPaging={true}
                gridLines="Both"
                allowResizing={true}
                allowSorting={true}
                ref={gridKBK}
                pageSettings={pageSet}
                editSettings={editOptions}
                rowHeight={23}
                autoFit={true}
                queryCellInfo={colderice}
                rowDataBound={rowrice}
                enableHover={false}
                actionComplete={actionCompleteHandle}
                rowSelecting={selectedRow}
                recordClick={rowClick}
                // created={created}
                // load={load}
                // actionBegin={actionCompleteHandle}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        allowEditing={false}
                        freeze="Left"
                        field="entitas_master"
                        headerText="Entitas"
                        headerTextAlign="Center"
                        textAlign="Center"
                        width="50"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        allowEditing={false}
                        freeze="Left"
                        field="tipe"
                        width="70"
                        headerText="JENIS DOKUMEN"
                        headerTemplate={() => headerNewLine('JENIS', 'DOKUMEN')}
                        headerTextAlign="Center"
                        textAlign="Center"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        allowEditing={false}
                        freeze="Left"
                        field="pabrik"
                        width="170"
                        headerText="PABRIK / SUPPLIER"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective allowEditing={true} freeze="Left" field="no_ba" width="140" headerText="NO. BA" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective allowEditing={true} editType='datepickeredit' format={formatDate} freeze="Left" field="tgl_fbm" width="80" headerText="TGL BA" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" edit={{params: {
                        format: 'dd-MM-yy', showClearButton: false
                    }}} />
                    <ColumnDirective
                        columns={[
                            { field: 'no_fj', allowEditing: false, headerText: 'NO. FJ', headerTextAlign: 'Center', textAlign: 'Left', width: 120, clipMode: 'EllipsisWithTooltip' },
                            {
                                field: 'tgl_fj',
                                allowEditing: false,
                                format: formatDate,
                                type: 'date',
                                headerText: 'TGL. FJ',
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            {
                                field: 'jatuh_tempo',
                                allowEditing: false,
                                headerText: 'JATUH TEMPO',
                                type: 'date',
                                format: formatDate,
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            {
                                field: 'umur',
                                allowEditing: false,
                                headerText: 'UMUR',
                                valueAccessor: zeroValueAccessor,
                                headerTextAlign: 'Center',
                                textAlign: 'Right',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            {
                                field: 'nominal',
                                valueAccessor: zeroValueAccessor,
                                allowEditing: false,
                                format: 'N2',
                                headerText: 'NOMINAL',
                                headerTextAlign: 'Center',
                                textAlign: 'Right',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            { field: 'pelunasan', allowEditing: false, headerText: 'PELUNASAN', headerTextAlign: 'Center', textAlign: 'Left', width: 85, clipMode: 'EllipsisWithTooltip' },
                            {
                                field: 'sisa_nominal',
                                allowEditing: false,
                                valueAccessor: zeroValueAccessor,
                                format: 'N2',
                                headerText: 'SISA NOMINAL',
                                headerTextAlign: 'Center',
                                textAlign: 'Right',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                        ]}
                        textAlign="Center"
                        headerText="FAKTUR JUAL"
                        width={110}
                    />
                    <ColumnDirective
                        field="tgl_ba_dikirim"
                        format={formatDateWaktu}
                        editType="datepickeredit"
                        type="date"
                        width="110"
                        headerText="TGL. BA DIKIRIM"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        columns={[
                            { field: 'no_rba', headerText: 'NO. RBA', headerTextAlign: 'Center', textAlign: 'Left', width: 130, clipMode: 'EllipsisWithTooltip' },
                            {
                                field: 'tgl_rba',
                                allowEditing: true,
                                type: 'date',
                                editType: 'datepickeredit',
                                format: formatDate,
                                headerText: 'TGL. RBA',
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 120,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            {
                                field: 'nominal_rba',
                                allowEditing: false,
                                format: 'N2',
                                headerText: 'NOMINAL RBA',
                                headerTextAlign: 'Center',
                                textAlign: 'Right',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                        ]}
                        headerText="RBA"
                        textAlign="Center"
                        width={110}
                    />
                    <ColumnDirective
                        field="filegambar"
                        width="110"
                        headerText="FILE PENDUKUNG"
                        editTemplate={templateTombolTTD}
                        template={templateTombolTTD}
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        columns={[
                            {
                                field: 'pu_serah',
                                editTemplate: EditTemplateSerah,
                                valueAccessor: checkValueAccessorLevel2,
                                headerText: 'DISERAHKAN',
                                headerTextAlign: 'Center',
                                textAlign: 'Center',
                                allowEditing: false,
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            {
                                field: 'pu_tanggal',
                                editType: 'datepickeredit',
                                format: formatDateWaktu,
                                type: 'date',
                                headerText: 'TANGGAL',
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            { field: 'pu_userid', allowEditing: false, headerText: 'USER', headerTextAlign: 'Center', textAlign: 'Left', width: 85, clipMode: 'EllipsisWithTooltip' },
                        ]}
                        headerText="DEPT. PEMBELIAN"
                        textAlign="Center"
                        width={110}
                    />
                    <ColumnDirective
                        columns={[
                            { field: 'pu_keterangan', edit: keteranganSCParam, headerText: 'KETERANGAN', headerTextAlign: 'Center', textAlign: 'Left', width: 200, clipMode: 'EllipsisWithTooltip' },
                            {
                                field: 'pu_ket_tanggal',
                                allowEditing: false,
                                type: 'date',
                                format: formatDate,
                                headerText: 'TANGGAL',
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            { field: 'pu_ket_userid', allowEditing: false, headerText: 'USER', headerTextAlign: 'Center', textAlign: 'Left', width: 85, clipMode: 'EllipsisWithTooltip' },
                        ]}
                        headerTextAlign="Center"
                        headerText="KETERANGAN (SUPPLY CHAIN)"
                        textAlign="Center"
                        width={110}
                    />
                    <ColumnDirective
                        columns={[
                            {
                                field: 'ku_terima',
                                valueAccessor: checkValueAccessorLevel2,
                                edit: keteranganKeuanganParam,
                                allowEditing: false,
                                headerText: 'TERIMA',
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            {
                                field: 'ku_tanggal',
                                allowEditing: false,
                                type: 'date',
                                format: formatDate,
                                headerText: 'TANGGAL',
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            { field: 'ku_userid', allowEditing: false, headerText: 'USER', headerTextAlign: 'Center', textAlign: 'Left', width: 85, clipMode: 'EllipsisWithTooltip' },
                        ]}
                        headerTextAlign="Center"
                        headerText="DEPT. KEUANGAN"
                        textAlign="Center"
                        width={110}
                    />
                    <ColumnDirective
                        columns={[
                            {
                                field: 'ku_keterangan',
                                edit: keteranganFinanceParam,
                                headerText: 'KETERANGAN',
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 200,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            {
                                field: 'ku_ket_tanggal',
                                type: 'date',
                                format: formatDate,
                                headerText: 'TANGGAL',
                                allowEditing: false,
                                headerTextAlign: 'Center',
                                textAlign: 'Left',
                                width: 85,
                                clipMode: 'EllipsisWithTooltip',
                            },
                            { field: 'ku_ket_userid', allowEditing: false, headerText: 'USER', headerTextAlign: 'Center', textAlign: 'Left', width: 85, clipMode: 'EllipsisWithTooltip' },
                        ]}
                        headerText="KETERANGAN (FINANCE)"
                        textAlign="Center"
                        width={110}
                    />
                </ColumnsDirective>
                <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
            </GridComponent>

            {isOpenPreview && (
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: '1000',
                        overflow: 'hidden',
                    }}
                    // onClick={() => HandleCloseZoom(setIsOpenPreview)}
                >
                    <div
                        style={{
                            position: 'relative',
                            textAlign: 'center',
                            zIndex: '1001',
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                    >
                        {imageTipe.includes('image') ? (
                            <img
                                src={imageDataUrl}
                                alt={`Zoomed ${indexPreview}`}
                                style={{
                                    transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                    transition: 'transform 0.1s ease',
                                    cursor: 'pointer',
                                    maxWidth: '100vw',
                                    maxHeight: '100vh',
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                            />
                        ) : imageTipe.includes('video') ? (
                            <video
                                src={imageDataUrl}
                                style={{
                                    transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                    transition: 'transform 0.1s ease',
                                    cursor: 'pointer',
                                    maxWidth: '100vw',
                                    maxHeight: '100vh',
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                                controls
                                width={500}
                                height={500}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                    <div
                        style={{
                            position: 'fixed',
                            top: '10px',
                            right: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            zIndex: '1001',
                        }}
                    >
                        <ButtonComponent
                            id="zoomIn"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-zoom-in" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomIn(setZoomScale)}></span>
                        </ButtonComponent>

                        <ButtonComponent
                            id="zoomOut"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-zoom-out" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomOut(setZoomScale)}></span>
                        </ButtonComponent>

                        <ButtonComponent
                            cssClass="e-primary e-small"
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                marginTop: '-10px',
                            }}
                        >
                            <span className="e-icons e-undo" style={{ fontSize: '32px' }} onClick={handleRotateLeft}></span>
                        </ButtonComponent>
                        <ButtonComponent
                            cssClass="e-primary e-small"
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                marginTop: '-20px',
                            }}
                        >
                            <span className="e-icons e-redo" style={{ fontSize: '32px' }} onClick={handleRotateRight}></span>
                        </ButtonComponent>

                        <ButtonComponent
                            id="close"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-close" style={{ fontSize: '20px', fontWeight: 'bold' }} onClick={() => HandleCloseZoom(setIsOpenPreview)}></span>
                        </ButtonComponent>
                    </div>
                </div>
            )}
        </>
    );
};

export default GridKonsolKBK;
