import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import axios from 'axios';
import { useSession } from '@/pages/api/sessionContext';

L10n.load(idIDLocalization);
enableRipple(true);

const headerNewLine = (value1: any, value2: any) => (
    <div style={{ textAlign: 'center', lineHeight: '1.5em' }}>
        {value1}
        <div>{value2}</div>
    </div>
);

const DetailStokPerGudang = ({ visible, onClose, selectedRow }: { visible: boolean; onClose: any; selectedRow: any }) => {
    const { sessionData, isLoading } = useSession();
    const gridDaftarBarang = useRef<any>(null);
    const gridMB = useRef<any>(null);
    const gridFIFO = useRef<any>(null);
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [dataKiri, setDataKiri] = useState([]);
    const [dataKanan, setDataKanan] = useState([]);
    const [tab, setTab] = useState('');
    const gridShowp = useRef<any>(null);

    const getDaftarStok = async () => {
        const response = await axios.get(`${apiUrl}/erp/detail_actual_stock?`, {
            params: {
                entitas: kode_entitas,
                param1: selectedRow.kode_barang,
                param2: moment().format('YYYY-MM-DD'),
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const temp = groupByNamaGudang(response.data.data);
        console.log('response gudang', temp);
        setDataKiri(response.data.data);
        // setDataKanan(response.data.data);

        gridDaftarBarang.current.dataSource = response.data.data;
    };
    const groupByNamaGudang = (items: any): any => {
        return items.reduce((acc: any, item: any) => {
            if (!acc[item.kode_gudang]) {
                acc[item.kode_gudang] = [];
            }
            acc[item.kode_gudang].push(item);
            return acc;
        }, {});
    };

    const showP = async (args: any) => {
        const response = await axios.get(`${apiUrl}/erp/detail_stok_per_gudang?`, {
            params: {
                entitas: kode_entitas,
                param1: 1,
                param2: moment().format('YYYY-MM-DD'),
                param3: args.data.nama_item,
                param4: args.data.nama_gudang,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        gridShowp.current!.dataSource = response.data.data.length > 0 ? response.data.data : [];
        gridShowp.current!.refresh();
        // setDataKanan(response.data.data ?? []);
        setTab('P');
        console.log('showP', response);
    };
    const setMBIN = async (args: any) => {
        const response = await axios.get(`${apiUrl}/erp/detail_stok_per_gudang?`, {
            params: {
                entitas: kode_entitas,
                param1: 0,
                param2: moment().format('YYYY-MM-DD'),
                param3: args.data.kode_gudang,
                param4: args.data.kode_item,
                param5: args.data.nama_gudang,
                param6: 'MB',
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        gridMB.current!.dataSource = response.data.data.length > 0 ? response.data.data : [];
        gridMB.current!.refresh();
        // setDataKanan(response.data.data ?? []);
        console.log('showP', response);
    };
    const setFIFO = async (args: any) => {
        const response = await axios.get(`${apiUrl}/erp/detail_stok_per_gudang?`, {
            params: {
                entitas: kode_entitas,
                param1: 0,
                param2: moment().format('YYYY-MM-DD'),
                param3: args.data.kode_gudang,
                param4: args.data.kode_item,
                param5: args.data.stok,
                param6: 'FIFO',
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        gridFIFO.current!.dataSource = response.data.data.length > 0 ? response.data.data : [];
        gridFIFO.current!.refresh();
        setTab('FIFO');
        // setDataKanan(response.data.data ?? []);
        console.log('gridFIFO', response);
    };
    const recordClick = async (args: any) => {
        if (args?.data?.jenis_gudang === 'P') {
            console.log('showP');
            await showP(args);
        } else {
            if (args?.data?.nama_gudang?.toLowerCase().includes('customer') || args?.data?.nama_gudang?.toLowerCase().includes('transit')) {
                // console.log('mb in');
                setTab('MB');
                setMBIN(args);
            } else {
                // console.log('FIFO', args);
                setFIFO(args);
            }
        }
    };
    const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
    useEffect(() => {
        if (Object.keys(selectedRow).length !== 0) {
            getDaftarStok();
        }
    }, [selectedRow]);
    return (
        <DialogComponent
            id="dialogDetailStokPerGudang"
            isModal={true}
            width={'80%'}
            height={500}
            header={'Detail Stok Per Gudang ' + selectedRow?.nama_item}
            close={onClose}
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
            style={{ position: 'fixed' }}
        >
            <div className="h-full w-full flex-col">
                <div className="flex h-[93%] w-full gap-2">
                    <div className="h-full w-[35%]">
                        <GridComponent
                            id="gridDaftarBarang"
                            name="gridDaftarBarang"
                            className="gridDaftarBarang"
                            locale="id"
                            //  dataSource={dialogListPengemudi}
                            //  rowSelecting={handleSelect}
                            //  recordDoubleClick={hanldeRecordDoubleClick}
                            rowSelected={recordClick}
                            autoFit={true}
                            ref={gridDaftarBarang}
                            selectionSettings={{ mode: 'Row', type: 'Single' }}
                            rowHeight={22}
                            gridLines={'Both'}
                            height={'280'} // Tinggi grid dalam piksel /
                        >
                            <ColumnsDirective>
                                <ColumnDirective field="nama_gudang" headerText="Nama. Gudang" headerTextAlign="Center" textAlign="Left" width={200} />
                                <ColumnDirective
                                    field="stok"
                                    headerText="Jumlah Stok"
                                    headerTemplate={() => headerNewLine('Jumlah', 'Stok')}
                                    headerTextAlign="Center"
                                    format={'N2'}
                                    textAlign="Right"
                                    width={80}
                                />
                                <ColumnDirective
                                    field="hari"
                                    headerText="Umur Terlama"
                                    headerTemplate={() => headerNewLine('Umur', 'Terlama')}
                                    headerTextAlign="Center"
                                    format={'N2'}
                                    textAlign="Right"
                                    width={80}
                                />
                            </ColumnsDirective>

                            <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
                        </GridComponent>
                    </div>
                    <div className="h-full w-[65%]">
                        <div className={`h-full w-full ${tab === 'P' ? 'block' : 'hidden'}`}>
                            <GridComponent
                                id="gridShowp"
                                name="gridShowp"
                                className="gridShowp"
                                locale="id"
                                // dataSource={dataKanan}
                                //  rowSelecting={handleSelect}
                                //  recordDoubleClick={hanldeRecordDoubleClick}
                                ref={gridShowp}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                rowHeight={22}
                                autoFit={true}
                                gridLines={'Both'}
                                height={'280'} // Tinggi grid dalam piksel /
                            >
                                <ColumnsDirective>
                                    <ColumnDirective format={formatDateYM} type="date" field="tanggal" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" width={80} />
                                    <ColumnDirective field="no_kontrak" headerText="No. Kontrak" headerTextAlign="Center" textAlign="Left" width={150} />
                                    <ColumnDirective
                                        field="qty_sisa"
                                        headerTemplate={() => headerNewLine('Sisa', 'Stok')}
                                        headerText="Sisa Stok"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width={80}
                                    />
                                    <ColumnDirective field="umur_beli" headerTemplate={() => headerNewLine('Umur', 'PB')} headerText="Umur PB" headerTextAlign="Center" textAlign="Left" width={80} />
                                </ColumnsDirective>

                                <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
                            </GridComponent>
                        </div>
                        <div className={`h-full w-full ${tab === 'MB' ? 'block' : 'hidden'}`}>
                            <GridComponent
                                id="gridMB"
                                name="gridMB"
                                className="gridMB"
                                locale="id"
                                // dataSource={dataKanan}
                                //  rowSelecting={handleSelect}
                                //  recordDoubleClick={hanldeRecordDoubleClick}
                                ref={gridMB}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                rowHeight={22}
                                autoFit={true}
                                gridLines={'Both'}
                                height={'280'} // Tinggi grid dalam piksel /
                            >
                                <ColumnsDirective>
                                    <ColumnDirective format={formatDateYM} type="date" field="tanggal" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" width={75} />
                                    <ColumnDirective field="dokumen" headerText="Ref" headerTextAlign="Center" textAlign="Left" width={50} />
                                    <ColumnDirective field="noref" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" width={115} />
                                    <ColumnDirective field="no_kontrak" headerText="No. Referensi" headerTextAlign="Center" textAlign="Left" width={80} />
                                    <ColumnDirective field="nopol" headerText="No. Kendaraan" headerTextAlign="Center" textAlign="Left" width={80} />
                                    <ColumnDirective
                                        field="jumlah"
                                        headerTemplate={() => headerNewLine('Jumlah', 'Transaksi')}
                                        headerText="Jumlah Transaksi"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format={'N'}
                                        width={80}
                                    />
                                    <ColumnDirective
                                        field="kuantitas"
                                        headerTemplate={() => headerNewLine('Sisa', 'Stok')}
                                        headerText="Sisa Stok"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format={'N'}
                                        width={80}
                                    />
                                    <ColumnDirective
                                        field="hari"
                                        headerTemplate={() => headerNewLine('Umur', 'di Gudang')}
                                        headerText="Umur di gudang"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format={'N'}
                                        width={80}
                                    />
                                    <ColumnDirective
                                        field="umur_beli"
                                        headerTemplate={() => headerNewLine('Umur', 'di PB')}
                                        headerText="Umur di PB"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format={'N'}
                                        width={80}
                                    />
                                </ColumnsDirective>

                                <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
                            </GridComponent>
                        </div>
                        <div className={`h-full w-full ${tab === 'FIFO' ? 'block' : 'hidden'}`}>
                            <GridComponent
                                id="gridFIFO"
                                name="gridFIFO"
                                className="gridFIFO"
                                locale="id"
                                // dataSource={dataKanan}
                                //  rowSelecting={handleSelect}
                                //  recordDoubleClick={hanldeRecordDoubleClick}
                                ref={gridFIFO}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                rowHeight={22}
                                autoFit={true}
                                gridLines={'Both'}
                                height={'280'} // Tinggi grid dalam piksel /
                            >
                                <ColumnsDirective>
                                    <ColumnDirective format={formatDateYM} type="date" field="tanggal" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" width={75} />
                                    <ColumnDirective field="dokumen" headerText="Ref" headerTextAlign="Center" textAlign="Left" width={50} />
                                    <ColumnDirective field="noref" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" width={115} />
                                    <ColumnDirective field="no_kontrak" headerText="No. Referensi" headerTextAlign="Center" textAlign="Left" width={80} />
                                    <ColumnDirective field="nopol" headerText="No. Kendaraan" headerTextAlign="Center" textAlign="Left" width={80} />
                                    <ColumnDirective
                                        field="jumlah"
                                        headerText="Jumlah Transaksi"
                                        headerTemplate={() => headerNewLine('Jumlah', 'Transaksi')}
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format={'N'}
                                        width={80}
                                    />
                                    <ColumnDirective
                                        field="total"
                                        headerText="Sisa Stok"
                                        headerTemplate={() => headerNewLine('Sisa', 'Stok')}
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format={'N'}
                                        width={80}
                                    />
                                    <ColumnDirective
                                        field="hari"
                                        headerText="Umur di gudang"
                                        headerTemplate={() => headerNewLine('Umur', 'di Gudang')}
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format={'N'}
                                        width={80}
                                    />
                                    <ColumnDirective
                                        field="umur_beli"
                                        headerText="Umur di PB"
                                        headerTemplate={() => headerNewLine('Umur', 'di PB')}
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format={'N'}
                                        width={80}
                                    />
                                </ColumnsDirective>

                                <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
                            </GridComponent>
                        </div>
                    </div>
                </div>
                <div className="flex h-[8%] w-full justify-end gap-2 pb-2 pr-2">
                    <ButtonComponent type="submit" onClick={onClose}>
                        <u>Tu</u>tup
                    </ButtonComponent>
                </div>
            </div>
        </DialogComponent>
    );
};

export default DetailStokPerGudang;
