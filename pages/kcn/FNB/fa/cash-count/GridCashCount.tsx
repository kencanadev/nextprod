import React, { useEffect, useState } from 'react';
import {
    Grid,
    GridComponent,
    ColumnDirective,
    ColumnsDirective,
    Inject,
    Page,
    Edit,
    Sort,
    Filter,
    Group,
    Resize,
    Reorder,
    Selection,
    ExcelExport,
    PdfExport,
    rowSelected,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { downloadBase64Image } from '../../master/kendaraan/function/function';
import axios from 'axios';
import { useSession } from '@/pages/api/sessionContext';
import { useRouter } from 'next/router';

const GridCashCount = ({
    list_kas_opname,
    selectedRowHandle,
    gridCashCount,
    recordDoubleClick,
}: {
    list_kas_opname: any;
    selectedRowHandle: any;
    recordDoubleClick: any;
    gridCashCount: Grid | any;
}) => {
    const { sessionData } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const router = useRouter();
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy HH:ss' };
    const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [indexPreview, setIndexPreview] = useState(0);
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [imageTipe, setImageTipe] = useState('');
    const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [isOpenPreviewDobel, setIsOpenPreviewDobel] = useState(false);
    const [isOpenPreviewDobelTtd, setIsOpenPreviewDobelTtd] = useState(false);
    const [zoomScale, setZoomScale] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [imageDataUrlTtd, setImageDataUrlTtd] = useState('');
    const [imageDataUrlTtp, setImageDataUrlTtp] = useState('');
    const [zoomScaleTtd, setZoomScaleTtd] = useState(0.5);
    const [positionTtd, setPositionTtd] = useState({ x: 0, y: 0 });
    const [rotationAngle, setRotationAngle] = useState(0);
    const HandleZoomIn = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    };

    const HandleZoomOut = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    };

    const HandleCloseZoom = (setIsOpenPreview: Function) => {
        setIsOpenPreview(false);
    };
    const [uploaldedFiles, setUploaldedFiles] = useState<any[]>([]);
    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);

    const handleMouseDown = (event: any) => {
        setIsDragging(true);
        setOffset({
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        });
    };

    const handleDownloadFile = () => {
        // const temp: any = uploaldedFiles.filter((item: any) => item.id_dokumen === indexPreview)[0];
        // temp === undefined ? null : downloadBase64Image(temp?.fileUrl, temp.fileNameOri);
    };

    const handleMouseMove = (event: any) => {
        if (isDragging) {
            setPosition({
                x: event.clientX - offset.x,
                y: event.clientY - offset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (event: any) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            // Scroll up
            setZoomScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
        } else {
            // Scroll down
            setZoomScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
        }
    };
    const headerNewLine = (value1: any, value2: any) => (
        <div style={{ textAlign: 'center', lineHeight: '1.5em' }}>
            {value1}
            <div>{value2}</div>
        </div>
    );

    const sokTemplate = (args: any) => {
        return <div className="text-center">{args.sok === 'Y' ? '✔️' : ''}</div>;
    };

    const sapTemplate = (args: any) => {
        return <div className="text-center">{args.sap === 'Y' ? '✔️' : ''}</div>;
    };

    const sfileTemplate = (args: any) => {
        return (
            <div className="text-center" onDoubleClick={() => previewGambar(args)}>
                {args.sfile === 'Y' ? '✔️' : ''}
            </div>
        );
    };

    const previewGambar = async (args: any) => {
        // console.log('args', args);
        if (args.fileopname !== null || args.fileopname !== '') {
            const resFilePendukung = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                params: {
                    entitas: kode_entitas,
                    nama_zip: `${args.fileopname.split('.')[0]}.zip`,
                    // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                },
            });
            const mimeType = resFilePendukung.data.images[0].imageUrl.split(':')[1].split(';')[0];
            // const blob = base64ToBlob(getImage.data.data[0].decodeBase64_string, mimeType);
            const file = new File([resFilePendukung.data.images[0].imageUrl], resFilePendukung.data.images[0].fileName, { type: mimeType });
            const temp = {
                file: file,
                fileUrl: resFilePendukung.data.images[0].imageUrl,
                id_dokumen: 1,
                fileNameOri: args.fileopname,
            };
            setUploaldedFiles((prevFiles) => [...prevFiles, temp]);
            setImageDataUrl(resFilePendukung.data.images[0].imageUrl);
            setImageTipe(temp.file.type);
            setIsOpenPreview(true);
        }
    };
    useEffect(() => {
        if (isOpenPreview) {
            window.addEventListener('wheel', handleWheel, { passive: false });
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isOpenPreview, handleMouseMove, handleMouseUp, handleWheel]);
    return (
        <>
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
                `}
            </style>
            <GridComponent
                id="gridListCashCount"
                locale="id"
                // dataSource={list_kas_opname}
                height={'60vh'}
                pageSettings={{
                    pageSize: 25,
                    pageCount: 5,
                    pageSizes: ['25', '50', '100', 'All'],
                }}
                rowSelected={selectedRowHandle}
                recordDoubleClick={recordDoubleClick}
                allowPaging={true}
                gridLines="Both"
                allowResizing={true}
                allowReordering={true}
                allowSorting={true}
                rowHeight={23}
                // rowDataBound={rowDataBound}
                ref={gridCashCount}
            >
                <ColumnsDirective>
                    <ColumnDirective field="tgl" type={'date'} format={formatDateYM} headerText="Tanggal" headerTextAlign="Center" textAlign="Center" width="80" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="no_akun" width="80" headerText="No. Akun" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="nama_akun" width="130" headerText="Nama Akun Kas" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective
                        field="nfisik"
                        format="N2"
                        headerTemplate={() => headerNewLine('saldo', 'Fisik')}
                        headerText="Tujuan"
                        headerTextAlign="Center"
                        textAlign="Right"
                        width="110"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        field="nsistem"
                        format="N2"
                        headerTemplate={() => headerNewLine('saldo', 'Sistem')}
                        headerText="Pengemudi"
                        headerTextAlign="Center"
                        textAlign="Right"
                        width="110"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        field="nselisih"
                        format="N2"
                        headerTemplate={() => headerNewLine('Selisih', 'Fisik-Sistem')}
                        headerText="Jumlah (MU)"
                        headerTextAlign="Center"
                        textAlign="Right"
                        width="110"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        field="napp"
                        format="N2"
                        headerTemplate={() => headerNewLine('Saldo', 'Belum Approved')}
                        headerText="Keterangan"
                        headerTextAlign="Center"
                        textAlign="Right"
                        width="110"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        field="sap"
                        template={sapTemplate}
                        headerTemplate={() => headerNewLine('Blm App.', 'Sesuai')}
                        headerText="Status"
                        headerTextAlign="Center"
                        textAlign="Left"
                        width="50"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        field="sok"
                        template={sokTemplate}
                        headerTemplate={() => headerNewLine('Jumlah', 'Sesuai')}
                        headerText="Status"
                        headerTextAlign="Center"
                        textAlign="Left"
                        width="50"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        field="sfile"
                        template={sfileTemplate}
                        headerTemplate={() => headerNewLine('File', 'Pendukung')}
                        headerText="Status"
                        headerTextAlign="Center"
                        textAlign="Left"
                        width="65"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective field="alasan" headerText="Catatan" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="userid" headerText="userid" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective
                        field="tgl_update"
                        type="date"
                        format={formatDate}
                        headerTemplate={() => headerNewLine('Tgl. Update', 'Terakhir')}
                        headerText="Tgl. Update"
                        headerTextAlign="Center"
                        textAlign="Left"
                        width="130"
                        clipMode="EllipsisWithTooltip"
                    />
                </ColumnsDirective>
                <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
            </GridComponent>
            {isOpenPreview && (
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: '1000',
                        overflow: 'hidden',
                    }}
                    // onClick={() => HandleCloseZoom(setIsOpenPreview)}
                >
                    <div
                        style={{
                            position: 'relative',
                            textAlign: 'center',
                            zIndex: '1001',
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                    >
                        {imageTipe.includes('image') ? (
                            <img
                                src={imageDataUrl}
                                alt={`Zoomed ${indexPreview}`}
                                style={{
                                    transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                    transition: 'transform 0.1s ease',
                                    cursor: 'pointer',
                                    maxWidth: '100vw',
                                    maxHeight: '100vh',
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                            />
                        ) : imageTipe.includes('video') ? (
                            <video
                                src={imageDataUrl}
                                style={{
                                    transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                    transition: 'transform 0.1s ease',
                                    cursor: 'pointer',
                                    maxWidth: '100vw',
                                    maxHeight: '100vh',
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                                controls
                                width={500}
                                height={500}
                            />
                        ) : (
                            <div>
                                <p className="text-white">Format Tidak Di Dukung, Silahkan download</p>
                                <button
                                    onClick={() => {
                                        const temp: any = uploaldedFiles.filter((item: any) => item.id_dokumen === indexPreview)[0];

                                        temp === undefined ? null : downloadBase64Image(temp?.fileUrl, temp.fileNameOri);
                                    }}
                                    className="mx-auto flex h-7 w-28 items-center justify-center rounded-md bg-[#3a3f5c] p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#2f3451]"
                                >
                                    Simpan ke file
                                </button>
                            </div>
                        )}
                    </div>
                    <div
                        style={{
                            position: 'fixed',
                            top: '10px',
                            right: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            zIndex: '1001',
                        }}
                    >
                        <ButtonComponent
                            id="zoomIn"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-zoom-in" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomIn(setZoomScale)}></span>
                        </ButtonComponent>

                        <ButtonComponent
                            id="zoomOut"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-zoom-out" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomOut(setZoomScale)}></span>
                        </ButtonComponent>

                        <ButtonComponent
                            cssClass="e-primary e-small"
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                marginTop: '-10px',
                            }}
                        >
                            <span className="e-icons e-undo" style={{ fontSize: '32px' }} onClick={handleRotateLeft}></span>
                        </ButtonComponent>
                        <ButtonComponent
                            cssClass="e-primary e-small"
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                marginTop: '-20px',
                            }}
                        >
                            <span className="e-icons e-redo" style={{ fontSize: '32px' }} onClick={handleRotateRight}></span>
                        </ButtonComponent>

                        <ButtonComponent
                            id="close"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-close" style={{ fontSize: '20px', fontWeight: 'bold' }} onClick={() => HandleCloseZoom(setIsOpenPreview)}></span>
                        </ButtonComponent>
                    </div>
                </div>
            )}
        </>
    );
};

export default GridCashCount;
