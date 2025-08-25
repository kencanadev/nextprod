import React from 'react';

export const checkboxEditTemplate2 = () => {
    let inputElement: HTMLInputElement;

    return {
        // Create the checkbox element
        create: () => {
            inputElement = document.createElement('input');
            inputElement.type = 'checkbox';
            inputElement.style.cursor = 'pointer';
            return inputElement;
        },

        // Return the value to update in the grid data
        read: () => {
            return inputElement.checked ? 'Y' : 'N';
        },

        // Initialize the checkbox value from the row data
        write: (args: any) => {
            inputElement.checked = args.rowData[args.column.field] === 'Y';
        },

        // Clean up if needed
        destroy: () => {
            inputElement.remove();
        },
    };
};

// export const getCurrentRowDOMValues = (index: number) => {
//     const getInput = (name: string): string => (document.querySelector(`input[name="${name}-${index}"]`) as HTMLInputElement)?.value || '';

//     const getCheckbox = (name: string): string => ((document.querySelector(`input[name="${name}-${index}"]`) as HTMLInputElement)?.checked ? 'Y' : 'N');

//     return {
//         ekspedisi: getInput('ekspedisi'),
//         tonase: getInput('tonase'),
//         pic: getInput('pic'),
//         hp: getInput('hp'),
//         npwp: getInput('npwp'),
//         bank: getInput('bank'),
//         norek: getInput('norek'),
//         nama_rek: getInput('nama_rek'),
//         bank_ppn: getInput('bank_ppn'),
//         norek_ppn: getInput('norek_ppn'), // 🛠 typo fixed
//         nama_rek_ppn: getInput('nama_rek_ppn'),
//         aktif: getCheckbox('aktif'),
//     };
// };

export const getCurrentRowDOMValues = (index: number) => {
    console.log('index ddd', index);
    const ekspedisi = (document.querySelector(`input[name="ekspedisi-${index}"]`) as HTMLInputElement)?.value || '';
    const tonase = (document.querySelector(`input[name="tonase-${index}"]`) as HTMLInputElement)?.value || '';
    const pic = (document.querySelector(`input[name="pic-${index}"]`) as HTMLInputElement)?.value || '';
    const hp = (document.querySelector(`input[name="hp-${index}"]`) as HTMLInputElement)?.value || '';
    const npwp = (document.querySelector(`input[name="npwp-${index}"]`) as HTMLInputElement)?.value || '';
    const bank = (document.querySelector(`input[name="bank-${index}"]`) as HTMLInputElement)?.value || '';
    const norek = (document.querySelector(`input[name="norek-${index}"]`) as HTMLInputElement)?.value || '';
    const nama_rek = (document.querySelector(`input[name="nama_rek-${index}"]`) as HTMLInputElement)?.value || '';
    const bank_ppn = (document.querySelector(`input[name="bank_ppn-${index}"]`) as HTMLInputElement)?.value || '';
    const norek_ppn = (document.querySelector(`input[name="norek_ppn-${index}"]`) as HTMLInputElement)?.value || '';
    const nama_rek_ppn = (document.querySelector(`input[name="nama_rek_ppn-${index}"]`) as HTMLInputElement)?.value || '';
    const aktif = (document.querySelector(`input[name="aktif-${index}"]`) as HTMLInputElement)?.checked ? 'Y' : 'N';

    return {
        ekspedisi,
        tonase,
        pic,
        hp,
        npwp,
        bank,
        norek,
        nama_rek,
        bank_ppn,
        norek_ppn,
        nama_rek_ppn,
        aktif,
    };
};
