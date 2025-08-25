import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import axios from 'axios';
import moment from 'moment';
import { useSession } from '@/pages/api/sessionContext';
import { useProgress } from '@/context/ProgressContext';

export default function DIalogSerhakan({ visible, onClose, gridRef, indexSelect }: { visible: boolean; onClose: Function; gridRef: any; indexSelect: any }) {
    const header = 'Serahkan DEPT. Pembelian';
    const { sessionData } = useSession();
    const { startProgress, isLoading, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const userid = sessionData?.userid ?? '';
    const token = sessionData?.token ?? '';

    useEffect(() => {
        const dialogElement = document.getElementById('dialogSerahkan');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);
    const simpanHandle = async () => {
        let selectedListData: any = gridRef.current!.dataSource[indexSelect];
        const no_rba_val = (document.getElementById('no_rba_id') as HTMLInputElement)?.value;
        if (selectedListData.no_ba !== no_rba_val) {
            return alert('No BA Tidak Sama!');
        }
        gridRef.current!.dataSource[indexSelect] = {
            ...gridRef.current!.dataSource[indexSelect],
            pu_serah: 'Y',
            pu_tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
            pu_userid: userid.toLocaleUpperCase(),
        };

        selectedListData = gridRef.current!.dataSource[indexSelect];

        let dataPersiapan: any;
        if (selectedListData.tipe === 'FBM') {
            startProgress();
            setLoadingMessage('Menyimpan Data...');
            console.log('tipe data fbm');
            const jsonTemp = {
                method: 'GET',
                entitas: selectedListData.entitas_master,
                kode_ba: selectedListData.kode_ba,
                tipe: 'FBM',
            };
            const res = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, jsonTemp, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dataPersiapan = res.data.data[0];
            console.log('res', res);
            const kirimFBM = {
                entitas: dataPersiapan.entitas_master,
                method: 'POST',
                kode_ba: dataPersiapan.kode_ba,
                no_ba: dataPersiapan.no_ba,
                entitas_master: dataPersiapan.entitas_master,
                tgl_ba_dikirim: moment(selectedListData.tgl_ba_dikirim).isValid() ? moment(selectedListData.tgl_ba_dikirim).format('YYYY-MM-DD HH:mm:ss') : null,
                pu_serah: selectedListData.pu_serah,
                pu_tanggal: moment(selectedListData.pu_tanggal).isValid() ? moment(selectedListData.pu_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                pu_userid: selectedListData.pu_userid,
                pu_keterangan: selectedListData.pu_keterangan,
                ku_terima: selectedListData.ku_terima,
                ku_tanggal: moment(selectedListData.ku_tanggal).isValid() ? moment(selectedListData.ku_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                ku_userid: selectedListData.ku_userid,
                ku_keterangan: selectedListData.ku_keterangan,
                komplit: dataPersiapan.komplit,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: selectedListData.userid,
                ku_ket_tanggal: moment(selectedListData.ku_ket_tanggal).isValid() ? moment(selectedListData.ku_ket_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                ku_ket_userid: selectedListData.ku_ket_userid,
                pu_ket_tanggal: moment(selectedListData.pu_ket_tanggal).isValid() ? moment(selectedListData.pu_ket_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                pu_ket_userid: selectedListData.pu_ket_userid,
                tipe: selectedListData.tipe,
                no_fj: selectedListData.no_fj,
                tgl_fbm: moment(selectedListData.tgl_fbm).isValid() ? moment(selectedListData.tgl_fbm).format('YYYY-MM-DD HH:mm:ss') : null,
                tgl_rba: moment(selectedListData.tgl_rba).isValid() ? moment(selectedListData.tgl_rba).format('YYYY-MM-DD HH:mm:ss') : null,
            };
            console.log('kirimFBM', kirimFBM);
            const resKirim = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, kirimFBM, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (resKirim) {
                endProgress();
                setLoadingMessage('Berhasil Simpan Data...');
                console.log(resKirim);
            }
        } else if (selectedListData.tipe === 'Faktur') {
            const jsonTemp = {
                method: 'GET',
                entitas: selectedListData.entitas_master,
                no_fj: selectedListData.no_fj,
            };
            const res = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, jsonTemp, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dataPersiapan = res.data.data[0];
            console.log('dataPersiapan', dataPersiapan);

            const kirim = {
                entitas: dataPersiapan.entitas_master,
                method: 'POST',
                kode_ba: dataPersiapan.kode_fbm == '' || dataPersiapan.kode_fbm == null ? dataPersiapan.no_fj : dataPersiapan.kode_fbm,
                kode_fbm: dataPersiapan.kode_fbm,
                no_ba: dataPersiapan.no_ba == '' || dataPersiapan.no_ba == null ? dataPersiapan.no_fj : dataPersiapan.no_ba,
                entitas_master: dataPersiapan.entitas_master,
                tgl_ba_dikirim: moment(dataPersiapan.tgl_ba_dikirim).isValid() ? moment(dataPersiapan.tgl_ba_dikirim).format('YYYY-MM-DD HH:mm:ss') : null,
                pu_serah: dataPersiapan.pu_serah,
                pu_tanggal: moment(dataPersiapan.pu_tanggal).isValid() ? moment(dataPersiapan.pu_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                pu_userid: dataPersiapan.pu_userid,
                pu_keterangan: dataPersiapan.pu_keterangan,
                ku_terima: dataPersiapan.ku_terima,
                ku_tanggal: moment(dataPersiapan.ku_tanggal).isValid() ? moment(dataPersiapan.ku_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                ku_userid: dataPersiapan.ku_userid,
                ku_keterangan: dataPersiapan.ku_keterangan,
                komplit: dataPersiapan.komplit,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                ku_ket_tanggal: moment(dataPersiapan.ku_ket_tanggal).isValid() ? moment(dataPersiapan.ku_ket_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                ku_ket_userid: dataPersiapan.ku_ket_userid,
                pu_ket_tanggal: moment(dataPersiapan.pu_ket_tanggal).isValid() ? moment(dataPersiapan.pu_ket_tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
                pu_ket_userid: dataPersiapan.pu_ket_userid,
                tipe: dataPersiapan.tipe,
                no_fj: dataPersiapan.no_fj,
                tgl_fbm: moment(dataPersiapan.tgl_fbm).isValid() ? moment(dataPersiapan.tgl_fbm).format('YYYY-MM-DD HH:mm:ss') : null,
                tgl_rba: moment(dataPersiapan.tgl_rba).isValid() ? moment(dataPersiapan.tgl_rba).format('YYYY-MM-DD HH:mm:ss') : null,
                no_rba: dataPersiapan.no_ba,
            };

            const resKirim = await axios.post(`${apiUrl}/erp/update_klaim_barang_kurang_konsolidasi`, kirim, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (resKirim) {
                endProgress();
                setLoadingMessage('Berhasil Simpan Data...');
            }

            endProgress();
            setLoadingMessage('');
        }
        setTimeout(() => {
            onClose();
            gridRef.current!.refresh();
        }, 200);
    };
    return (
        <DialogComponent
            id="dialogSerahkan"
            isModal={true}
            width="20%"
            height={250}
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
            <div className="flex h-full w-full flex-col justify-between">
                <div className="flex h-[150] w-full flex-col">
                    <p>Serah terima berita acara</p>
                    <div className="mb-1 flex w-full flex-col items-start">
                        <input
                            type="text"
                            id="no_rba_id"
                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all placeholder:text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder={'Nomor Berita Acara'}
                            name="no_rba_id"
                            // value={filterState.no_bok}
                            // onChange={(e) => handleInputChange(setFilterState, setCheckboxState, e)}
                            // style={{ height: '4vh' }}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="flex h-[50] w-full justify-end gap-2">
                    <button className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={simpanHandle}>
                        Simpan
                    </button>
                    <button className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={() => onClose()}>
                        Tutup
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
}
