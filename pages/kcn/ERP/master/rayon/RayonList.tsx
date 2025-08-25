import React, { useEffect, useRef, useState } from 'react';
import GridRayonList from './GridRayonList';
import { GridComponent } from '@syncfusion/ej2-react-grids';
import DialogBaruEditRayonMaster from './DialogBaruEditRayonMaster';
import axios from 'axios';
import { useSession } from '@/pages/api/sessionContext';

const RayonList = () => {
    const { sessionData } = useSession();
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const gridRayon = useRef<GridComponent | any>(null);
    const [showDialogBaruEdit, setShowDialogBaruEdit] = useState(false);
    const [masterData, setMasterData] = useState({});
    const [masterState, setMasterState] = useState('');

    const refreshData = async () => {
        const wilayahResponse = await axios.get(`${apiUrl}/erp/master_wilayah?`, {
            params: {
                entitas: kode_entitas,
            },
        });
        gridRayon.current.setProperties({ dataSource: wilayahResponse.data.data });
    };

    useEffect(() => {
        if (token) {
            refreshData();
        }
    }, [token]);
    const recordDoubleClickHandle = (args: any) => {
        setShowDialogBaruEdit(true);
        setMasterState('EDIT');
    };
    const rowselectHandle = (args: any) => {
        setMasterData(args.data);
    };
    return (
        <div className="Main overflow-visible" id="forDialogAndSwallAwal">
            {showDialogBaruEdit === true ? (
                <DialogBaruEditRayonMaster
                    refreshData={refreshData}
                    visible={showDialogBaruEdit}
                    onClose={() => {
                        setTimeout(() => setShowDialogBaruEdit(false), 300);
                    }}
                    masterState={masterState}
                    masterData={masterData}
                />
            ) : null}
            <div className="-mt-3 flex items-center gap-3 space-x-2 p-1">
                <button
                    className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                    onClick={() => {
                        setShowDialogBaruEdit(true);
                        setMasterState('BARU');
                    }}
                >
                    Baru
                </button>
                <button
                    className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                    onClick={() => {
                        if (Object?.keys(masterData || {}).length === 0) {
                            return alert('Pilih Data Terlebih Dahulu');
                        }

                        setShowDialogBaruEdit(true);
                        setMasterState('EDIT');
                    }}
                >
                    Ubah
                </button>
                {/* <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]">Hapus</button> */}
                <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={refreshData}>
                    Refresh
                </button>
                <div className="w-full justify-end">
                    <h2 className="bold text-md text-right">List Rayon</h2>
                </div>
            </div>
            <div className={`h-full flex-1`}>
                <style>
                    {`
                    .e-row .e-rowcell:hover {
                        cursor: pointer;
                    }

                    .e-row.e-selectionbackground {
                        cursor: pointer;
                    }
                    .e-grid .e-headertext {
                        font-size: 11px !important;
                    }
                    .e-grid .e-rowcell {
                        font-size: 11px !important;
                    }
                        #checkbox-grid-column8 {
                           margin-left: auto;
                        }
                `}
                </style>
                <div className="h-full w-full overflow-x-auto rounded-md bg-[#dedede] p-1">
                    <div className="h-full w-full rounded-md bg-white p-1">
                        <GridRayonList rowselectHandle={rowselectHandle} recordDoubleClickHandle={recordDoubleClickHandle} gridRayon={gridRayon} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RayonList;
