import React, { useState, useRef, useEffect } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Page, Selection, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { DepartementType, fetchDepartemenData, postDeleteDepartemen, styleButton } from './support';
import withReactContent from 'sweetalert2-react-content';
import { myAlertGlobal, swalDialog } from '@/utils/routines';
import FrmDepartemenDlg from './support/FrmDepartemen';
interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
}
const FrmDepartemen = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    // Defintion
    const gridDepartemen = useRef<GridComponent>(null);
    const [dsDepartemen, setDsDepartemen] = useState<DepartementType[]>([]);
    const [loading, setLoading] = useState(false);
    const [stateDialog, setStateDialog] = useState('');
    const [departemSelected, setDepartemSelected] = useState<DepartementType>({
        kode_dept: '',
        no_dept: '',
        nama_dept: '',
        aktif: '',
        personal: null,
        catatan: null,
        userid: '',
        tgl_update: '',
    });
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    // Function
    const handleButtonClick = async (btnType: string) => {
        if (btnType === 'refresh') {
            await fetchDept();
        } else if (btnType === 'delete') {
            if (departemSelected.kode_dept === '') {
                myAlertGlobal('Silahkan pilih data yang akan dihapus', 'FrmDialogDepartemen', 'warning');
                return;
            }
            withReactContent(swalDialog)
                .fire({
                    title: '<p style="font-size:13px; font-weight:bold; text-align:center;">Hapus Data Departemen </p>',
                    html: `
                        <div class="custom-content" style="font-size:13px; text-align:left;">
                            <p><strong>No. Akun   :</strong> ${departemSelected.nama_dept}</p>
                        </div>
                    `,
                    width: '21%',
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    showCancelButton: true,
                    target: '#FrmDialogDepartemen',
                })
                .then(async (result) => {
                    if (result.isConfirmed) {
                        setLoading(true);
                        await postDeleteDepartemen(entitas, token, departemSelected.kode_dept).then(async () => {
                            await fetchDept();
                        });
                    }
                });
        } else if (btnType === 'edit') {
            if (departemSelected.kode_dept === '') {
                myAlertGlobal('Silahkan pilih data yang akan diubah', 'FrmDialogDepartemen', 'warning');
                return;
            }
            setStateDialog('edit');
            setIsOpenDialog(true);
        } else if (btnType === 'create') {
            setStateDialog('create');
            setIsOpenDialog(true);
        } else if (btnType === 'close') {
            onClose();
        }
    };
    const fetchDept = async () => {
        setLoading(true);
        const result = await fetchDepartemenData(entitas, token);
        setTimeout(() => {
            setDsDepartemen(result);
            setLoading(false);
        }, 500);
    };
    // useEffect
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchDept();
        }
    }, [isOpen]);
    return (
        <>
            <DialogComponent
                id="FrmDialogDepartemen"
                name="FrmDialogDepartemen"
                target="#master-layout"
                header={'Departemen'}
                visible={isOpen}
                isModal={false}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                width="70%"
                height="70%"
                position={{ X: 'center', Y: 'center' }}
                style={{ position: 'fixed' }}
                close={() => {
                    onClose();
                }}
                closeOnEscape={true}
                open={(args: any) => {
                    args.preventFocus = true;
                }}
                showCloseIcon={true}
                allowDragging={true}
            >
                <div>
                    <div className="gap-2 sm:flex">
                        {/* === Button Group === */}
                        <div className="flex pr-1 ">
                            <ButtonComponent
                                id="btnTutup"
                                cssClass="e-primary e-small"
                                content="Tutup"
                                style={styleButton}
                                disabled={false}
                                onClick={() => {
                                    handleButtonClick('close');
                                }}
                            />
                            <ButtonComponent
                                id="btnBaru"
                                cssClass="e-primary e-small"
                                content="Baru"
                                style={styleButton}
                                disabled={false}
                                onClick={() => {
                                    handleButtonClick('create');
                                }}
                            />
                            <ButtonComponent
                                id="btnUbah"
                                cssClass="e-primary e-small"
                                content="Ubah"
                                disabled={false}
                                style={styleButton}
                                onClick={() => {
                                    handleButtonClick('edit');
                                }}
                            />

                            <ButtonComponent
                                id="btnHapus"
                                cssClass="e-primary e-small"
                                content="Hapus"
                                disabled
                                style={{
                                    // ...styleButton,
                                    width: 77 + 'px',
                                    height: '28px',
                                    marginBottom: '0.5em',
                                    marginTop: 0.5 + 'em',
                                    marginRight: 0.8 + 'em',
                                    color: 'gray',
                                    cursor: 'not-allowed',
                                }}
                                onClick={() => {
                                    handleButtonClick('delete');
                                }}
                            />
                            <ButtonComponent
                                id="btnRefresh"
                                cssClass="e-primary e-small"
                                content="Refresh"
                                style={styleButton}
                                disabled={false}
                                onClick={() => {
                                    handleButtonClick('refresh');
                                    setDepartemSelected({
                                        kode_dept: '',
                                        no_dept: '',
                                        nama_dept: '',
                                        aktif: '',
                                        personal: null,
                                        catatan: null,
                                        userid: '',
                                        tgl_update: '',
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className="relative block ">
                        <div className={`${loading && 'opacity-20'}`}>
                            <GridComponent
                                id="gridDepartemen"
                                ref={gridDepartemen}
                                pageSettings={{
                                    pageSize: 25,
                                    pageCount: 5,
                                    pageSizes: ['25', '50', '100', 'All'],
                                }}
                                name="gridDepartemen"
                                allowPaging={true}
                                allowSorting={true}
                                allowFiltering={false}
                                allowResizing={true}
                                dataSource={dsDepartemen}
                                allowSelection={true}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                gridLines={'Both'}
                                loadingIndicator={{ indicatorType: 'Shimmer' }}
                                height={470}
                                autoFit={true}
                                rowHeight={22}
                                allowReordering={true}
                                rowSelected={(args: any) => {
                                    setDepartemSelected(args.data as DepartementType);
                                }}
                                recordDoubleClick={(args: any) => {
                                    handleButtonClick('edit');
                                }}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective field="no_dept" headerText="No." headerTextAlign="Center" textAlign="Center" width={50} />
                                    <ColumnDirective field="nama_dept" headerText="Nama Departemen" headerTextAlign="Center" width={400} />
                                    <ColumnDirective field="personal" headerText="Penanggung Jawab" headerTextAlign="Center" width={400} />
                                </ColumnsDirective>
                                <Inject services={[Page, Selection, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                            </GridComponent>
                        </div>
                        {loading && (
                            <div role="status" className="absolute left-1/2 top-2/4 -translate-x-1/2 -translate-y-1/2">
                                <svg
                                    aria-hidden="true"
                                    className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogComponent>
            {isOpenDialog && (
                <FrmDepartemenDlg
                    isOpen={isOpenDialog}
                    onClose={function (): void {
                        setIsOpenDialog(false);
                        fetchDept();
                    }}
                    entitas={entitas}
                    token={token}
                    userid={userid}
                    departemenSelected={departemSelected}
                    state={stateDialog}
                    refresh={(trigger: string) => {
                        if (trigger === 'next') {
                            fetchDept();
                        }
                    }}
                />
            )}
        </>
    );
};

export default FrmDepartemen;
