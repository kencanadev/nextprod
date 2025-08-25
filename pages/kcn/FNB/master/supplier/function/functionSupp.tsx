import React from 'react';

const functionSupp = () => {
    return <div>functionSupp</div>;
};

export default functionSupp;

export function dataURLtoFile(dataurl: string, filename: string) {
    let arr: any = dataurl.split(','),
        mime = arr[0]!.match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export const FileUploadDummy = {
    1: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 1,
    },
    2: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 2,
    },
    3: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 3,
    },
    4: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 4,
    },
    5: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 5,
    },
    6: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 6,
    },
    15: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 7,
    },
    7: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 8,
    },

    8: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 9,
    },
    9: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 10,
    },
    10: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 11,
    },
    11: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 12,
    },
    12: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 13,
    },
    13: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 14,
    },
    14: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 15,
    },
};

export const resetFilePendukung = () => {
    return {
        1: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 1,
        },
        2: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 2,
        },
        3: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 3,
        },
        4: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 4,
        },
        5: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 5,
        },
        6: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 6,
        },
        15: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 7,
        },
        7: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 8,
        },

        8: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 9,
        },
        9: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 10,
        },
        10: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 11,
        },
        11: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 12,
        },
        12: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 13,
        },
        13: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 14,
        },
        14: {
            renamedFile: null,
            fileUrl: null,
            tabIndex: 15,
        },
    };
};

export const ResetFileDummy = {
    1: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 1,
    },
    2: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 2,
    },
    3: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 3,
    },
    4: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 4,
    },
    5: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 5,
    },
    6: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 6,
    },
    15: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 7,
    },
    7: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 8,
    },

    8: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 9,
    },
    9: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 10,
    },
    10: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 11,
    },
    11: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 12,
    },
    12: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 13,
    },
    13: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 14,
    },
    14: {
        renamedFile: null,
        fileUrl: null,
        tabIndex: 15,
    },
};

export const downloadBase64Image = (base64Image: string, filename: string) => {
    const byteString = atob(base64Image.split(',')[1]); // Decode base64
    const mimeString = base64Image.split(',')[0].split(':')[1].split(';')[0]; // Extract mime type

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });

    // Create an object URL for the blob
    const blobUrl = URL.createObjectURL(blob);

    // Create a link element, set its href to the blob URL and download attribute
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;

    // Append link to the body, click it and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the object URL
    URL.revokeObjectURL(blobUrl);
};

export const HandleSearchNoRelasi = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarRelasiKredit: any) => {
    const searchValue = event;
    setStateDataHeader((prevState: any) => ({
        ...prevState,
        no_relasi: searchValue,
    }));

    const filteredData = searchDataNoRelasi(searchValue, dataDaftarRelasiKredit);

    setStateDataArray(filteredData);
};

const searchDataNoRelasi = (keyword: any, dataDaftarRelasiKredit: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftarRelasiKredit;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftarRelasiKredit.filter((item: any) => item.kode_relasi.toLowerCase().includes(keyword.toLowerCase()));
        return filteredData;
    }
};

export const HandleSearchNamaRelasi = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarRelasiKredit: any) => {
    const searchValue = event;
    setStateDataHeader((prevState: any) => ({
        ...prevState,
        nama_relasi: searchValue,
    }));

    const filteredData = searchDataNamaRelasi(searchValue, dataDaftarRelasiKredit);

    setStateDataArray(filteredData);
};

const searchDataNamaRelasi = (keyword: any, dataDaftarRelasiKredit: any) => {
    // Jika keyword kosong, kembalikan semua data
    if (keyword === '') {
        return dataDaftarRelasiKredit;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = dataDaftarRelasiKredit.filter((item: any) => item.nama_relasi.toLowerCase().includes(keyword.toLowerCase()));
        return filteredData;
    }
};
