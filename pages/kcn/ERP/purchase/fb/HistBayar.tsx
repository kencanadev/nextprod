import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable';
import styles from './fblist.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';
import { SpreadNumber } from '../../fa/fpp/utils';
import { frmNumber } from '@/utils/routines';


const HistBayar = ({selectedRow, closeModal, kode_entitas, apiUrl, token}: {selectedRow: any; closeModal : any; kode_entitas: any; apiUrl: any; token: any}) => {
    const [modalPosition, setModalPosition] = useState({ top: '15%', left: '10%' });
    const [hisbarList, setHisbarList] = useState([])
    const hisBayar = async() => {
        const hibar : any =await axios.get(`${apiUrl}/erp/history_bayar_fb?entitas=${kode_entitas}&param1=${selectedRow?.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        setHisbarList(hibar.data.data)
    }
    useEffect(() => {
        if(selectedRow) {
            hisBayar()
        }
    },[selectedRow])
        console.log('selectedRow',selectedRow);


        const t = {
            "st": "Transfer",
            "no_dokumen": "9918.1217.00007",
            "tgl_dokumen": "2024-12-09T07:32:24.000Z",
            "no_warkat": "BCA4562",
            "tgl_tempo": null,
            "tgl_real": null,
            "nilai_dokumen": "1000.0000",
            "bayar": "1000.0000",
            "nilai_pelunasan": "1000.0000"
        }
        
  return (
    <Draggable>
                        <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                            <div className='w-full h-[20px]'>
                                <p>History Bayar Nomor Dokumen {selectedRow?.no_fb}</p>
                            </div>
                            <div className="overflow-auto">
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>No Dokumen</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Tanggal</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>No. Warkat</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Tgl. Valuta</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Tgl. Cair / Tokal</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Status</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Jumlah</th>
                                            <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Pelunasan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hisbarList?.map((item: any) => (
                                            <tr key={item.no_dokumen}>
                                                <td>{item.no_dokumen}</td>
                                                <td>{moment(item?.tgl_dokumen).format('DD-MM-YYYY') ?? ''}</td>
                                                <td>{item?.no_warkat}</td>
                                                <td>{moment(item.tgl_tempo).format('DD-MM-YYYY')}</td>
                                                <td>{moment(item.tgl_real).format('DD-MM-YYYY')}</td>
                                                <td>{item.st}</td>
                                                <td>{frmNumber(SpreadNumber(item.nilai_dokumen))}</td>
                                                <td>{frmNumber(SpreadNumber(item.bayar))}</td>
                                              
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                className={`${styles.closeButtonDetailDragable}`}
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </Draggable>
  )
}

export default HistBayar