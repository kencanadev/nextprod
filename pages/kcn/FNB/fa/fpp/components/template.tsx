import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import React from 'react';

const templateFpp = () => {
    return <div>templateFpp</div>;
};

export default templateFpp;

export const editTemplateAkunBarang = (args: any, props: any) => {
    const { setSelectedRowIndex, setShowModalBarang, handleDiskripsiChange, setTambah } = props;

    return (
        <div>
            <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                    <input defaultValue={args.diskripsi} onBlur={(event: any) => handleDiskripsiChange(event.target.value, args.index)} className="w-24 bg-transparent" />
                    <span>
                        <ButtonComponent
                            id="buNoItem1"
                            type="button"
                            cssClass="e-primary e-small e-round"
                            iconCss="e-icons e-small e-search"
                            onClick={() => {
                                setSelectedRowIndex(args.index);
                                setShowModalBarang(true);
                            }}
                            style={{ backgroundColor: '#3b3f5c' }}
                        />
                    </span>
                </div>
            </TooltipComponent>
        </div>
    );
};

export const editTemplateKendaraan = (args: any, props: any) => {
    const { setSelectedRowIndex, setShowModalKendaraan } = props;
    return (
        <div>
            <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                    <TextBoxComponent value={args.nopol} readOnly={true} showClearButton={false} />
                    <span>
                        <ButtonComponent
                            id="buNoItem1"
                            type="button"
                            cssClass="e-primary e-small e-round"
                            iconCss="e-icons e-small e-search"
                            onClick={() => {
                                setSelectedRowIndex(args.index);
                                setShowModalKendaraan(true);
                            }}
                            style={{ backgroundColor: '#3b3f5c' }}
                        />
                    </span>
                </div>
            </TooltipComponent>
        </div>
    );
};

export const editTemplateSatuanBarang = (args: any, props: any) => {
    const { dataSource, onChange } = props;
    return (
        <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
            {/* <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.departemen} readOnly={true} showClearButton={false} /> */}
            <DropDownListComponent
                popupWidth={'100px'}
                id="satuan"
                name="satuan"
                dataSource={dataSource}
                fields={{ value: 'satuan', text: `satuan` }}
                floatLabelType="Never"
                placeholder={args.satuan}
                value={args.satuan}
                onChange={(e: any) => {
                    onChange(e, args.index);
                }}
            />
        </div>
    );
};
