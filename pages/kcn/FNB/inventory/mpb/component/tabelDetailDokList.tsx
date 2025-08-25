interface TabelDetailDokList {
    userid: any;
    kode_entitas: any;
    kode_user: any;
    kodeSupp: any;
    kodeGudang: any;
    dataApi: any;
    kode_mpb: any;
    detailBaru: any;
}

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getServerSideProps } from '@/pages/api/getServerSide';
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Toolbar } from 'primereact/toolbar';

export default function TabelDetailDokList({ userid, kode_entitas, kode_user, kodeSupp, kodeGudang, dataApi, kode_mpb, detailBaru }: TabelDetailDokList) {
    type detailDokList = {
        kode_mpb: any;
        id_mpb: any;
        kode_lpb: any;
        id_lpb: any;
        kode_sp: any;
        id_sp: any;
        kode_pp: any;
        id_pp: any;
        kode_item: any;
        diskripsi: any;
        satuan: any;
        qty: any;
        sat_std: any;
        qty_std: any;
        qty_sisa: any;
        kode_mu: any;
        kurs: any;
        kurs_pajak: any;
        harga_mu: any;
        diskon: any;
        diskon_mu: any;
        potongan_mu: any;
        kode_pajak: any;
        pajak: any;
        include: any;
        pajak_mu: any;
        jumlah_mu: any;
        jumlah_rp: any;
        ket: any;
        kode_dept: any;
        kode_kerja: any;
        no_item: any;
        nama_dept: any;
        nama_kerja: any;
        no_lpb: any;
        index: any;
    };

    const theme = useTheme({
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
            text-align: center; /* Center align cell content */
        `,
        Table: `
        --data-table-library_grid-template-columns: repeat(9, 1fr); /* Default layout */
        /* Media query for smaller screens */
        @media screen and (max-width: 768px) {
        }
    `,
    });

    return (
        <div>
            {/* <div className="mb-1 flex" style={{ marginLeft: '95%' }}> */}

            <Table
                // style={{ width: '100%' }}
                data={dataApi}
                // data={dataEditMpb}
                theme={theme}
                // sort={sort}
                // pagination={pagination}
                layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}
            >
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
                                    // style={{
                                    //     textAlign: 'center',
                                    //     userSelect: 'none',
                                    //     backgroundColor: 'rgb(94, 98, 98)',
                                    //     color: 'white',
                                    // }}
                                >
                                    <div className="flex">No. Barang</div>
                                </HeaderCell>

                                <HeaderCell
                                    // style={{
                                    //     display: 'flex',
                                    //     alignItems: 'center',
                                    //     justifyContent: 'center',
                                    //     userSelect: 'none',
                                    //     backgroundColor: 'rgb(94, 98, 98)',
                                    //     color: 'white',
                                    //     width: '350px',
                                    // }}
                                    style={{
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                >
                                    <div className="flex">Nama Barang</div>
                                </HeaderCell>

                                <HeaderCell
                                    style={{
                                        textAlign: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                        // width: '200px',
                                    }}
                                >
                                    <div className="flex">Satuan</div>
                                    {/* <div>Satuan</div> */}
                                </HeaderCell>

                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                >
                                    <div className="flex">Kuantitas</div>
                                </HeaderCell>

                                <HeaderCell
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                >
                                    <div className="flex">Keterangan</div>
                                </HeaderCell>

                                <HeaderCell
                                    // gridColumnStart={13}
                                    // gridColumnEnd={14}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                >
                                    <div className="flex">Berat(Kg)</div>
                                </HeaderCell>
                                <HeaderCell
                                    // gridColumnStart={13}
                                    // gridColumnEnd={14}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                >
                                    <div className="flex">No. Reff</div>
                                </HeaderCell>
                                <HeaderCell
                                    // gridColumnStart={13}
                                    // gridColumnEnd={14}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                >
                                    <div className="flex">No. SJ Supplier</div>
                                </HeaderCell>
                                <HeaderCell
                                    // gridColumnStart={13}
                                    // gridColumnEnd={14}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        userSelect: 'none',
                                        backgroundColor: 'rgb(94, 98, 98)',
                                        color: 'white',
                                    }}
                                >
                                    <div className="flex">Tgl. SJ Supplier</div>
                                </HeaderCell>
                            </HeaderRow>
                        </Header>

                        <Body>
                            {tableList.map((item: any) => (
                                <Row key={item.id} item={item}>
                                    {/* <Cell onClick={() => handleKirimIdRemove(item.id)}> */}
                                    <Cell>
                                        <div className="flex">
                                            <input
                                                // id="no_item"
                                                // placeholder="No. Item"
                                                // defaultValue={edNoItem}
                                                // className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                                type="text"
                                                placeholder="No. Barang"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                value={item.no_item}
                                                // readOnly
                                                // onChange={(event) => handleUpdate(event.target.value, item.id, 'no_item')}
                                                // onChange={(event) => onChangeDetail(event.target.value, item.id, 'no_item')}
                                            />
                                            <div>
                                                <button
                                                    onClick={() => {
                                                        // console.log('Ikon diklik no item!');
                                                        // onEditMpb();
                                                        //  setModalTable(true);
                                                    }}
                                                    // style={{ height: 25, marginTop: 0, marginBottom: 1, background: '#dedede', borderColor: '#dedede' }}
                                                >
                                                    {/* <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" /> */}
                                                </button>
                                            </div>
                                        </div>
                                    </Cell>

                                    {/* <Cell Cell onClick={() => handleKirimIdRemove(item.id)}> */}
                                    <Cell>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                placeholder="Nama Barang"
                                                //defaultValue={item.diskripsi}
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                value={item.diskripsi}
                                                // onChange={(event) => onChangeDetail(event.target.value, item.id, 'diskripsi')}
                                            />
                                            <div></div>
                                        </div>
                                    </Cell>

                                    <Cell>
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.satuan}
                                            //readOnly
                                            // onChange={(event) => onChangeDetail(event.target.value, item.id, 'satuan')}
                                        />
                                    </Cell>

                                    <Cell style={{ textAlign: 'center' }}>
                                        <input
                                            id={`qty${item.id}`}
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            defaultValue={item.qty}
                                            // onBlur={(event) => onChangeDetail(event.target.value, item.id, 'qty')}
                                        />
                                    </Cell>

                                    <Cell>
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.ket}
                                            // onChange={(event) => onChangeDetail(event.target.value, item.id, 'ket')}
                                        />
                                    </Cell>

                                    <Cell>
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.berat}
                                            // onChange={(event) => onChangeDetail(event.target.value, item.id, 'berat')}
                                        />
                                    </Cell>

                                    <Cell>
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.no_dok}
                                            // onChange={(event) => onChangeDetail(event.target.value, item.id, 'no_dok')}
                                        />
                                    </Cell>

                                    <Cell>
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.no_sj}
                                            // onChange={(event) => onChangeDetail(event.target.value, item.id, 'no_sj')}
                                        />
                                    </Cell>

                                    <Cell>
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.tgl_sj}
                                            // onChange={(event) => onChangeDetail(event.target.value, item.id, 'tgl_sj')}
                                        />
                                    </Cell>
                                </Row>
                            ))}
                        </Body>
                        {/* <TaskName isOpen={modaltable} onClose={() => setModalTable(false)} onSelectData={(selectedData: any) => handleSelectedData(selectedData)} /> */}
                    </>
                )}
            </Table>
        </div>
    );
}

export { getServerSideProps };
