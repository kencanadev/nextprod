import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import axios from 'axios';
// import { HandleSearchAkunDebet } from './function/function';
import moment from 'moment';
import { useSession } from '@/pages/api/sessionContext';
import Swal from 'sweetalert2';
import { HandleSearchNamaAkun, HandleSearchNoAkun } from '../function/function';

const handleRowDataBound = (args: any) => {
    const rowData = args.data as any; // Cast data sebagai any atau tipe yang tepat

    // Contoh kondisi: jika nilai kolom "status" adalah "Pending"
    if (rowData.header === 'Y') {
        // console.log('style', args.row.style);
        args.row.style.fontWeight = 'bold'; // Warna merah muda
    } else {
        args.row.style.textIndent = '5px';
    }
};

export default function AkunDebetDialog({
    apiUrl,
    kode_entitas,
    visible,
    onClose,
    token,
    setHeaderDialogState,
    selectedRowIndexRekeningbarang,
    listAKun,
}: {
    apiUrl: string;
    kode_entitas: string;
    visible: boolean;
    onClose: Function;
    token: string;
    setHeaderDialogState: any;
    selectedRowIndexRekeningbarang: any;
    listAKun: any;
}) {
    const header = 'List Akun Debet';
    const { sessionData } = useSession();
    const userid = sessionData?.userid ?? '';
    const gridAkunDebet = useRef<any>(null);
    const [dialogListAkunDebet, setDialogListAkunDebet] = useState(listAKun);
    const [headerState, setHeaderState] = useState({
        no_akun: '',
        nama_akun: '',
    });
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [searchAkunDebet, setSearchAkunDebet] = useState('');
    const [originalDataSource, setOriginalDataSource] = useState(listAKun);

    useEffect(() => {
        const dialogElement = document.getElementById('dialogListAkunDebet');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);
    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }
    const handleSelect = (args: any) => {
        setSelectedRow(args.data);
    };
    const hanldeRecordDoubleClick = async (args: any) => {
        try {
            console.log('setHeaderDialogState.current.dataSource[selectedRowIndexRekeningbarang]', setHeaderDialogState.current.dataSource[selectedRowIndexRekeningbarang]);

            const temp = setHeaderDialogState.current.dataSource[selectedRowIndexRekeningbarang];

            setHeaderDialogState.current.dataSource[selectedRowIndexRekeningbarang] = {
                ...setHeaderDialogState.current.dataSource[selectedRowIndexRekeningbarang],
                no_akun: selectedRow.no_akun,
                nama_akun: selectedRow.nama_akun,
                kode_akun: selectedRow.kode_akun,
            };
            setHeaderDialogState.current.refresh();
            const dataKirim = {
                entitas: kode_entitas,
                tgl_setorgiro: moment(args.value).format('YYYY-MM-DD'),
                kode_akun_debet: selectedRow.kode_akun,
                kode_dokumen: temp.kode_dokumen,
            };
            const response: any = await axios.patch(`${apiUrl}/erp/update_warkat_dashboard_ar?`, dataKirim, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.status === true) {
                onClose();
                return Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    target: '#main-target',
                    timer: 1500,
                    text: `Simpan Data Berhasil`,
                });
            }
        } catch (error: any) {
            return Swal.fire({
                icon: 'error',
                title: 'Gagal',
                target: '#main-target',
                timer: 1500,
                text: `${error?.response?.data?.message} 
                (${error?.response?.data?.error})`,
            });
        }
    };
    return (
        <DialogComponent
            id="dialogListAkunDebet"
            isModal={true}
            width="400px"
            height={400}
            visible={visible}
            close={() => onClose()}
            header={header}
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
            style={{ position: 'fixed' }}
        >
            <div className="flex h-full w-full flex-col gap-1">
                <div className="grid h-[70%] w-full grid-cols-2 flex-col justify-items-start gap-2 ">
                    <input
                        type="text"
                        id="number-input"
                        className={`w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 `}
                        placeholder={formatString('search_no_akun')}
                        name="no_akun"
                        value={headerState.no_akun} // Format hanya saat blur
                        onChange={(e) => {
                            HandleSearchNoAkun(e.target.value, setHeaderState, setDialogListAkunDebet, originalDataSource);
                        }}
                        autoComplete="off"
                    />
                    <input
                        type="text"
                        id="number-input"
                        className={`w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 `}
                        placeholder={formatString('search_nama_akun')}
                        name="nama_akun"
                        value={headerState.nama_akun}
                        onChange={(e) => {
                            HandleSearchNamaAkun(e.target.value, setHeaderState, setDialogListAkunDebet, originalDataSource);
                        }}
                        autoComplete="off"
                    />
                </div>
                <GridComponent
                    id="gridAkun"
                    rowDataBound={handleRowDataBound}
                    name="gridAkun"
                    className="gridAkun"
                    locale="id"
                    dataSource={dialogListAkunDebet}
                    rowSelecting={handleSelect}
                    recordDoubleClick={hanldeRecordDoubleClick}
                    ref={gridAkunDebet}
                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                    rowHeight={22}
                    gridLines={'Both'}
                    height={'240'} // Tinggi grid dalam piksel /
                >
                    <ColumnsDirective>
                        <ColumnDirective field="no_akun" headerText="Nomor Akun" headerTextAlign="Center" textAlign="Left" width={80} />
                        <ColumnDirective field="nama_akun" headerText="Nama Akun" headerTextAlign="Center" textAlign="Left" width={80} />
                    </ColumnsDirective>

                    <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
                </GridComponent>
                <div className="flex h-[30%] w-full justify-end gap-3 py-2">
                    <button
                        onClick={hanldeRecordDoubleClick}
                        className={` flex cursor-pointer items-center rounded-md bg-[#3a3f5c]
                        p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#787a87] `}
                    >
                        OK
                    </button>

                    <button
                        onClick={() => onClose()}
                        className={`} flex cursor-pointer items-center rounded-md bg-[#3a3f5c]
                        p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#787a87] `}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
}
