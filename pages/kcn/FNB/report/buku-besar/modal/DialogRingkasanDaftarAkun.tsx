import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { Inject } from '@syncfusion/ej2-react-grids';
import withReactContent from 'sweetalert2-react-content';

interface DialogRingkasanDaftarAkunProps {
    visible: boolean;
    stateDataHeader: any;
    setStateDataHeader: Function;
}

const DialogRingkasanDaftarAkun: React.FC<DialogRingkasanDaftarAkunProps> = ({ visible, stateDataHeader, setStateDataHeader }) => {
    const closeModalShowBaru = () => {
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            dialogFilterRingkasanDaftarAkun: false,
        }));
    };

    //================ Disable hari minggu di calendar ==============
    function onRenderDayCell(args: RenderDayCellEventArgs): void {
        if ((args.date as Date).getDay() === 0) {
            args.isDisabled = true;
        }
    }

    const showNewRecord = () => {};

    return (
        <DialogComponent
            id="dialogFilterRingkasanDaftarAkun"
            name="dialogFilterRingkasanDaftarAkun"
            className="dialogFilterRingkasanDaftarAkun"
            target="#main-target"
            // header="Pembayaran Hutang"
            header={() => {
                let header: JSX.Element | string = '';
                header = (
                    <div>
                        <div className="header-title">Ringkasan Daftar Akun</div>
                    </div>
                );

                return header;
            }}
            visible={visible}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            enableResize={true}
            resizeHandles={['All']}
            allowDragging={true}
            showCloseIcon={true}
            width="18%" //"70%"
            height="26%"
            position={{ X: 'center', Y: 350 }}
            style={{ position: 'fixed' }}
            close={closeModalShowBaru}
            // buttons={buttonInputData}
        >
            <div>
                <div className="flex">
                    <div
                        style={{
                            width: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '4.5vh', // atau tinggi yang sesuai dengan kebutuhan Anda
                        }}
                    >
                        <h5 style={{ fontWeight: 'bold', fontSize: 13 }}> Sampai dengan tanggal</h5>
                    </div>
                    <div style={{ width: '50%' }}>
                        <div className="form-input mt-1 flex justify-between">
                            <DatePickerComponent
                                locale="id"
                                cssClass="e-custom-style"
                                renderDayCell={onRenderDayCell}
                                enableMask={true}
                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                showClearButton={false}
                                format="dd-MM-yyyy"
                                value={stateDataHeader?.date1.toDate()}
                                // change={(args: ChangeEventArgsCalendar) => {
                                //     HandleTglPhu(moment(args.value), 'tanggalAwal', setFilterData, setCheckboxFilter);
                                // }}
                            >
                                <Inject services={[MaskedDateTime]} />
                            </DatePickerComponent>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex">
                <div style={{ width: '4.5%' }}>
                    <div className="mt-2 flex justify-between" style={{ marginLeft: '11px', marginTop: '7px' }}>
                        <CheckBoxComponent
                            // label="Termasuk Saldo Nol"
                            checked={stateDataHeader?.isCheckedSaldoNol}
                            // change={(args: ChangeEventArgsButton) => {
                            //     const value: any = args.checked;
                            //     setCheckboxFilter((prevState: any) => ({
                            //         ...prevState,
                            //         isNoSupplierChecked: value,
                            //     }));
                            // }}
                        />
                    </div>
                </div>
                <div style={{ width: '95.5%' }}>
                    <div
                        style={{
                            width: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '4.5vh', // atau tinggi yang sesuai dengan kebutuhan Anda
                        }}
                    >
                        <h5 style={{ fontWeight: 'bold', fontSize: '13px', marginTop: '-14px' }}> Termasuk Saldo Nol</h5>
                    </div>
                </div>
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
                    height: '45px',
                    display: 'inline-block',
                    overflowX: 'scroll',
                    overflowY: 'hidden',
                    scrollbarWidth: 'none',
                }}
            >
                <ButtonComponent
                    id="buBatal"
                    content="Batal"
                    cssClass="e-primary e-small"
                    iconCss="e-icons e-small e-close"
                    style={{ float: 'right', width: '74px', marginTop: 1 + 'em', marginRight: 2.2 + 'em', backgroundColor: '#3b3f5c' }}
                    onClick={closeModalShowBaru}
                />
                <ButtonComponent
                    id="buSimpan"
                    content="OK"
                    cssClass="e-primary e-small"
                    iconCss="e-icons e-small e-check"
                    style={{ float: 'right', width: '74px', marginTop: 1 + 'em', marginRight: 1.3 + 'em', backgroundColor: '#3b3f5c' }}
                    onClick={() => showNewRecord()}
                />
            </div>
        </DialogComponent>
    );
};

export default DialogRingkasanDaftarAkun;
