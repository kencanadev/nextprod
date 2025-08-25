import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookBookmark, faBook } from '@fortawesome/free-solid-svg-icons';
import { categoriesBukuBesar, categoriesHutangUsahaDanSupplier } from '../model/api';
import BaseDialog from './modal/BaseDialog';
import { OnClick_CetakDaftarSupplier } from './functional/fungsi';

interface tabHutangUsahaDanSupplierProps {
    userid: any;
    kode_entitas: any;
    sidebarVisible: any;
    token: any;
}

const TabHutangUsahaDanSupplier: React.FC<tabHutangUsahaDanSupplierProps> = ({ userid, kode_entitas, sidebarVisible, token }: tabHutangUsahaDanSupplierProps) => {
    const [stateDataHeader, setStateDataHeader] = useState({
        disableWarna: false,
        categoriId: '',
        dialogModalVisible: false,
        date1: moment(), // tanggal awal
        date2: moment().endOf('month'), // tanggal akhir
        isCheckedSaldoNol: false,
        isCheckedAkun: false,

        idCategory: '',
        valueCategory: 0,
    });
    const handleClick = (id: any) => {
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            disableWarna: true,
            categoriId: id,
        }));
    };

    const handleDoubleClick = (category: any) => {
        const paramObject = {
            kode_entitas: kode_entitas,
            token: token,
        };
        if (category.id === 7201) {
            OnClick_CetakDaftarSupplier(paramObject);
        } else {
            setStateDataHeader((prevState: any) => ({
                ...prevState,
                dialogModalVisible: true,
                idCategory: category.id,
                valueCategory: category.value,
            }));
        }
    };

    return (
        <div className="h-[100%] w-[100%]">
            <div
                className="h-full"
                style={{ width: sidebarVisible ? '100%' : '100%', background: 'white', borderRadius: '10px', margin: sidebarVisible ? '' : 'auto auto auto -15%', overflowY: 'auto' }}
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-gray-300 px-4 py-2">
                        <FontAwesomeIcon icon={faBookBookmark} width="18" height="18" style={{ color: '#a93815', fontSize: '22px' }} />
                        <span className="text-right font-bold">Daftar Laporan Hutang Usaha Dan Supplier</span>
                    </div>
                    <div className="flex-1 overflow-auto px-4 pt-4">
                        <div>
                            {categoriesHutangUsahaDanSupplier.map((category, index) => (
                                <div
                                    key={category.id}
                                    // onClick={() => handleClick(category.id, index, category.tipe)}
                                    style={{ fontWeight: 'bold', padding: '10px', cursor: 'pointer', marginTop: '-17px' }}
                                    onClick={() => handleClick(category.id)}
                                    onDoubleClick={() => handleDoubleClick(category)}
                                >
                                    <div className="flex">
                                        <div style={{ width: '1.5%' }}>
                                            <FontAwesomeIcon icon={faBook} width="18" height="18" style={{ marginRight: '5px' }} />
                                        </div>
                                        <div style={{ width: '98.5%' }}>
                                            <h5 style={stateDataHeader.disableWarna === true && Number(stateDataHeader.categoriId) === category.id ? { background: '#d2eee7' } : {}}>
                                                {category.value}
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Footer Tetap */}
                    <div className="border-t border-gray-300 px-4 py-2">
                        <div className="text-right font-bold">Keterangan</div>
                        <div className="mt-1 text-sm font-bold text-[#9f9a9a]">Menampilkan laporan hutang usaha dan supplier.</div>
                    </div>
                </div>
                {/*============================================================================*/}
                {/*========================= Modal dialog Show (Filter) =======================*/}
                {/*============================================================================*/}
                {stateDataHeader.dialogModalVisible === true ? (
                    <BaseDialog
                        kode_entitas={kode_entitas}
                        visible={stateDataHeader.dialogModalVisible}
                        stateDataHeader={stateDataHeader}
                        setStateDataHeader={setStateDataHeader}
                        onClose={() =>
                            setStateDataHeader((prevState: any) => ({
                                ...prevState,
                                dialogModalVisible: false,
                            }))
                        }
                        token={token}
                    />
                ) : null}
                {/* {stateDataHeader.dialogFilterLaporanDetailBukuBesar === true ? (
                <DialogLaporanDetailBukuBesar visible={stateDataHeader.dialogFilterLaporanDetailBukuBesar} stateDataHeader={stateDataHeader} setStateDataHeader={setStateDataHeader} />
            ) : null} */}
            </div>
        </div>
    );
};

export default TabHutangUsahaDanSupplier;
