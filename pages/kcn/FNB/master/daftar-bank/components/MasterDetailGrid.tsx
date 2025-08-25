import React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, DetailRow } from '@syncfusion/ej2-react-grids';
// import { BankListType, DetailBankType } from '@/types/bank-types'; // Adjust import paths if needed
import { format } from 'date-fns';
interface BankListType {
    // master
    id: number;
    nama_bank: string;
    userid: string;
    tgl_update: string;
}
interface DetailBankType {
    id: number;
    kode_akun: string;
    nama_bank: string;
    no_rekening: string;
    nama_rekening: string;
    aktif: string;
    tgl_update: string;
    userid: string;
    keterangan: string | null;
    saldo_endap: number;
    saldo_akhir: string;
    saldo_real: string;
    nominal_ready: string;
    tgl_buka_rek: moment.Moment;
    tgl_tutup_rek: moment.Moment | null;
    no_akun: string;
    nama_akun: string;
}
interface Props {
    masterData: BankListType[];
    detailData: DetailBankType[];
}

const MasterDetailGrid: React.FC<Props> = ({ masterData, detailData }) => {
    const detailTemplate = (props: BankListType) => {
        const filteredDetails = detailData.filter((d) => d.nama_bank === props.nama_bank);

        return (
            <div className="rounded bg-gray-50 p-2">
                <GridComponent dataSource={filteredDetails} height={200} rowHeight={35}>
                    <ColumnsDirective>
                        <ColumnDirective field="kode_akun" headerText="Kode Akun" width="120" />
                        <ColumnDirective field="no_rekening" headerText="No. Rekening" width="150" />
                        <ColumnDirective field="nama_rekening" headerText="Nama Rekening" width="160" />
                        <ColumnDirective field="saldo_akhir" headerText="Saldo Akhir" width="120" textAlign="Right" />
                        <ColumnDirective field="tgl_buka_rek" headerText="Tgl Buka" width="120" format="dd/MM/yyyy" type="date" />
                    </ColumnsDirective>
                </GridComponent>
            </div>
        );
    };

    return (
        <GridComponent dataSource={masterData} detailTemplate={detailTemplate} allowPaging={true} pageSettings={{ pageSize: 5 }}>
            <ColumnsDirective>
                <ColumnDirective field="id" headerText="ID" width="80" textAlign="Right" />
                <ColumnDirective field="nama_bank" headerText="Nama Bank" width="150" />
                <ColumnDirective field="userid" headerText="User ID" width="120" />
                <ColumnDirective field="tgl_update" headerText="Tgl Update" width="140" />
            </ColumnsDirective>
            <Inject services={[DetailRow]} />
        </GridComponent>
    );
};

export default MasterDetailGrid;
