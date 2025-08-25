import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment } from 'react';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { fetchFilterItems, selectFilterItems } from '../api/api';
import { myAlertGlobal } from '@/utils/global/fungsi';

interface AlasanDlgProps {
    stateDokumen: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: any;
    onRefreshTipe: any;
    selectedData: any;
    onPilih: (value: string) => void;
}

const AlasanDlg: React.FC<AlasanDlgProps> = ({ stateDokumen, isOpen, onClose, onRefresh, onRefreshTipe, selectedData, onPilih }) => {
    const [textAreaValue, setTextAreaValue] = useState('');

    const handlePilih = () => {
        // console.log('textAreaValue ', textAreaValue);
        // Add your logic here
        // alert(`Pilih button clicked. TextArea value: ${textAreaValue}`);
        onPilih(textAreaValue);
        // onClose();
    };

    useEffect(() => {
        // console.log('Dialog Open:', isOpen);
        if (isOpen) {
            setTextAreaValue(''); // Reset the textarea value when the dialog opens
        }
    }, [isOpen]);

    return (
        <DialogComponent
            width="400px"
            height="250px"
            visible={isOpen}
            header="Form Keterangan Koreksi Hasil Rencek"
            // showCloseIcon={true}
            target="#frmFpmb"
            close={onClose}
            isModal={true}
            footerTemplate={() => (
                <div className="flex justify-end space-x-2" style={{ backgroundColor: 'white' }}>
                    <ButtonComponent content="Batal" cssClass="e-primary e-small" style={{ width: '90px', backgroundColor: '#3b3f5c' }} onClick={onClose} />
                    <ButtonComponent content="Ok" cssClass="e-primary e-small" style={{ width: '90px', backgroundColor: '#3b3f5c' }} onClick={handlePilih} />
                </div>
            )}
        >
            <div className="p-4">
                <label className="mb-1 block text-sm">Keterangan Koreksi Hasil Rencek.</label>
                <textarea
                    className="h-32 w-full border border-gray-400 p-1"
                    value={textAreaValue}
                    onChange={(event) => {
                        const newValue = event.target.value; // Capture the new value

                        setTextAreaValue(newValue); // Update the state
                    }}
                ></textarea>
            </div>
        </DialogComponent>
    );
};

export default AlasanDlg;
