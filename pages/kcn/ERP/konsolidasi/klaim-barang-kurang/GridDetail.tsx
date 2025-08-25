import React, { useEffect, useState } from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { useSession } from '@/pages/api/sessionContext';
import { useProgress } from '@/context/ProgressContext';
import axios from 'axios';

const GridDetail = ({ gridRef, indexSelect }: { gridRef: any; indexSelect: any }) => {
    const { sessionData } = useSession();
    const { startProgress, isLoading, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const token = sessionData?.token ?? '';
    let selectedListData: any = gridRef?.current!.getSelectedRecords();

    const [listDetail, setListDetail] = useState([]);

    const SpreadNumber = (number: any | number | string) => {
        const temp = isNaN(parseFloat(parseFloat(number).toFixed(2))) ? 0 : parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };

    const getDetailKBK = async () => {
        console.log(selectedListData);

        const res: any = await axios.get(`${apiUrl}/erp/detail_klaim_barang_kurang_konsolidasi`, {
            params: {
                entitas: selectedListData?.[0]?.entitas_master,
                param1: selectedListData?.[0]?.tipe === 'FBM' ? selectedListData?.[0]?.kode_ba : selectedListData?.[0]?.no_fj,
                param2: selectedListData?.[0]?.tipe,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const mod = res.data.data.map((item: any) => ({
            ...item,
            qty: SpreadNumber(item.qty),
            qty_std: SpreadNumber(item.qty_std),
            harga_rp: SpreadNumber(item.harga_rp),
            hpp: SpreadNumber(item.hpp),
            jumlah_rp: SpreadNumber(item.jumlah_rp),
            berat: SpreadNumber(item.berat),
            qty_sj: SpreadNumber(item.qty_sj),
            qty_kurang: SpreadNumber(item.qty_kurang),
            qty_patah: SpreadNumber(item.qty_patah),
            qty_utuh: SpreadNumber(item.qty_utuh),
            qty_pabrik_split: SpreadNumber(item.qty_pabrik_split),
            qty_pabrik_hois: SpreadNumber(item.qty_pabrik_hois),
            qty_pabrik_real: SpreadNumber(item.qty_pabrik_real),
            qty_ekspedisi_split: SpreadNumber(item.qty_ekspedisi_split),
            berat_ekspedisi: SpreadNumber(item.berat_ekspedisi),
            berat_pabrik: SpreadNumber(item.berat_pabrik),
            jumlah_klaim_ekspedisi: SpreadNumber(item.jumlah_klaim_ekspedisi),
            jumlah_klaim_pabrik: SpreadNumber(item.jumlah_klaim_pabrik),
            brt: SpreadNumber(item.brt),
            qty_old: SpreadNumber(item.qty_old),
        }));
        console.log('mod', res.data.data);

        setListDetail(mod);
        // const total = mod.reduce(
        //     (acc: any, item: any) => {
        //         return {
        //             nilai_dokumen: acc.nilai_dokumen + item.nilai_dokumen,
        //             nilai_pelunasan: acc.nilai_pelunasan + item.nilai_pelunasan,
        //             netto_mu: acc.netto_mu + item.netto_mu,
        //             muka: acc.muka + item.muka,
        //             jml_lunas: acc.jml_lunas + item.jml_lunas,
        //             sisa: acc.sisa + item.sisa,
        //             jml_warkat: acc.jml_warkat + item.jml_warkat,
        //             jml_tolak: acc.jml_tolak + item.jml_tolak,
        //         };
        //     },
        //     { nilai_dokumen: 0, nilai_pelunasan: 0, netto_mu: 0, muka: 0, jml_lunas: 0, sisa: 0, jml_warkat: 0, jml_tolak: 0 }
        // );

        // totalFaktur.current = total;

        // console.log('res.data.data', totalFaktur);
        // setListHistory(mod);
    };
    useEffect(() => {
        getDetailKBK();
    }, [indexSelect]);
    return (
        <GridComponent
            id="gridDetail"
            locale="id"
            height={'120px'}
            gridLines="Both"
            dataSource={listDetail}
            allowResizing={true}
            allowSorting={true}
            rowHeight={23}
            autoFit={true}
            enableHover={false}
            // created={created}
            // load={load}
            // actionBegin={actionCompleteHandle}
        >
            <ColumnsDirective>
                <ColumnDirective allowEditing={false} field="no_item" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" width="115" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    allowEditing={false}
                    field={selectedListData?.[0]?.tipe === 'FBM' ? 'nama_item' : 'nama_barang'}
                    headerText="Nama Barang"
                    headerTextAlign="Center"
                    textAlign="Left"
                    width="200"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field={selectedListData?.[0]?.tipe === 'FBM' ? 'qty_kurang' : 'qty_fj'}
                    headerText="QTY. FJ"
                    headerTextAlign="Left"
                    textAlign="Right"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    visible={selectedListData?.[0]?.tipe === 'FBM'}
                    field="qty_pabrik_real"
                    headerText="QTY. Klaim"
                    headerTextAlign="Center"
                    textAlign="Right"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective allowEditing={false} field="qty_acc" headerText="QTY Acc" headerTextAlign="Center" textAlign="Right" width="80" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    allowEditing={false}
                    visible={selectedListData?.[0]?.tipe === 'FBM'}
                    field="no_kontrak"
                    headerText="No. Kontrak"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="200"
                    clipMode="EllipsisWithTooltip"
                />
            </ColumnsDirective>
        </GridComponent>
    );
};

export default GridDetail;
