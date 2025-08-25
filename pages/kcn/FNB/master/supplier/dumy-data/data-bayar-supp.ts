// data.ts

// Define the interface for the report data
export interface DataBayarSupp {
    no: number;
    tanggal: string;
    noBukti: string;
    jenisBayar: string;
    noCekBg: string;
    tglValuta: string;
    tglReal: string;
    noFaktur: string;
    tglFaktur: string;
    nilaiFaktur: number;
    pembayaran: number;
    umur: number;
    realisasi: number;
  }
  
  // Dummy data for the report
  export const dataBayarSupp: DataBayarSupp[] = [
    {
      no: 1,
      tanggal: "2024-08-01",
      noBukti: "INV001",
      jenisBayar: "Transfer",
      noCekBg: "123456",
      tglValuta: "2024-08-01",
      tglReal: "2024-08-05",
      noFaktur: "F001",
      tglFaktur: "2024-07-28",
      nilaiFaktur: 1000000,
      pembayaran: 950000,
      umur: 30,
      realisasi: 950000,
    },
    {
      no: 2,
      tanggal: "2024-08-02",
      noBukti: "INV002",
      jenisBayar: "Cash",
      noCekBg: "654321",
      tglValuta: "2024-08-02",
      tglReal: "2024-08-06",
      noFaktur: "F002",
      tglFaktur: "2024-07-29",
      nilaiFaktur: 2000000,
      pembayaran: 1800000,
      umur: 28,
      realisasi: 1800000,
    },
    // More dummy data as needed
  ];
  