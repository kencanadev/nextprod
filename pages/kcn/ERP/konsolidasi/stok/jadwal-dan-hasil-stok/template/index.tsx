import { useSession } from '@/pages/api/sessionContext';
import { faCamera, faFolder, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React from 'react';
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

const TemplateJadwalHasil = () => {
  return <div>TemplateJadwalHasil</div>;
};
export default TemplateJadwalHasil;
