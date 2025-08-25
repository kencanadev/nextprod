import React, { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faBookBookmark } from '@fortawesome/free-solid-svg-icons';
import { categoriesLaporanKeuangan } from '../model/api';
import moment from 'moment';
import BaseDialog from './modal/BaseDialog';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Inject } from '@syncfusion/ej2-react-grids';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import KasWarkatDialog from './modal/KasWarkatDialog';
import axios from 'axios';
import { harian_kas_warkat } from './utils';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

interface tabLaporanKeuanganProps {
    userid: any;
    kode_entitas: any;
    token: any;
    sidebarVisible: any;
}

const TabLaporanKeuangan: React.FC<tabLaporanKeuanganProps> = ({ userid, kode_entitas, token, sidebarVisible }) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [selectedId, setSelectedId] = useState<any>(null);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [isBaseDialogOpen, setIsBaseDialogOpen] = useState(false);
    const [dialogKasWarkat, setDialogKasWarkat] = useState(false);
    const [akun_kasLaporan, setAkun_kasLaporan] = useState([]);
    const [detailApiMenu, setDetailApiMenu] = useState({});
    const [laporanHarianState, setLaporanHarianState] = useState({
        tanggal: moment().format('YYYY-MM-DD'),
        akun_kas: '',
        kode_akun: '',
        warkat: false,
    });
    const [dialogLaporan, setDialogLaporan] = useState(false);

    const laporanHarianStateChange = (e: any) => {
        const { name, value } = e.target;

        if (name === 'kode_akun') {
            console.log('kode_akun', e);
            setLaporanHarianState((prev: any) => ({
                ...prev,
                [name]: value,
                akun_kas: e.target.selectedOptions[0].outerText,
            }));
        }

        // Update filterState
        setLaporanHarianState((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClick = (id: any, title: any) => {
        setSelectedId(id);
        setSelectedTitle(title);
    };

    const SpreadNumber = (number: any | number | string) => {
        const temp = parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };

    const handleDoubleClick = (category: any) => {
        setDetailApiMenu(category);
        if (category.id !== 7607) {
            setIsBaseDialogOpen(true);
        }
    };
    const handleTgl = async (date: any, tipe: string) => {
        if (tipe === 'tanggal') {
            setLaporanHarianState((oldData: any) => ({
                ...oldData,
                tanggal: moment(date).format('YYYY-MM-DD'),
            }));
        }
    };

    const printActiveReportKasWarkat = () => {
        const params = `entitas=${kode_entitas}&param1=${moment(laporanHarianState.tanggal).format('YYYY-MM-DD')}&param2=${laporanHarianState.kode_akun}&param3=${
            laporanHarianState.warkat ? 'Y' : 'N'
        }&token=${token}`;

        harian_kas_warkat(params);
    };

    const cetakByHtml = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/report_form_kas_opname?`, {
                params: {
                    entitas: kode_entitas,
                    param1: laporanHarianState.tanggal,
                    param2: laporanHarianState.kode_akun,
                    param3: laporanHarianState.warkat ? 'Y' : 'N',
                    // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            PrintData(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    function formatNumber(num: any) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    const ConvertDataToHtml = (data: any) => {
        const nama_entitas = data?.data_NamaEntitas;
        const data_Periode = data?.data_Periode;
        const penerimaan = data?.data?.data_kas.filter((item: any) => item.kr === 1 && item.tunai !== null && !isNaN(SpreadNumber(item.tunai)) && SpreadNumber(item.tunai) != 0);
        const penerimaanForWarkat = data?.data?.data_kas.filter((item: any) => item.kr === 1);
        let groupedData: any = {};
        if (laporanHarianState.warkat) {
            groupedData = penerimaanForWarkat.reduce((result: any, item: any) => {
                // Jika nama_sales belum ada di result, tambahkan array baru

                if (laporanHarianState.warkat) {
                    if (!result[item.nama_sales]) {
                        result[item.nama_sales] = [];
                    }
                    // Tambahkan item ke grup yang sesuai
                    result[item.nama_sales].push(item);
                    return result;
                }
            }, {});

            const cleanData = (data: any) => {
                const newData = { ...data }; // Salin objek agar tidak mengubah aslinya
                if (newData.hasOwnProperty('null')) {
                    delete newData['null']; // Hapus key "null" jika ada
                }
                return newData;
            };

            groupedData = cleanData(groupedData);
        }

        console.log('groupedData', groupedData);

        const pengeluaraan = data?.data?.data_kas.filter((item: any) => item.kr === 2);
        const totalPenerimaan = penerimaan.reduce((sum: number, item: any) => SpreadNumber(sum) + SpreadNumber(item.tunai), 0);
        const totalPengeluaran = pengeluaraan.reduce((sum: number, item: any) => SpreadNumber(sum) + SpreadNumber(item.tunai), 0);
        console.log('totalPenerimaan', penerimaan);

        // const totalKredit = data?.reduce((sum: number, item: any) => sum + parseFloat(item.kredit.replace(/,/g, '') || 0), 0).toFixed(2);

        const saldoAwal = formatNumber(SpreadNumber(data?.data?.data_kas[0]?.tunai));
        const saldoAkhir = SpreadNumber(data?.data?.data_kas[0]?.tunai) + totalPenerimaan - totalPengeluaran;

        let hasKr1 = data?.data?.data_kas.some((item: any) => item.kr === 1);
        let hasKr2 = data?.data?.data_kas.some((item: any) => item.kr === 2);
        let total1Row = 0;
        let totalWarkat = 0;
        // let selisihReal: number = 0;
        // selisihReal -= SpreadNumber(data?.data?.data_kop[0].nselisih)
        // selisihReal -= SpreadNumber(data?.data?.data_kop[0].napp)
        // console.log('masuk cetak', data);
        // console.log('tunai', saldoAwal, saldoAkhir);
        // Menghitung total debet dan kredit

        return `
    <style>
@media print {
@page {
  size: A4 landscape; /* Untuk ukuran A4 dengan orientasi lanskap */
  margin: 10mm; /* Margin yang sesuai untuk mencetak */
}

body {
  font-size: 8pt; /* Ukuran font untuk menyesuaikan skala cetak */
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
}

th, td {
 
  padding: 2.5px;
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

.border-bottom {
  border-bottom: 1px solid black;
}
   tr {
  page-break-inside: avoid; /* Hindari pemisahan elemen tr di tengah halaman */
}

.page-break {
  page-break-before: avoid; /* Memulai bagian baru di halaman berikutnya */
}

thead th.theadawal {
padding-top: 20px; /* Jarak antara thead dan tbody */
}

.hidden-print {
  display: none; /* Sembunyikan elemen tertentu saat mencetak */
}
  .section-pengeluaran {
page-break-inside: avoid;
page-break-before: avoid; /* Hindari memecah elemen di halaman cetak */
}
}
</style>

      <div style="font-family: Calibri, sans-serif;font-size: 13px">
      
   

  <table style="width: 100%; border-collapse: collapse; margin-top: 20px" class="section-pengeluaran tableAwal">
<thead class="theadawal" >
<p style="font-size: 8pt">${moment().format('DD MMM YYYY HH:mm')}</p>
<tr class="section-pengeluaran" class="section-pengeluaran">
  <td class="text-center" style="font-size: 15px" colspan="7" class="theadawal">
    ${kode_entitas}<br />
    Laporan Harian ${laporanHarianState?.akun_kas}<br />
    ${data_Periode}
  </td>
</tr>
<tr style="font-size: 8pt" class="section-pengeluaran ">
  <th style="width: 10%" class="border-bottom text-left theadawal">No</th>
  <th style="width: 30%" class="border-bottom text-left theadawal">Keterangan</th>
  <th style="width: 10%" class="border-bottom text-left theadawal">No. Cek / BG</th>
  <th style="width: 10%" class="border-bottom text-left theadawal">Tgl. Valuta</th>
  <th style="width: 10%" class="border-bottom text-right theadawal">Kas / Bank</th>
  <th style="width: 10%" class="border-bottom text-right theadawal">Warkat</th>
  <th style="width: 20%" class="border-bottom text-left theadawal">Akun Debet / Kredit</th>
</tr>
</thead>
<tbody>
<!-- Isi tabel seperti sebelumnya -->
<tr>
<td colspan="7">
 <tr style="border-bottom: 1px dotted black;  font-size: 8pt; " class="section-pengeluaran">
            <td colspan="4" style="color: blue; font-size: 15px">
            S A L D O &nbsp; A W A L</td>
            <td class="text-right" style="font-weight:bold">${formatNumber(saldoAwal)}</td>
        </tr>
</td>

${
    hasKr1
        ? `
    <tr style="border-bottom: 1px dotted black; font-size: 8pt;" class="section-pengeluaran">
 <td colspan="4" style="color: blue; font-size: 15px">
 PENERIMAAN</td>
</tr>

${
    Object.keys(groupedData).length !== 0
        ? `
     
<tr style="font-size: 8pt" class="section-pengeluaran">
 <td colspan="7">
 <table style="width: 100%">
     <thead>
         <tr style="font-size: 8pt">
             <th colspan="4" align="left" style="color: rgb(173 0 0) class="section-pengeluaran"">HASIL PENAGIHAN<th>
             <th colspan="3"></th>
         </tr>
     </thead>
     <tbody>
         ${Object.entries(groupedData)
             .map(
                 ([salesName, details]: any, idx) => `
         <tr>
             <td style="width:15px">${idx + 1}</td>
             <td style="width:593px; "><b>${salesName}</b></td>
         </tr>
         <tr style="font-size: 8pt" class="section-pengeluaran">
             <td colspan="7">
                 <table>
                     ${details
                         .map((detail: any, detailIdx: any) => {
                             total1Row += SpreadNumber(detail.warkat);
                             return `
                     
                 <tr>
                         <td style="width:15px"></td>
                         <td style="width:350px; padding-left: 10px;">${detail.keterangan}</td>
                         <td style="width:120px; ">${detail.no_warkat}</td>
                         <td style="width:165px; ">${moment(detail.tgl_tempo, 'YYYY-MM-DD').format('DD-MM-YYYY')}</td>
                         <td style="width:120px;" class="text-right">${formatNumber(SpreadNumber(detail.warkat))}</td>
                         <td >${detail.nama_akun === null ? '' : detail.nama_akun}</td>
                     </tr>
                     `;
                         })
                         .join()}
                         <tr>
                         <td style="width:15px"></td>
                         <td style="width:350px; padding-left: 10px;"></td>
                         <td style="width:120px; "></td>
                         <td style="width:165px; "></td>
                         <td style="width:120px; border-top: 1px solid black" class="text-right">${formatNumber(total1Row)}</td>
                         <td ><span style="display: none">${(totalWarkat += total1Row)} ${(total1Row = 0)}</span></td>
                         </tr>
                 </table>
             <td>
         
         </tr>
         
         `
             )
             .join('')}
             <tr style="font-size: 8pt" class="section-pengeluaran">
             <td colspan="7">
                 <table>
                     
                     
                 <tr>
                         <td style="width:15px"></td>
                         <td style="width:350px; padding-left: 10px;"></td>
                         <td style="width:120px; "></td>
                         <td style="width:165px; "></td>
                         <td style="width:120px;" class="text-right"></td>
                         <td ></td>
                     </tr>
                     
                         <tr>
                         <td colspan="3" style="width:495px; padding-left: 10px;color: rgb(173 0 0)">TOTAL HASIL PENAGIHAN -----------------------------------------------------------------------------------</td>
                         <td style="width:165px; "></td>
                         <td style="width:120px; border-top: 1px solid black" class="text-right">${formatNumber(totalWarkat)}</td>
                         <td ><span style="display: none"></span></td>
                         </tr>
                 </table>
             <td>
         
         </tr>
     </tbody>
 </table>
 </td>
</tr>

    `
        : ''
}

       ${
           penerimaan.length !== 0
               ? `
        
        <tr style="font-size: 8pt" class="section-pengeluaran">
        <td colspan="7">
        <table style="width: 100%; border-spacing: 0px !important;" cellspacing="0" cellpadding="0">
        <thead>
        <tr style="font-size: 8pt">
        <th colspan="4" align="left" style="color: rgb(173 0 0)">PENERIMAAN LAIN-LAIN<th>
        <th colspan="3"></th>
        </tr>
        </thead>
        <tbody cell-spacing="0">
        ${penerimaan
            .map((item: any, index: number) => {
                if (item.tunai !== null && !isNaN(SpreadNumber(item.tunai)) && SpreadNumber(item.tunai) != 0) {
                    return `
                        <tr style="font-size: 8pt" class="section-pengeluaran">
                        <td style="width:15px">${index + 1}</td>
                        <td style="width:593px; ">${item.keterangan}</td>
                        <td style="width:80px; " class="text-right">${formatNumber(SpreadNumber(item.tunai))}</td>
                        <td style="width:120px; " class="text-right"></td>
                        <td >${item.nama_akun === null ? '' : item.nama_akun}</td>
                        </tr>
                `;
                }
            })
            .join('')}
       </tbody>
       <tfooter>
       <tr style="font-size: 8pt">
        <td colspan="2" style="color: rgb(173 0 0)">
        TOTAL PENERIMAAN LAIN LAINM ----------------------------------------------------------------------------
        </td>
        <td class="text-right" style="font-weight:bold">${formatNumber(totalPenerimaan)}</td> 
        <td>
        </td>
       </tr>
       </tfooter>
        </table>
        </td>
        </tr>
        `
               : ''
       }
</tr>
 <tr class="section-pengeluaran">
     <td colspan="4" style="font-weight: bold">TOTAL PENERIMAAN ---------------------------------------------------------------------------------------------</td>
     <td  class="text-right">${formatNumber(SpreadNumber(totalPenerimaan)) == 0 ? '' : formatNumber(SpreadNumber(totalPenerimaan))}</td>
     <td  class="text-right">${formatNumber(totalWarkat) == 0 ? '' : formatNumber(totalWarkat)}</td>
</tr>
 `
        : ''
}

${
    hasKr2
        ? `
           <tr style="border-bottom: 1px dotted black; font-size: 8pt;" class="section-pengeluaran">
               <td colspan="4" style="color: blue; font-size: 15px">
               PENGELUARAN</td>
           </tr>
     <tr style="font-size: 8pt" class="section-pengeluaran">
     <td colspan="7">
     <table style="width: 100%">
        <thead>
        <tr style="font-size: 8pt">
        <th colspan="4" align="left"><th>
        <th colspan="3"></th>
        </tr>
        </thead>
        <tbody>
        ${pengeluaraan
            .map(
                (item: any, index: number) => `
       <tr style="font-size: 8pt">
       <td style="width:15px">${index + 1}</td>
       <td style="width:593px; ">${item.keterangan}</td>
       <td style="width:80px; " class="text-right">${formatNumber(SpreadNumber(item.tunai))}</td>
       <td style="width:120px; " class="text-right"></td>
       <td >${item.nama_akun}</td>
       </tr>
       `
            )
            .join('')}
       </tbody>
       <tfooter>
       <tr style="font-size: 8pt">
        <td colspan="2" style="font-weight: bold">
        TOTAL PENGELUARAN ---------------------------------------------------------------------------------------------
        </td>
        <td class="text-right" style="font-weight:bold">${formatNumber(totalPengeluaran)}</td> 
        <td>
        </td>
       </tr>
       </tfooter>
        </table>
     </td>
     </tr>
     
     `
        : ''
}
       <tr style="border-bottom: 1px dotted black;  font-size: 8pt; ">
            <td colspan="4" style="color: blue; font-size: 15px">
            S A L D O  &nbsp; A K H I R</td>
            <td class="text-right" style="font-weight:bold">${formatNumber(saldoAkhir)}</td>
        </tr>
       ${
           data?.data?.data_kop.length !== 0
               ? `
        <tr>
        <td colspan="2">
        
        <table border="1" cellspacing="0" style="margin-top: 5px; width: 100%;" >
        <caption style="font-size: 10px; font-weight: bold">RINCIAN PERHITUNGAN FISIK</caption>
        <thead>
        
            <tr style="font-size: 8pt">
            <th>Nominal</th>
            <th>Kertas</th>
            <th>Koin</th>
            <th>Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr style="font-size: 8pt">
                <td>100.000</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k100000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c100000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n100000))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>75.000</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k75000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c75000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n75000))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>50.000</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k50000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c50000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n50000))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>20.000</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k20000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c20000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n20000))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>10.000</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k10000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c10000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n10000))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>5.000</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k5000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c5000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n5000))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>2.000</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k2000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c2000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n2000))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>1.000</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k1000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c1000))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n1000))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>500</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k500))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c500))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n500))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>200</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k200))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c200))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n200))}</td>
            </tr>
            <tr style="font-size: 8pt">
                <td>100</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].k100))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].c100))}</td>
                <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].n100))}</td>
            </tr>
        </tbody>
        <tfooter>
        <tr>
        <td colspan="2"><td>
        <td class="text-right" style="font-size: 8pt" class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].nfisik))}</td>
        </tr>
        </tfooter>
    </table>
        </td>
       <td colspan="4" style="position: relative; text-align: center; height: 100px;">
<table style="position: absolute; top: 30px; left: 55%; transform: translateX(-50%); width: 100%;">
    <tr style="font-size: 8pt;">
        <td># User INPUT Terakhir</td>
        <td>${data?.data?.data_kop[0].user_input}</td>
    </tr>
    <tr style="font-size: 8pt;">
        <td># Total Fisik Uang</td>
        <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].nfisik))}</td>
    </tr>
    <tr style="font-size: 8pt;">
        <td># Total Belum Approved</td>
        <td class="text-right" style="font-weight:bold">${formatNumber(SpreadNumber(data?.data?.data_kop[0].napp))}</td>
    </tr>
    <tr style="font-size: 8pt;">
        <td># Kas Selisih (lebih / kurang)</td>
        <td class="text-right" style="font-weight:bold; ">
            <p style="background: yellow; width: 50%; display: inline-block;">
                ${SpreadNumber(data?.data?.data_kop[0].nselisih) === SpreadNumber(data?.data?.data_kop[0].napp) ? 0 : formatNumber(SpreadNumber(data?.data?.data_kop[0].nselisih))}
            </p>
        </td>
    </tr>
    <tr style="font-size: 8pt;">
        <td># Catatan Selisih :</td>
        <td>${data?.data?.data_kop[0].alasan === null ? '' : data?.data?.data_kop[0].alasan}</td>
    </tr>
    <tr style="font-size: 8pt;">
        <td>Dibuat</td>
        <td>Diperiksa</td>
        <td>Disetujui</td>
    </tr>`
               : ''
       }
    
</table>
</td>


         
        </tr>
       </tbody>
    </table>
   
</div>
    `;
    };

    const PrintData = (data: any) => {
        console.log('tunai', data);

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(`
          <html>
            <head>
              <title>Cetak Laporan Kas Harian</title>
              <style>
               
              </style>
            </head>
            <body onload="window.print();">
              ${ConvertDataToHtml(data)}
            </body>
          </html>
        `);
            iframeDoc.close();

            if (iframe.contentWindow) {
                iframe.contentWindow.focus();
                iframe.contentWindow.onafterprint = () => {
                    document.body.removeChild(iframe);
                };
            }
        } else {
            console.error('Failed to access iframe document.');
        }
    };

    const getAkunLaporan = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/list_akun_kas_mutasi_bank?`, {
                params: {
                    entitas: kode_entitas,
                    // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const modfiedData = response.data.data.filter((item: any) => item.header !== 'Y');
            setAkun_kasLaporan(modfiedData);
        } catch (error) {
            console.log('error saat get akun', error);
        }
    };

    useEffect(() => {
        if (token) {
            getAkunLaporan();
        }
    }, [token]);

    return (
        <div className="h-[100%] w-[100%]">
            <div
                className="h-full"
                style={{ width: sidebarVisible ? '100%' : '100%', background: 'white', borderRadius: '10px', margin: sidebarVisible ? '' : 'auto auto auto -15%', overflowY: 'auto' }}
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-gray-300 px-4 py-2">
                        <FontAwesomeIcon icon={faBookBookmark} width="18" height="18" style={{ color: '#a93815', fontSize: '22px' }} />
                        <span className="text-right font-bold">Daftar Laporan Keuangan</span>
                    </div>
                    <div className="flex-1 overflow-auto px-4 pt-4">
                        <div>
                            {categoriesLaporanKeuangan.map((category, index) => (
                                <div
                                    key={category.id}
                                    // onClick={() => handleClick(category.id, index, category.tipe)}
                                    style={{ fontWeight: 'bold', padding: '10px', cursor: 'pointer', marginTop: '-17px' }}
                                    onClick={() => handleClick(category.id, category.value)}
                                    onDoubleClick={() => {
                                        if (category.id === 7607) {
                                            setDialogLaporan(true);
                                        } else {
                                            handleDoubleClick(category);
                                        }
                                    }}
                                >
                                    <div className="flex">
                                        <div style={{ width: '1.5%' }}>
                                            <FontAwesomeIcon icon={faBook} width="18" height="18" style={{ marginRight: '5px' }} />
                                        </div>
                                        <div style={{ width: '98.5%' }}>
                                            <h5 style={selectedId === category.id ? { background: '#d2eee7' } : {}}>{category.value}</h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Footer Tetap */}
                    <div className="border-t border-gray-300 px-4 py-2">
                        <div className="text-right font-bold">Keterangan</div>
                        <div className="mt-1 text-sm font-bold text-[#9f9a9a]">Menampilkan laporan Keuangan.</div>
                    </div>
                </div>
                {/*============================================================================*/}
                {/*========================= Modal dialog Show (Filter) =======================*/}
                {/*============================================================================*/}
                {isBaseDialogOpen && (
                    <BaseDialog
                        detailApiMenu={detailApiMenu}
                        tipe={selectedId}
                        title={selectedTitle}
                        isOpen={isBaseDialogOpen}
                        kode_entitas={kode_entitas}
                        token={token}
                        onClose={() => setIsBaseDialogOpen(false)}
                    />
                )}
                {dialogLaporan && (
                    <DialogComponent
                        id="dialogListKendaraan"
                        isModal={true}
                        width="30%"
                        height="40%"
                        header={'Laporan Kas Harian'}
                        visible={dialogLaporan}
                        close={() => setDialogLaporan(false)}
                        showCloseIcon={true}
                        target="#main-target"
                        closeOnEscape={false}
                        allowDragging={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
                        style={{ position: 'fixed' }}
                    >
                        <div className="h-full w-full flex-col">
                            <div className="h-[85%] w-full">
                                <div className="flex flex-col">
                                    <label className="mb-1 flex items-center gap-2 text-xs">Tanggal Input</label>
                                    <div className="flex w-full items-center">
                                        <span className="flex h-[5vh] w-[45%] items-center rounded border bg-white pl-2">
                                            <DatePickerComponent
                                                locale="id"
                                                cssClass="e-custom-style"
                                                enableMask={true}
                                                showClearButton={false}
                                                format="dd-MM-yyyy"
                                                width={180}
                                                value={moment(laporanHarianState.tanggal).toDate()}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    handleTgl(args.value, 'tanggal');
                                                }}
                                                style={{
                                                    width: '100%',
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-1 flex items-center gap-2 text-xs">Akun Kas</label>
                                    <select
                                        name="kode_akun"
                                        value={laporanHarianState.kode_akun}
                                        onChange={laporanHarianStateChange}
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="">Select Akun Kas</option>
                                        {akun_kasLaporan.length !== 0 &&
                                            akun_kasLaporan.map((item: any) => (
                                                <option key={item.kode_akun} value={item.kode_akun}>
                                                    {item.nama_akun}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-1 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={laporanHarianState.warkat}
                                            onChange={(e) =>
                                                setLaporanHarianState((prev) => ({
                                                    ...prev,
                                                    warkat: !prev.warkat,
                                                }))
                                            }
                                        />{' '}
                                        Tampilkan Warkat Baru
                                    </label>
                                </div>
                            </div>
                            <div className="flex h-[15%] w-full justify-end gap-2 pb-2 pr-2">
                                <ButtonComponent type="submit" onClick={printActiveReportKasWarkat}>
                                    OK
                                </ButtonComponent>
                                <ButtonComponent type="submit" onClick={() => setDialogLaporan(false)}>
                                    Tutup
                                </ButtonComponent>
                            </div>
                        </div>
                    </DialogComponent>
                )}
                {dialogKasWarkat && (
                    <KasWarkatDialog tipe={selectedId} title={selectedTitle} isOpen={dialogKasWarkat} kode_entitas={kode_entitas} token={token} onClose={() => setDialogKasWarkat(false)} />
                )}
            </div>
        </div>
    );
};

export default TabLaporanKeuangan;
