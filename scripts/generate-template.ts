
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const headers = [
    "Fatura No",
    "Fatura Tarihi",
    "Oluşturulma Tarihi",
    "Gönderici",
    "Ödenecek Tutar",
    "Toplam KDV",
    "Vergiler Hariç Toplam Tutar",
    "Para Birimi",
    "Senaryo Tipi",
    "Fatura Tipi",
    "Fatura Durumu"
];

const sampleRow = [
    "INV-2023-001",
    "2023-12-01",
    "2023-12-01",
    "Sample Supplier Ltd.",
    1180.00,
    180.00,
    1000.00,
    "TRY",
    "TICARIFATURA",
    "SATIS",
    "PENDING"
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

// Set column widths
ws['!cols'] = [
    { wch: 20 }, // Fatura No
    { wch: 15 }, // Fatura Tarihi
    { wch: 20 }, // Oluşturulma Tarihi
    { wch: 30 }, // Gönderici
    { wch: 15 }, // Ödenecek Tutar
    { wch: 15 }, // Toplam KDV
    { wch: 25 }, // Vergiler Hariç Toplam Tutar
    { wch: 10 }, // Para Birimi
    { wch: 15 }, // Senaryo Tipi
    { wch: 15 }, // Fatura Tipi
    { wch: 15 }  // Fatura Durumu
];

XLSX.utils.book_append_sheet(wb, ws, "Fatura Sablonu");

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

const filePath = path.join(publicDir, 'fatura-sablonu.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Template generated at ${filePath}`);
