import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus, faCirclePlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { getServerSideProps } from '@/pages/api/getServerSide';
// import ItemDlg from '.././modal/itemdlg';
import { useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Flatpickr from 'react-flatpickr';

import 'react-tabs/style/react-tabs.css';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import styles from '../mpblist.module.css';
// import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
// import React from 'react';
// import ModalDlgLpb from '../modal/modalLpbDlg';
import MpbList from '../mpblist';
import swal from 'sweetalert2';
import { frmNumber, tanpaKoma } from '@/utils/routines';
import { MpbEditApi } from '../model/api';

interface TableJurnalDlgProps {
    userid: any;
    kode_entitas: any;
    dataApi: any;
    dataDept: any;
    handleUpdate: any;
    handleselectcell: any;
    nilaiValueNoItem: any;
    nilaiValueNamaItem: any;
    handleModalAkunChange: any;
    nilaiTotalId: any;
    tipeValue: any;
    handleModalAkun: any;
}

const TableJurnal = ({
    dataApi,
    dataDept,
    handleUpdate,
    handleselectcell,
    userid,
    kode_entitas,
    nilaiValueNoItem,
    nilaiValueNamaItem,
    handleModalAkunChange,
    nilaiTotalId,
    tipeValue,
    handleModalAkun,
}: TableJurnalDlgProps) => {
    const [modalAkunDlg, setModalAkunDlg] = useState(false);
    const [Barangkode_itemSelected, setBarangkode_itemSelected] = useState();
    const [Barangno_itemSelected, setBarangno_itemSelected] = useState();
    const [Barangnama_itemSelected, setBarangnama_itemSelected] = useState();
    const [BarangsatuanSelected, setBarangsatuanSelected] = useState();
    const [BarangbrtSelected, setBarangbrtSelected] = useState();
    const [Barangfpp_diameterSelected, setBarangfpp_diameterSelected] = useState();
    const [Barangfpp_kgSelected, setBarangfpp_kgSelected] = useState();
    const [BarangpanjangSelected, setBarangpanjangSelected] = useState();
    // console.log(dataApi);

    const handleSelectedData = (
        id_mpb: any,
        selectedkode_item: any,
        selectedno_item: any,
        selectednama_item: any,
        selectedsatuan: any,
        selectedberat: any
        // selectedfpp_diameter: any,
        // selectedfpp_kg: any,
        // selectedpanjang: any
    ) => {
        setBarangkode_itemSelected(selectedkode_item);
        setBarangno_itemSelected(selectedno_item);
        setBarangnama_itemSelected(selectednama_item);
        setBarangsatuanSelected(selectedsatuan);
        setBarangbrtSelected(selectedberat);
        // setBarangfpp_diameterSelected(selectedfpp_diameter);
        // setBarangfpp_kgSelected(selectedfpp_kg);
        // setBarangpanjangSelected(selectedpanjang);

        handleUpdate(selectedno_item, id_mpb, 'no_item', selectedberat, selectedsatuan, selectedkode_item, ''); //, selectedfpp_diameter, selectedfpp_kg, selectedpanjang);
        handleUpdate(selectednama_item, id_mpb, 'diskripsi', selectedberat, selectedsatuan, selectedkode_item); //, '', selectedfpp_diameter, selectedfpp_kg, selectedpanjang);
    };
    const handleFocus = (event: any) => event.target.select();
    const themeJurnal = useTheme({
        Header: `
            .th {
                border-bottom: 1px solid #a0a8ae;
                text-align: center; /* Center align header text */
            }
        `,
        Row: `
            &:nth-of-type(odd) {
                background-color: #f9fafb;
            }
            &:nth-of-type(even) {
                background-color: white;
            }
            &:not(:last-of-type) .td {
                border-bottom: 1px solid #a0a8ae;
            }
        `,
        BaseCell: `
            &:not(:last-of-type) {
                border-right: 1px solid #a0a8ae;
            }
            &:hover, &:focus {
                outline: solid;
                outline-width: 1px;
                outline-offset: -1px;
              }
            text-align: center; /* Center align cell content */
        `,
        Table: `
        --data-table-library_grid-template-columns: repeat(10, 1fr); /* Default layout */
        /* Media query for smaller screens */
        @media screen and (max-width: 768px) {
        }
    `,
    });
    const formatCurrency = (value: any) => {
        // Menghapus semua karakter selain digit
        const cleanedValue = value.replace(/[^\d]/g, '');

        // Mengonversi nilai ke dalam format angka dengan koma sebagai pemisah ribuan
        const formattedValue = new Intl.NumberFormat('id-ID').format(cleanedValue);

        // Mengganti titik dengan koma
        const finalValue = formattedValue.replace(/\./g, ',');

        return finalValue;
    };

    return (
        <div>
            <div className="mb-1 flex" style={{ marginLeft: '90%' }}>
                <div className="card">
                    {/* <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar> */}
                    {/* <Toolbar start={} end={} /> */}
                </div>
            </div>

            <Table data={dataApi} theme={themeJurnal} layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}>
                {(tableList: any[]) => (
                    <>
                        <Header>
                            <HeaderRow style={{ userSelect: 'none' }}>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">No. Akun</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">Nama Akun</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">Debet</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">Kredit</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">Keterangan</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">MU</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">Kurs</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">Jumlah (MU)</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">Subsidiary Ledger</div>
                                </HeaderCell>
                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                    resize={true}
                                >
                                    <div className="flex">Departemen</div>
                                </HeaderCell>
                            </HeaderRow>
                        </Header>

                        <Body>
                            {tableList.map((item: any) => (
                                <Row key={item.id_dokumen} item={item}>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_dokumen);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                value={item.no_akun}
                                                onChange={(event) => handleModalAkunChange(event.target.value, 'tipeNoAkun', item.id_dokumen)}
                                                onFocus={handleFocus}
                                                readOnly
                                                // onKeyDown={() => {
                                                //     setModalAkunDlg(true);
                                                // }}
                                            />
                                            {/* <div>
                                                <button
                                                    onClick={() => {
                                                        handleModalAkun('tipeNoAkun', item.id_dokumen);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                                </button>
                                            </div> */}
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_dokumen);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                value={item.nama_akun}
                                                onChange={(event) => handleModalAkunChange(event.target.value, 'tipeNamaAkun', item.id_dokumen)}
                                                onFocus={handleFocus}
                                                readOnly
                                                // onKeyDown={() => {
                                                //     setModalAkunDlg(true);
                                                // }}
                                            />
                                            {/* <div>
                                                <button
                                                    onClick={() => {
                                                        // setModalItemDlg(true);
                                                        handleModalAkun('tipeNamaAkun', item.id_dokumen);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                                </button>
                                            </div> */}
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_dokumen);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                id={`debet_rp${item.id_dokumen}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    textAlign: 'right',
                                                }}
                                                value={frmNumber(String(item.debet_rp))}
                                                //{BarangsatuanSelected}

                                                onBlur={(event) => handleUpdate(event.target.value, item.id_dokumen, 'debet_rp')}
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                readOnly
                                                // onKeyPress={(event) => {
                                                //     const isNumeric = /^[0-9]*$/;
                                                //     if (!isNumeric.test(event.key)) {
                                                //         event.preventDefault();
                                                //     }
                                                // }}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_dokumen);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                id={`kredit_rp${item.id_dokumen}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    textAlign: 'right',
                                                }}
                                                defaultValue={frmNumber(String(item.kredit_rp))}
                                                onBlur={(event) => handleUpdate(event.target.value, item.id_dokumen, 'kredit_rp')}
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                // onKeyPress={(event) => {
                                                //     const isNumeric = /^[0-9]*$/;
                                                //     if (!isNumeric.test(event.key)) {
                                                //         event.preventDefault();
                                                //     }
                                                // }}
                                                onFocus={handleFocus}
                                                readOnly
                                            />
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_dokumen);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                type="text"
                                                disabled={true}
                                                id={`id_berat${item.id_dokumen}`}
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                value={item.catatan}
                                                // value={parseFloat(item.berat).toLocaleString('en-US', {
                                                //     minimumFractionDigits: 2,
                                                // })}
                                                readOnly
                                            />
                                        </div>
                                    </Cell>
                                    <Cell>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                defaultValue={item.kode_mu}
                                                readOnly
                                                //value={BarangbrtSelected}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    textAlign: 'right',
                                                }}
                                                defaultValue={frmNumber(String(item.kurs))}
                                                //value={BarangbrtSelected}
                                                readOnly
                                            />
                                        </div>
                                    </Cell>
                                    <Cell>
                                        <div className="flex">
                                            <input
                                                id={`jumlah_mu${item.id_dokumen}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    textAlign: 'right',
                                                }}
                                                // defaultValue={item.jumlah_mu}
                                                value={frmNumber(String(item.jumlah_mu))} // Perubahan tgl 2025-05-23
                                                // disabled={true}
                                                readOnly
                                                //value={BarangbrtSelected}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '10px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                value={item.subledger}
                                                // disabled={true}
                                                readOnly
                                                //value={BarangbrtSelected}
                                            />
                                            {/* <button
                                                onClick={() => {
                                                    handleModalAkun('supp_ledger', item.id_dokumen, item.tipe, item.kode_akun);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button> */}
                                        </div>
                                    </Cell>
                                    <Cell>
                                        <div className="flex">
                                            <select
                                                id="a"
                                                className={`form-select text-white-dark`}
                                                style={{ border: 'none', color: 'black', fontSize: 10 }}
                                                value={item.kode_dept}
                                                onChange={(event) => handleModalAkunChange(event.target.value, 'dept', item.id_dokumen)}
                                                // disabled={view === 'true' ? true : false}
                                                disabled
                                            >
                                                {dataDept.map((dept: any) => (
                                                    <option key={dept.kode_dept} value={dept.kode_dept}>
                                                        {dept.no_dept_dept + ' - ' + dept.nama_dept}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* <input
                                                    type="text"
                                                    style={{
                                                        width: '100%',
                                                        border: 'none',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                    }}
                                                    defaultValue={item.kode_dept}
                                                    //value={BarangbrtSelected}
                                                /> */}
                                        </div>
                                    </Cell>
                                </Row>
                            ))}
                        </Body>
                    </>
                )}
            </Table>
        </div>
    );
};

export { getServerSideProps };
export default TableJurnal;
