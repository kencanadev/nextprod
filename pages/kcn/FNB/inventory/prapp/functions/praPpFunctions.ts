import { Grid } from '@syncfusion/ej2-react-grids';
import { frmNumber, generateNU, myAlertGlobal2, myAlertGlobal3 } from '@/utils/routines';
import moment from 'moment';
import axios from 'axios';
import { handleRefreshPraPpAppList, handleRefreshPraPpList, handleRefreshTolakList } from '../handlers/praPpListRefreshHandlers';
import { Console } from 'console';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

interface PraPpHandlers {
    setDate1PraPpAppList: (date: moment.Moment) => void;
    setDate2PraPpAppList: (date: moment.Moment) => void;
    setIsTanggalPraPpListAppChecked: (value: boolean) => void;
    setNamaBarangPraPpAppList: (value: string) => void;
    setIsNamaBarangPraPpAppChecked: (value: boolean) => void;
    setNoPraPpAppList: (value: string) => void;
    setIsNoPraPpListAppChecked: (value: boolean) => void;
    setIsLoadingPraPpAppList: (value: boolean) => void;
    setProgressValue: (value: number) => void;
}

// Date handling functions
export const handleTglApp = (date: any, tipe: string, handlers: Pick<PraPpHandlers, 'setDate1PraPpAppList' | 'setDate2PraPpAppList' | 'setIsTanggalPraPpListAppChecked'>) => {
    if (tipe === 'tanggalAwal') {
        handlers.setDate1PraPpAppList(date);
    } else {
        handlers.setDate2PraPpAppList(date);
    }
    handlers.setIsTanggalPraPpListAppChecked(true);
};

// Input handling functions
export const handleNamaBarangPraPpInputChangeApp = (value: string, handlers: Pick<PraPpHandlers, 'setNamaBarangPraPpAppList' | 'setIsNamaBarangPraPpAppChecked'>) => {
    handlers.setNamaBarangPraPpAppList(value);
    handlers.setIsNamaBarangPraPpAppChecked(value.length > 0);
};

export const handleNoInputChangeApp = (value: string, handlers: Pick<PraPpHandlers, 'setNoPraPpAppList' | 'setIsNoPraPpListAppChecked'>) => {
    handlers.setNoPraPpAppList(value);
    handlers.setIsNoPraPpListAppChecked(value.length > 0);
};

// Grid data handling functions
export const handleCheckboxChangePraPpList = (event: any, uniqId: string, grid: Grid) => {
    const updatedData = (grid.dataSource as any[]).map((item: any) => (item.uniqId === uniqId ? { ...item, pilih: event.target.checked ? 'Y' : 'N' } : item));
    grid.dataSource = updatedData;
};

// Data transfer functions
export const handleOrderKePraPP = (sourceGrid: Grid, targetGrid: Grid) => {
    const hasSelectedItems = (sourceGrid.dataSource as any[]).some((item: any) => item.pilih === 'Y');

    if (!hasSelectedItems) {
        myAlertGlobal2('Silakan pilih item yang akan ditransfer ke Pra PP', 'frmPraPp');
        return;
    }

    const selectedDataChecked = (sourceGrid.dataSource as any[]).filter((item: any) => item.pilih === 'Y' && item.tolak === 'N');

    if (selectedDataChecked.length === 0) {
        myAlertGlobal2('Tidak ada item yang dapat ditransfer ke Pra PP (semua item yang dipilih ditolak)', 'frmPraPp');
        return;
    }

    try {
        const updateDataSumber = (sourceGrid.dataSource as any[]).filter((item: any) => item.tolak === 'Y' || item.pilih === 'N');

        sourceGrid.dataSource = updateDataSumber;
        sourceGrid.refresh();

        const existingPraPpData = targetGrid.dataSource || [];
        const newPraPpData = Array.isArray(existingPraPpData) ? [...existingPraPpData, ...selectedDataChecked] : selectedDataChecked;

        targetGrid.dataSource = newPraPpData;
        targetGrid.refresh();
    } catch (error) {
        console.error('Error transferring data:', error);
        myAlertGlobal2('Terjadi kesalahan saat memindahkan data', 'frmPraPp');
    }
};

export const handleRefreshList = async (type: 'praPpList' | 'praPpAppList' | 'tolakList', grid: any, apiUrl: any, token: any, filters: any, setIsLoading: any, setProgressValue: any) => {
    const currentGrid = grid;
    // console.log('tabs[selectedIndex].dataGri', tabs[selectedIndex].dataGrid);
    // console.log('currentGrid', currentGrid);
    // console.log('tabs[selectedIndex]', tabs[selectedIndex]);

    const handlers = {
        praPpList: {
            handler: handleRefreshPraPpList,
            setLoading: setIsLoading,
        },
        praPpAppList: {
            handler: handleRefreshPraPpAppList,
            setLoading: setIsLoading,
        },
        tolakList: {
            handler: handleRefreshTolakList,
            setLoading: setIsLoading,
        },
    };
    const { handler, setLoading } = handlers[type];
    //     const { handler, setLoading } = handlers[type];
    handler({
        currentGrid,
        apiUrl,
        token,
        filters,
        setIsLoading: setLoading,
        setProgressValue,
    });
};

