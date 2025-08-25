import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import axios from 'axios';
import moment from 'moment';
import { useSession } from '@/pages/api/sessionContext';
import { useProgress } from '@/context/ProgressContext';

const formatDateWaktu: Object = { type: 'date', format: 'dd-MM-yyyy' };

const DialogHistory = ({ visible, onClose, gridRef, indexSelect, gridHistory }: { visible: boolean; onClose: Function; gridRef: any; indexSelect: any; gridHistory: any }) => {
    const { sessionData } = useSession();
    const { startProgress, isLoading, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const token = sessionData?.token ?? '';
    const [listHistory, setListHistory] = useState([]);
    const totalFaktur = useRef<any>({});

    useEffect(() => {
        getHistoryBayar(indexSelect);
    }, [indexSelect]);

    const SpreadNumber = (number: any | number | string) => {
        const temp = isNaN(parseFloat(parseFloat(number).toFixed(2))) ? 0 : parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };
    let selectedListData: any = gridRef?.current!.getSelectedRecords();

    const getHistoryBayar = async (index: number) => {
        try {
            console.log('res.data.data index', selectedListData);

            const res: any = await axios.get(`${apiUrl}/erp/history_bayar_konsolidasi_kbk`, {
                params: {
                    entitas: kode_entitas,
                    param1: selectedListData?.[0]?.no_fj,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const mod = res.data.data.map((item: any) => ({
                ...item,
                nilai_dokumen: SpreadNumber(item.nilai_dokumen),
                nilai_pelunasan: SpreadNumber(item.nilai_pelunasan),
                netto_mu: SpreadNumber(item.netto_mu),
                muka: SpreadNumber(item.muka),
                jml_lunas: SpreadNumber(item.jml_lunas),
                sisa: SpreadNumber(item.sisa),
            }));
            console.log('mod', mod);

            const total = mod.reduce(
                (acc: any, item: any) => {
                    return {
                        nilai_dokumen: acc.nilai_dokumen + item.nilai_dokumen,
                        nilai_pelunasan: acc.nilai_pelunasan + item.nilai_pelunasan,
                        netto_mu: acc.netto_mu + item.netto_mu,
                        muka: acc.muka + item.muka,
                        jml_lunas: acc.jml_lunas + item.jml_lunas,
                        sisa: acc.sisa + item.sisa,
                        jml_warkat: acc.jml_warkat + item.jml_warkat,
                        jml_tolak: acc.jml_tolak + item.jml_tolak,
                    };
                },
                { nilai_dokumen: 0, nilai_pelunasan: 0, netto_mu: 0, muka: 0, jml_lunas: 0, sisa: 0, jml_warkat: 0, jml_tolak: 0 }
            );

            totalFaktur.current = total;

            console.log('res.data.data', totalFaktur);
            setListHistory(mod);
        } catch (error) {
            console.log(error);
        }
    };

    const formatNumber = (number: number) => {
        const absNumber = Math.abs(number);
        const formattedNumber = absNumber.toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return number < 0 ? `(${formattedNumber})` : formattedNumber;
    };
    return (
        <DialogComponent
            id="dialogSerahkan"
            isModal={false}
            width="60%"
            height={350}
            visible={visible}
            close={() => onClose()}
            header={'History Bayar'}
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
            style={{ position: 'fixed' }}
        >
            <div className="flex h-full w-full flex-col">
                <GridComponent
                    id="GridKonsolKBKData"
                    locale="id"
                    dataSource={listHistory}
                    height={'120px'}
                    gridLines="Both"
                    allowResizing={true}
                    allowSorting={true}
                    ref={gridHistory}
                    rowHeight={23}
                    autoFit={true}
                    enableHover={false}
                    // created={created}
                    // load={load}
                    // actionBegin={actionCompleteHandle}
                >
                    <ColumnsDirective>
                        <ColumnDirective allowEditing={false} field="no_dokumen" headerText="No. Dokumen" headerTextAlign="Left" textAlign="Left" width="115" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective
                            allowEditing={false}
                            field="tgl_dokumen"
                            type="date"
                            format={formatDateWaktu}
                            headerText="Tanggal"
                            headerTextAlign="Center"
                            textAlign="Center"
                            width="80"
                            clipMode="EllipsisWithTooltip"
                        />
                        <ColumnDirective allowEditing={false} field="no_warkat" headerText="No. Warkat" headerTextAlign="Left" textAlign="Left" width="115" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective
                            allowEditing={false}
                            field="tgl_tempo"
                            type="date"
                            format={formatDateWaktu}
                            headerText="Tgl. Valuta"
                            headerTextAlign="Center"
                            textAlign="Center"
                            width="80"
                            clipMode="EllipsisWithTooltip"
                        />
                        <ColumnDirective
                            allowEditing={false}
                            field="tgl_real"
                            type="date"
                            format={formatDateWaktu}
                            headerText="Tgl. Cair/Tolak"
                            headerTextAlign="Center"
                            textAlign="Center"
                            width="80"
                            clipMode="EllipsisWithTooltip"
                        />
                        <ColumnDirective allowEditing={false} field="st" headerText="Status" headerTextAlign="Center" textAlign="Center" width="80" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective
                            allowEditing={false}
                            field="nilai_dokumen"
                            headerText="Jumlah"
                            headerTextAlign="Center"
                            format={'N2'}
                            textAlign="Right"
                            width="115"
                            clipMode="EllipsisWithTooltip"
                        />
                        <ColumnDirective
                            allowEditing={false}
                            field="nilai_pelunasan"
                            headerText="Pelunasan"
                            headerTextAlign="Center"
                            format={'N2'}
                            textAlign="Right"
                            width="115"
                            clipMode="EllipsisWithTooltip"
                        />
                        <ColumnDirective
                            allowEditing={false}
                            field="nama_sales"
                            headerText="Salesman/Kolektor"
                            headerTextAlign="Center"
                            textAlign="Center"
                            width="115"
                            clipMode="EllipsisWithTooltip"
                        />
                    </ColumnsDirective>
                </GridComponent>
                <div className="flex w-full flex-grow p-2">
                    <div className="flex w-[50%] flex-col">
                        <table>
                            <tr>
                                <td className="pl-5">Sumary</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Nama Customer</td>
                                <td> : </td>
                                <td>{selectedListData?.[0]?.pabrik}</td>
                            </tr>
                            <tr>
                                <td>No. Faktur</td>
                                <td> : </td>
                                <td>{selectedListData?.[0]?.no_fj}</td>
                            </tr>
                            <tr>
                                <td>Tanggal</td>
                                <td> : </td>
                                <td>{selectedListData?.[0]?.tgl_fj}</td>
                            </tr>
                            <tr>
                                <td>Jatuh Tempo</td>
                                <td> : </td>
                                <td>{selectedListData?.[0]?.jatuh_tempo}</td>
                            </tr>
                        </table>
                    </div>
                    <div className="flex flex-grow flex-col">
                        <table>
                            <tr>
                                <td>Nilai Faktur</td>
                                <td> : </td>
                                <td className="text-right">{formatNumber(totalFaktur?.current.netto_mu)}</td>
                            </tr>
                            <tr>
                                <td>Frekuensi pembayaran</td>
                                <td> : </td>
                                <td className="text-right">{listHistory.length}</td>
                            </tr>
                            <tr>
                                <td>Pembayaran Dengan Warkat</td>
                                <td> : </td>
                                <td className="text-right">{formatNumber(totalFaktur?.current.jml_warkat)}</td>
                            </tr>
                            <tr>
                                <td>UM, MK, dan MPP</td>
                                <td> : </td>
                                <td className="text-right"></td>
                            </tr>
                            <tr>
                                <td>Jumlah Nilai Pembayaran</td>
                                <td> : </td>
                                <td className="text-right">{formatNumber(totalFaktur?.current.jml_lunas)}</td>
                            </tr>
                            <tr>
                                <td>Sisa Yang Harus Dibayar</td>
                                <td> : </td>
                                <td className="text-right">{totalFaktur?.current.sisa}</td>
                            </tr>
                            <tr>
                                <td className="text-blue-500">Status</td>
                                <td> : </td>
                                <td className="text-right">{totalFaktur?.current.netto_mu == totalFaktur?.current.jml_lunas ? 'Lunas' : 'Belum Lunas'}</td>
                            </tr>
                            <tr>
                                <td className="text-red-500">Ditolak</td>
                                <td> : </td>
                                <td className="text-right">{totalFaktur?.current.jml_tolak}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </DialogComponent>
    );
};

export default DialogHistory;
