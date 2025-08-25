import * as React from 'react';
import * as ReactDOM from 'react-dom';
import moment from 'moment';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Inject } from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);

interface ReportDlgCabangProps {
    stateDokumen: any;
    isOpen: boolean;
    onClose: any;
    onBatal: any;
    target: any;
    objekParameter: any;
}

const ReportDlgCabang = ({ stateDokumen, isOpen, onClose, onBatal, target, objekParameter }: ReportDlgCabangProps) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [checked, setChecked] = useState([]);
    const [dataCekList, setDataCekList] = useState<any[]>([]);
    const [dataOperatorCek, setDataOperatorCek] = useState<any[]>([]);
    const [reportParameter, setReportParameter] = useState({
        operator: 'all',
        nama_cabang: [],
        edText: '',
    });
    const [dtTglAwal, setDtTglAwal] = useState<moment.Moment>(moment());
    const [dtTglAkhir, setDtTglAkhir] = useState<moment.Moment>(moment().endOf('month'));

    let buttonInputData: ButtonPropsModel[];

    let fieldsdataCekList = { text: 'text', id: 'id' };

    let settings: { [key: string]: Object }[] = [{ text: 'Cabang', id: 'list-01' }];
    let fields = { text: 'text', id: 'id' };

    const isTextBoxEnabled = () => {
        const allChecked = dataOperatorCek.some((item) => item.id === 'all' && item.checked);
        const anyChecked = dataOperatorCek.some((item) => item.checked && item.id !== 'all');
        return !allChecked && (anyChecked || !dataOperatorCek.length);
    };

    const dataCabang = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/entitas_pajak?entitas=${stateDokumen.kode_entitas}&param1=${stateDokumen.userid}`, {
                headers: {
                    Authorization: `Bearer ${stateDokumen.token}`,
                },
            });

            const data = response.data.data;
            const tamahanData = [
                {
                    text: 'Semua',
                    id: 'all',
                    checked: true,
                },
                {
                    text: 'Berisi Kata ...........(Ketik kata di bawah)',
                    id: '1',
                    checked: false,
                },
                {
                    text: 'Tidak Berisi Kata ...........(Ketik kata di bawah)',
                    id: '2',
                    checked: false,
                },
                {
                    text: 'Kata Yang Sama Persis ...........(Ketik kata di bawah)',
                    id: '3',
                    checked: false,
                },
                {
                    text: 'Bukan Kata Yang Sama Persis ...........(Ketik kata di bawah)',
                    id: '4',
                    checked: false,
                },
                {
                    text: 'Diawali Dengan ...........(Ketik kata di bawah)',
                    id: '5',
                    checked: false,
                },
                {
                    text: 'Tidak Diawali Dengan ...........(Ketik kata di bawah)',
                    id: '6',
                    checked: false,
                },
                {
                    text: 'Diakhiri Dengan ...........(Ketik kata di bawah)',
                    id: '7',
                    checked: false,
                },

                {
                    text: 'Tidak Diakhiri Dengan ...........(Ketik kata di bawah)',
                    id: '8',
                    checked: false,
                },
            ];

            const dataCabang = data.map((item: any, index: any) => ({
                text: item.kodecabang + ' ' + item.cabang,
                id: index,
                name: item.cabang,
                checked: false,
            }));
            setDataCekList(dataCabang);
            setDataOperatorCek(tamahanData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleOperatorCheckbox = (event: any, id: string) => {
        if (id === 'all') {
            setDataOperatorCek((prevData) =>
                prevData.map((item) => ({
                    ...item,
                    checked: item.id === 'all' ? event.target.checked : false,
                }))
            );
            setReportParameter((prevFormData: any) => ({
                ...prevFormData,
                operator: 'all',
            }));
        } else {
            setDataOperatorCek((prevData) =>
                prevData.map((item) => ({
                    ...item,
                    checked: item.id === id ? event.target.checked : false,
                }))
            );
            setReportParameter((prevFormData: any) => ({
                ...prevFormData,
                operator: event.target.checked ? id : 'all',
            }));
        }
    };
    const handleNamaEntitasCheckbox = (event: any, id: number, name: string) => {
        const checked = event.target.checked;

        setDataCekList((prevData) => prevData.map((item) => (item.id === id ? { ...item, checked } : item)));

        if (checked) {
            setReportParameter((prev: any) => ({
                ...prev,
                nama_cabang: [...prev.nama_cabang, name],
            }));
        } else {
            setReportParameter((prev) => ({
                ...prev,
                nama_cabang: prev.nama_cabang.filter((nama) => nama !== name),
            }));
        }
    };

    const simpan = async () => {
        const entitas = stateDokumen.kode_entitas;
        const param1 = moment(dtTglAwal).format('YYYY-MM-DD');
        const param2 = moment(dtTglAkhir).format('YYYY-MM-DD');
        const param4 = reportParameter.operator;
        const param5 = reportParameter.edText;
        const param6 = reportParameter.nama_cabang.join(';');
        const paramList = {
            entitas: entitas,
            param1: param1,
            param2: param2,
            param3: 'Lokal',
            param4: param4,
            param5: param5 ? param5 : 'all',
            param6: param6 ? param6 : 'all',
        };
        objekParameter(paramList);
        console.log(paramList, 'paramList')
    };
    buttonInputData = [
        {
            buttonModel: {
                content: 'OK',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: simpan,
        },
        {
            buttonModel: {
                content: 'Batal',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: onClose,
        },
    ];

    const handleInputChange = async (name: any, value: any) => {
        if (name === 'edTglAwal') {
            setDtTglAwal(value);
        } else if (name === 'edTglAkhir') {
            setDtTglAkhir(value);
        } else if (name === 'edText') {
            setReportParameter((prev: any) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    useEffect(() => {
        setDtTglAwal(moment());
        setDtTglAkhir(moment().endOf('month'));
        setDataCekList([]);
        setReportParameter({
            operator: 'all',
            nama_cabang: [],
            edText: '',
        });
        dataCabang();
    }, [isOpen]);

    return (
        <DialogComponent
            id="frmReportDlgFpbCabang"
            name="frmReportDlgFpbCabang"
            className="frmReportDlgFpbCabang"
            target={`#${target}`}
            visible={isOpen}
            style={{ position: 'fixed' }}
            header={'Report Dialog FPB'}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            enableResize={true}
            allowDragging={true}
            showCloseIcon={true}
            width="40%"
            height="65%"
            position={{ X: 'center', Y: 'center' }}
            close={() => {
                onClose();
            }}
            closeOnEscape={true}
        >
            <div>
                <div className="mb-5 flex items-center justify-between">
                    <h5 className="text-lg font-semibold dark:text-white-light">1. Filter & Parameter</h5>
                </div>
                <div>
                    <Tab.Group>
                        <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? '!border-white-light !border-b-white  text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black ' : ''
                                        } -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                                    >
                                        Filter
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? '!border-white-light !border-b-white  text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black ' : ''
                                        } -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                                    >
                                        Parameter
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>

                        <Tab.Panels>
                            <Tab.Panel style={{ width: '100%', height: '50%' }}>
                                <div>
                                    <div className="flex gap-3  p-2">
                                        <div className="w-[40%]">
                                            <ListViewComponent id="list" dataSource={settings} fields={fields} showCheckBox={false} checkBoxPosition="Right" />
                                        </div>
                                        <div className="flex  w-[60%] flex-col">
                                            <div className="max-h-[295px] overflow-y-auto">
                                                {dataOperatorCek.map((item) => {
                                                    return (
                                                        <div className="mb-2 flex items-center gap-3" key={item.id}>
                                                            <input type="checkbox" name="checked_tanggalMulai" checked={item.checked} onChange={(e) => handleOperatorCheckbox(e, item.id)} />
                                                            <span className="font-bold text-[#8B374B]">{item.text}</span>
                                                        </div>
                                                    );
                                                })}
                                                {dataCekList.map((item) => {
                                                    return (
                                                        <div className="mb-2 flex items-center gap-3" key={item.id}>
                                                            <input
                                                                type="checkbox"
                                                                name="checked_tanggalMulai"
                                                                checked={item.checked}
                                                                onChange={(e) => handleNamaEntitasCheckbox(e, item.id, item.name)}
                                                            />
                                                            <span className="font-bold text-[#8B374B]">{item.text}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mb-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                                            <div style={{ textAlign: 'center' }} className={`form-input flex items-center gap-1`}>
                                                <TextBoxComponent
                                                    name="edText"
                                                    placeholder="<Pencarian Data List>"
                                                    floatLabelType="Never"
                                                    value={reportParameter.edText || ''}
                                                    enabled={isTextBoxEnabled()}
                                                    onChange={(args: any) => handleInputChange(args.target.name, args.value)}
                                                />
                                                {dataOperatorCek.some((item) => item.id === '3' && item.checked) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {}}
                                                        className="inline-flex items-center rounded-lg bg-[#eee] px-2 py-1 text-center text-xs font-medium text-white hover:bg-gray-200"
                                                    >
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-3 w-3 text-gray-900" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab.Panel>
                            <Tab.Panel style={{ width: '100%', height: '50%' }}>
                                {/* <div className="flex gap-3  p-2"> */}
                                {/* <div className="mt-2 flex w-[30%] gap-3 p-2"> */}
                                <div className="ml-4 mt-4   flex gap-3  p-2">
                                    <p className="set-font-24 ml-0.5 mr-0.5 mt-3 inline-flex ">Dari Tanggal :</p>
                                    <div className="form-input mt-1 inline-flex w-[23%]  justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            name="edTglAwal"
                                            cssClass="e-custom-style"
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(dtTglAwal).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                handleInputChange('edTglAwal', moment(args.value).format('YYYY-MM-DD'));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>
                                <div className="ml-6 flex gap-3  p-2">
                                    <p className="set-font-24 ml-0.5 mr-0.5 mt-3 inline-flex ">s/d Tanggal :</p>
                                    <div className="form-input mt-1 inline-flex w-[23%]  justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            name="edTglAkhir"
                                            cssClass="e-custom-style"
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(dtTglAkhir).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                handleInputChange('edTglAkhir', moment(args.value).format('YYYY-MM-DD hh:mm:ss'));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>
                                <div className="mb-5 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
                <div
                    style={{
                        backgroundColor: '#F2FDF8',
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        borderBottomLeftRadius: '6px',
                        borderBottomRightRadius: '6px',
                        width: '100%',
                        height: '55px',
                        display: 'inline-block',
                        overflowX: 'scroll',
                        overflowY: 'hidden',
                        scrollbarWidth: 'none',
                    }}
                >
                    <div className="flex justify-between">
                        <div className="w-[100%]">
                            <ButtonComponent
                                id="buBatal"
                                content="BATAL"
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-small e-close"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={() => onClose()}
                            />
                            <ButtonComponent
                                id="buOk"
                                content="OK"
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-small e-save"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={simpan}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DialogComponent>
    );
};
export default ReportDlgCabang;
