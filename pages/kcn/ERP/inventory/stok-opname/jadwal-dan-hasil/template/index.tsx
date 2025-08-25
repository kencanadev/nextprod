import { useSession } from '@/pages/api/sessionContext';
import { faCamera, faFolder, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React from 'react';
import { fetchDetailOpname, simpanOpnameData } from '../api';
import JSZip from 'jszip';
import moment from 'moment';
import Swal from 'sweetalert2';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

export const TemplateHasilOpname = (args: any) => {
    return (
        <div className="flex items-center justify-center" style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
            {args.hasil === 'Y' ? (
                <input
                    readOnly={true}
                    style={{
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        borderRadius: '5px', // Atur sesuai dengan kebutuhan
                        fontSize: '16px', // Sesuaikan ukuran font
                    }}
                    value={'✔'}
                />
            ) : null}
        </div>
    );
};

export const TemplateHasilTimbang = (args: any) => {
    return (
        <div className="flex items-center justify-center" style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
            {args.timbang === 'Y' ? (
                <input
                    readOnly={true}
                    style={{
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        borderRadius: '5px', // Atur sesuai dengan kebutuhan
                        fontSize: '16px', // Sesuaikan ukuran font
                    }}
                    value={'✔'}
                />
            ) : null}
        </div>
    );
};

export const TemplateCheckboxSimpan = (args: any, gridRef: any) => {
    const handleChange = (e: any) => {
        const newData = {
            ...args,
            simpan: e.target.checked ? 'Y' : 'N',
        };

        gridRef.current.dataSource[args.index] = newData;
        gridRef.current.refresh();
    };

    return (
        <div className="flex items-center justify-center text-center">
            <input type="checkbox" checked={args.simpan === 'Y' ? true : false} onChange={handleChange} />
        </div>
    );
};

export const TemplateCheckboxGenerate = (args: any) => {
    return (
        <div className="flex items-center justify-center text-center">
            <input type="checkbox" checked={args.generate === 'Y' ? true : false} readOnly />
        </div>
    );
};

export const TemplateHeaderBerat = () => {
    return (
        <div>
            <span>Hasil Timbang</span>
            <br />
            <span>(Kg)</span>
        </div>
    );
};

export const TemplateHeaderPanjang = () => {
    return (
        <div>
            <span>Total Panjang Barang</span>
            <br />
            <span>yang Patah</span>
        </div>
    );
};

export const TemplateTombol = (args: any, setHasilTimbang: any, setPreviewImg: any, setShowPreviewImg: any, gridRef: any) => {
    const { sessionData, isLoading } = useSession();

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const params = {
            entitas: kode_entitas,
            param1: args.kode_opname,
            param2: 'MD',
        };
        const response = await fetchDetailOpname({ params, token });
        const { master, detail } = response;
        console.log('insertResponseeeeecccccc', detail, response, 'sss');

        const file = event.target?.files?.[0];
        if (file) {
            const fileName = file.name.toLowerCase();
            const lastDotIndex = fileName.lastIndexOf('.');
            const fileExt = fileName.slice(lastDotIndex + 1).toLowerCase();

            // IMG_600_OB0000000657_L1.jpg
            const nameImage = `IMG_${kode_entitas}_${args.kode_opname}_L${args.id_opname}.${fileExt}`;
            const nameImage2 = `IMG_${kode_entitas}_${args.kode_opname}_L${args.id_opname}.zip`;

            const zip = new JSZip();
            zip.file(nameImage, file);

            try {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const formData = new FormData();
                formData.append('myimage', zipBlob);
                formData.append('ets', kode_entitas);
                formData.append('nama_file_image', nameImage2);

                const response = await axios.post(`${apiUrl}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (response.status === 200) {
                    const combinedArray: any[] = [
                        {
                            entitas: kode_entitas,
                            kode_dokumen: args.kode_opname,
                            id_dokumen: args.id_opname,
                            dokumen: 'OP',
                            filegambar: nameImage,
                            fileoriginal: file.name,
                        },
                    ];

                    try {
                        const insertResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, combinedArray);

                        if (insertResponse.data.status) {
                            const modifiedDetail = detail.map((item: any) => {
                                if (item.id_opname === args.id_opname) {
                                    return {
                                        ...item,
                                        filetimbang: nameImage,
                                        tombol: 'Y',
                                    };
                                }

                                return item;
                            });

                            const modifiedBody = {
                                ...master,
                                entitas: kode_entitas,
                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                detail: modifiedDetail,
                            };

                            const res = await simpanOpnameData({ body: modifiedBody, token });

                            if (res.status) {
                                const data = await fetchDetailOpname({ params, token });

                                const { detail } = data;

                                const modifiedDetail = detail.map((item: any) => ({
                                    ...item,
                                    berat: parseFloat(item.berat),
                                    qty: parseFloat(item.qty),
                                    panjang: parseFloat(item.panjang),
                                    tgl_sistem: item.tgl_sistem === null ? null : moment(item.tgl_sistem).format('DD-MM-YYYY HH:mm'),
                                }));

                                setHasilTimbang(modifiedDetail);

                                // gridRef.current.dataSource[args.]
                                gridRef.current.setProperties({ dataSource: modifiedDetail });
                                gridRef.current.refresh();
                            }
                        }
                    } catch (error) {
                        console.error('error saat menyimpan data baru: ', error);
                    }
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };

    const handleLoadImg = async () => {
        console.log('sssssc', args);
        const filename = args.filetimbang;
        const newFilename = filename.replace(/\.(jpg|jpeg|png|pdf)$/i, '.zip');

        try {
            const response = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                params: {
                    entitas: kode_entitas,
                    nama_zip: newFilename,
                },
            });

            const url = response.data.images[0].imageUrl;
            const tipe = getMimeTypeFromBase64(url);
            if (tipe === 'application/pdf') {
                const byteCharacters = atob(url.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Create a URL for the blob and open it in a new tab
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');

                // Clean up the URL object after the tab is opened
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 100);
            } else {
                // setImgUrl && setOpenPreview
                setShowPreviewImg(true);
                setPreviewImg(url);
            }
        } catch (error) {}
    };

    const handleDeleteImg = async () => {
        const params = {
            entitas: kode_entitas,
            param1: args.kode_opname,
        };
        const response = await fetchDetailOpname({ params, token });
        const { master, detail } = response;

        const modifiedDetail = detail.map((item: any) => {
            if (item.id_opname === args.id_opname) {
                return {
                    ...item,
                    filetimbang: null,
                };
            }

            return item;
        });

        const modifiedBody = {
            ...master,
            entitas: kode_entitas,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            detail: modifiedDetail,
        };

        try {
            const res = await simpanOpnameData({ body: modifiedBody, token });

            if (res.status) {
                const data = await fetchDetailOpname({ params, token });
                console.log(data);
                const { detail } = data;

                const modifiedDetail = detail.map((item: any) => ({
                    ...item,
                    berat: parseFloat(item.berat),
                    qty: parseFloat(item.qty),
                    panjang: parseFloat(item.panjang),
                    tgl_sistem: item.tgl_sistem === null ? null : moment(item.tgl_sistem).format('DD-MM-YYYY HH:mm'),
                }));

                setHasilTimbang(modifiedDetail);
                gridRef.current.setProperties({ dataSource: modifiedDetail });
                gridRef.current.refresh();
            }
        } catch (error) {
            console.error('error deleting image: ', error);
        }
    };

    const alertDelete = () => {
        Swal.fire({
            icon: 'question',
            text: `Hapus dokumen pendukung Foto Timbangan No Sequence: ${args.id_opname}`,
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
            backdrop: true,
            target: '#dialogHasilOpname',
        }).then((res) => {
            if (res.isConfirmed) {
                handleDeleteImg();
            }
        });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
                {args.tombol1 === 'Y' ? (
                    <input
                        readOnly={true}
                        style={{
                            width: '100%',
                            height: '100%',
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            borderRadius: '5px',
                            fontSize: '16px',
                        }}
                        value={'✔'}
                    />
                ) : null}
            </div>
            <div className="flex items-center gap-1">
                {args.filetimbang === null || args.filetimbang === '' ? (
                    <>
                        <input type="file" accept="image/*" id={`${args.kode_opname}_1`} onChange={(e) => handleFileSelect(e)} hidden />
                        <label style={{ fontWeight: 'bold', fontSize: '14px' }} htmlFor={`${args.kode_opname}_1`}>
                            {args.filetimbang === '' || args.filetimbang === null ? <FontAwesomeIcon icon={faFolder} width="18" height="18" /> : null}
                        </label>
                    </>
                ) : (
                    <>
                        <div onClick={alertDelete} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {args.filetimbang !== '' ? <FontAwesomeIcon icon={faStop} width="18" height="18" /> : null}
                        </div>
                        <div
                            onClick={() => {
                                handleLoadImg();
                            }}
                            style={{ fontWeight: 'bold', fontSize: '14px' }}
                        >
                            {args.gambar !== '' ? <FontAwesomeIcon icon={faCamera} width="18" height="18" /> : null}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export const TemplateGudangAsal = (args: any, props: any) => {
    const { setShowDialgGd, setGdField } = props;
    return (
        <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
            <input defaultValue={args.nama_asal} className="w-24 bg-transparent" />
            <span>
                <ButtonComponent
                    id="buNoItem1"
                    type="button"
                    cssClass="e-primary e-small e-round"
                    iconCss="e-icons e-small e-search"
                    onClick={() => {
                        // setSelectedRowIndex(args.index);
                        setGdField(args.column.field);
                        setShowDialgGd(true);
                        // setShowModalBarang(true);
                    }}
                    style={{ backgroundColor: '#3b3f5c' }}
                />
            </span>
        </div>
    );
};

export const TemplateGudangTujuan = (args: any, props: any) => {
    const { setShowDialgGd, setGdField } = props;
    return (
        <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
            <input defaultValue={args.nama_tujuan} className="w-24 bg-transparent" />
            <span>
                <ButtonComponent
                    id="buNoItem1"
                    type="button"
                    cssClass="e-primary e-small e-round"
                    iconCss="e-icons e-small e-search"
                    onClick={() => {
                        // setSelectedRowIndex(args.index);
                        setGdField(args.column.field);
                        setShowDialgGd(true);
                        // setShowModalBarang(true);
                    }}
                    style={{ backgroundColor: '#3b3f5c' }}
                />
            </span>
        </div>
    );
};

export const TemplateGudangStok = (args: any, props: any) => {
    const { setShowDialgGd, setGdField } = props;
    return (
        <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
            <input defaultValue={args.nama_gudang} className="w-24 bg-transparent" />
            <span>
                <ButtonComponent
                    id="buNoItem1"
                    type="button"
                    cssClass="e-primary e-small e-round"
                    iconCss="e-icons e-small e-search"
                    onClick={() => {
                        // setSelectedRowIndex(args.index);
                        setGdField(args.column.field);
                        setShowDialgGd(true);
                        // setShowModalBarang(true);
                    }}
                    style={{ backgroundColor: '#3b3f5c' }}
                />
            </span>
        </div>
    );
};

export const EditTemplatePsPlus = (args: any, props: any) => {
    const { dataSource, onChange } = props;
    return (
        <div className={`col-xs-6 col-sm-6 col-lg-6 col-md-6`}>
            {/* <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.departemen} readOnly={true} showClearButton={false} /> */}
            <DropDownListComponent
                popupWidth={'200px'}
                id="alasanPlus"
                name="alasanPlus"
                dataSource={dataSource}
                fields={{ value: 'text', text: `text` }}
                floatLabelType="Never"
                placeholder={args.alasanPlus}
                value={args.alasanPlus}
                onChange={(e: any) => {
                    onChange(e, args.index);
                }}
            />
        </div>
    );
};

export const EditTemplatePsMinus = (args: any, props: any) => {
    const { dataSource, onChange } = props;
    return (
        <div className={`col-xs-6 col-sm-6 col-lg-6 col-md-6`}>
            {/* <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.departemen} readOnly={true} showClearButton={false} /> */}
            <DropDownListComponent
                popupWidth={'200px'}
                id="alasanMin"
                name="alasanMin"
                dataSource={dataSource}
                fields={{ value: 'text', text: `text` }}
                floatLabelType="Never"
                placeholder={args.alasanMin}
                value={args.alasanMin}
                onChange={(e: any) => {
                    onChange(e, args.index);
                }}
            />
        </div>
    );
};

const TemplateJadwalHasil = () => {
    return <div>TemplateJadwalHasil</div>;
};

function getMimeTypeFromBase64(base64: string): string {
    const mimeMatch = base64.match(/^data:(.*?);base64,/);

    if (mimeMatch) {
        return mimeMatch[1];
    }

    return 'application/octet-stream';
}

export default TemplateJadwalHasil;