export const HandleRowSelected = (args: any, setSelectedRow: Function) => {
    // setSelectedRow(args.data?.kode_prapp);
    setSelectedRow(args.data);

    // console.log('args.data', args.data);
};

const DataDetailDok = async (kodeDok: any, idDok: any, kode_entitas: any, token: any, jenisDetail: any): Promise<any[]> => {
    // console.log('kkkkkk', kodeDok, idDok, kode_entitas);
    let listDetailDok: any;
    // console.log('jenisDetail', jenisDetail);
    if (jenisDetail === 'detail pra pp') {
        const response = await axios.get(`${apiUrl}/erp/detail_dok_prapp?`, {
            params: {
                entitas: kode_entitas,
                param1: kodeDok,
                param2: idDok,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        listDetailDok = response.data.data;
        // console.log('listDetailDok', listDetailDok);
    } else if (jenisDetail === 'detail approved') {
        const response = await axios.get(`${apiUrl}/erp/detail_prapp_app?`, {
            params: {
                entitas: kode_entitas,
                param1: kodeDok,
                param2: idDok,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        listDetailDok = response.data.data;
    }

    // console.log('detail_dok_prapp', response);
    // const listDetailDok = response.data.data;

    return listDetailDok;
};

const ListDetailDok = async (kodeDok: any, idDok: any, kode_entitas: any, setDetailDok: Function, token: any, jenisDetail: any) => {
    try {
        const result: any[] = await DataDetailDok(kodeDok, idDok, kode_entitas, token, jenisDetail);

        const modifiedDetailDok: any = result.map((item: any) => ({
            ...item,
            tgl_preorder: moment(item.tgl_preorder).format('MM-DD-YYYY'),
            berat_ost: item.berat_ost ? item.berat_ost : 0,
            // potongan_mu: parseFloat(item.potongan_mu),
            // jumlah_mu: parseFloat(item.jumlah_mu),
        }));
        setDetailDok(modifiedDetailDok);
    } catch (error) {
        console.error('Error:', error);
    }
};

export const RowSelectingListData = (args: any, setDataDetailDok: Function, kode_entitas: string, setDetailDok: Function, token: any, jenisDetail: any) => {
    // console.log('ffff', args.data);
    ListDetailDok(args.data?.kode_prapp, args.data?.id_prapp, kode_entitas, setDetailDok, token, jenisDetail);
    setDataDetailDok((prevState: any) => ({
        ...prevState,
        no_prapp: args.data?.no_prapp,
        tgl_prapp: args.data?.tgl_prapp,
    }));
    setDetailDok((prevState: any) => ({
        ...prevState,
        no_prapp: args.data?.no_prapp,
        tgl_prapp: args.data?.tgl_prapp,
    }));
};

const ButtonDetailDok = (kodeDok: any) => {
    return kodeDok;
};

export const setDetailPraPp = async (
    tipe: string,
    setSelectedRow: string,
    kode_entitas: string,
    dataDetailDokMk: any,
    router: any,
    setSelectedItem: Function,
    setDetailDok: Function,
    token: any,
    jenisDetail: any
) => {
    // console.log('setSelectedRow', setSelectedRow);
    // console.log('setSelectedItem', setSelectedItem);

    // console.log('setDetailDok', setDetailDok);

    if (setSelectedRow !== '') {
        if (tipe === 'detailDok') {
            const result = ButtonDetailDok(setSelectedRow);
            setSelectedItem(result);
            ListDetailDok(result.kode_prapp, result.id_prapp, kode_entitas, setDetailDok, token, jenisDetail);
        }
    } else {
        myAlertGlobal2('Silahkan pilih data', 'frmPraPp');
    }
};

export const cancelOutstanding = async (currentGrid: any, setSelectedRow: any, token: any, entitasLogin: any, userId: any, filters: any, setIsLoadingPraPpList: any, setProgressValue: any) => {
    // console.log('setSelectedRow', setSelectedRow.no_prapp);
    if (setSelectedRow !== '') {
        let responseAPI: any;
        const confirmationMessage = `
            Batalkan Outstanding
            No. Pra PP: ${setSelectedRow.no_prapp} - ${setSelectedRow.tgl_prapp}
            Barang: ${setSelectedRow.no_item} - ${setSelectedRow.diskripsi}
            Berat Order: ${formatFloat(setSelectedRow.berat_order)}
            Berat FDO: ${formatFloat(setSelectedRow.berat_fdo)}
        `;
        const confirmed = await myAlertGlobal3(`${confirmationMessage}`, 'frmPraPp');
        // console.log('confirmed', confirmed);
        if (confirmed) {
            // console.log('sukses');
            try {
                const reqBody = {
                    entitas: entitasLogin,
                    kode_prapp: setSelectedRow.kode_prapp,
                    id_prapp: setSelectedRow.id_prapp,
                    omit: 'Y',
                };

                await axios
                    .post(`${apiUrl}/erp/batal_otd_fdo`, reqBody, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    .then((result) => {
                        responseAPI = result.data;
                        setProgressValue(50);
                        // console.log('progressValue 50', progressValue);
                        // console.log('displayedProgress 50', displayedProgress);
                    })
                    .catch((e: any) => {
                        responseAPI = e.response.data;
                    });

                if (responseAPI.status === true) {
                    // handleRefreshPraPpList;
                    await handleRefreshList('praPpAppList', currentGrid, apiUrl, token, filters, setIsLoadingPraPpList, setProgressValue).then(async (_) => {
                        setTimeout(async () => {
                            await myAlertGlobal2('Data berhasil dibatalkan', 'frmPraPp');
                        }, 2000);
                    });
                } else {
                    myAlertGlobal2(
                        `DATA GAGAL BATAL APPROVED !
                    Response ${responseAPI.error}
                    Response Message : ${responseAPI.message}`,
                        'frmPraPp'
                    );
                }
            } catch (error) {
                console.error('Error updating Pra PP:', error);
                myAlertGlobal2('Terjadi kesalahan saat memperbarui data', 'frmPraPp');
            }
        }
    } else {
        myAlertGlobal2('Silahkan pilih data untuk pembatalan', 'frmPraPp');
    }
};

export const exportSplitPrapp = async (dataDetail: any, entitasLogin: any, userIdLogin: any, noDokMaster: any, token: any) => {
    // console.log('data', dataDetail);
    const progress = { max: 0, position: 0 }; // Replace with actual progress handling

    let sNoPraPP: string;
    let responseAPI: any;

    const filteredItems = dataDetail.filter((item: any) => item.berat_split > 0);
    // console.log('filteredItems', filteredItems);
    sNoPraPP = await generateNU(entitasLogin, '', '89', moment().format('YYYYMM'));
    // console.log('sNoPraPP', sNoPraPP);
    if (filteredItems.length > 0) {
        try {
            const reqBody = {
                entitas: 698,
                userid: userIdLogin,
                newNoDok: sNoPraPP,
                no_dokumen: noDokMaster, // Assuming no_dokumen is the same for all items
                data: filteredItems.map((item: any) => ({
                    kode_prapp: item.kode_prapp,
                    id_prapp: item.id_prapp,
                    entitas: item.entitas,
                    kode_preorder: item.kode_preorder,
                    id_preorder: item.id_preorder,
                    kode_item: item.kode_item,
                    berat_order: item.berat_order,
                    berat_sisa: item.berat_sisa,
                    berat_acc: item.berat_acc,
                    export: item.export,
                    catatan: item.catatan,
                    berat: item.berat,
                    qty_fdo: item.qty_fdo,
                    no_item: item.no_item,
                    nama_item: item.nama_item,
                    tgl_preorder: item.tgl_preorder,
                    berat_split: item.berat_split,
                    nama_bulan: item.nama_bulan,
                    no_prapp: item.no_prapp,
                    berat_fdo: item.berat_fdo,
                    berat_ost: item.berat_ost,
                })),
            };

            // console.log('Split PraPp', reqBody);

            await axios
                .post(`${apiUrl}/erp/split_detail_prapp_app`, reqBody, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((result) => {
                    responseAPI = result.data;
                    //  setProgressValue(50);
                    // console.log('progressValue 50', progressValue);
                    // console.log('displayedProgress 50', displayedProgress);
                })
                .catch((e: any) => {
                    responseAPI = e.response.data;
                });

            if (responseAPI.status === true) {
                myAlertGlobal2(`Data berhasil di split`, 'frmPraPp');
                await generateNU(entitasLogin, sNoPraPP, '89', moment().format('YYYYMM'));
                return true;
            } else {
                myAlertGlobal2(`Gagal split ${responseAPI.error}`, 'frmPraPp');
                return false;
            }
        } catch (error) {
            // Rollback transaction in case of error
            // await axios.post(`${data.apiUrl}/transaction/rollback`);
            console.error('Data Pra PP Gagal di Split !', error, 'responseAPI.serverMessage ', responseAPI.error);
            return false;
        }
    }
    return false;
};

export const handleSplitClick = async (selectedRow: any, detailDok: any, entitasLogin: any, userIdLogin: any, noDokMaster: any, token: any) => {
    const confirmSplit = await myAlertGlobal3('Apakah data akan di Split ?', 'frmPraPp');

    if (confirmSplit) {
        let sada = 0;

        for (let i = 0; i < detailDok.length; i++) {
            if (detailDok[i].berat_split > 0) {
                sada = 1;
                break; // Exit loop if condition is met
            }
        }

        if (sada === 0) {
            alert('Berat Split harus diisi');
            return;
        }

        // Split
        const result = await exportSplitPrapp(detailDok, entitasLogin, userIdLogin, noDokMaster, token); // Assuming this is an async function
        return result;
        // Close the modal or navigate away
        // close(); // Implement your close logic here
    }
    return false;
};

function formatFloat(value: number): string {
    return value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
// // ... existing code ...
