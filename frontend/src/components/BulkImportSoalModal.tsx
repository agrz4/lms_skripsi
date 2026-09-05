import React, { useState, useMemo } from 'react';
import { 
  HiOutlineArrowUpTray,
  HiOutlineDocumentText,
  HiOutlineDocumentArrowDown,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineClipboardDocument,
  HiOutlineInformationCircle,
  HiOutlineCheck
} from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ParsedQuestionItem {
  id: string;
  pertanyaan: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isValid: boolean;
  errorReason?: string;
}

interface BulkImportSoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (formattedQuestions: string[], mode: 'append' | 'replace') => void;
  existingCount?: number;
}

const SAMPLE_QUESTIONS_PIPA = `Apa kepanjangan dari HTML? | Hyper Text Markup Language | High Text Marking Language | Hyperlink Text Mode | Home Tool Markup | A
Properti CSS apa yang digunakan untuk mengatur warna latar belakang? | color | bgcolor | background-color | fill | C
Manakah tag HTML yang digunakan untuk membuat tautan hyperlink? | <link> | <a> | <href> | <url> | B
Di JavaScript, kata kunci mana yang digunakan untuk mendeklarasikan variabel yang tidak dapat di-reassign? | var | let | static | const | D
Properti CSS Flexbox apa yang digunakan untuk meratakan item di sepanjang sumbu utama (main axis)? | align-items | justify-content | align-content | flex-direction | B`;

export const BulkImportSoalModal: React.FC<BulkImportSoalModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingCount = 0
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'guide'>('paste');
  const [rawText, setRawText] = useState<string>('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [filterPreview, setFilterPreview] = useState<'all' | 'valid' | 'invalid'>('all');
  const [fileName, setFileName] = useState<string>('');

  // Parser logic supporting Pipe format, CSV, and JSON
  const parsedItems = useMemo<ParsedQuestionItem[]>(() => {
    const text = rawText.trim();
    if (!text) return [];

    // Check if entire input is JSON array
    if (text.startsWith('[') && text.endsWith(']')) {
      try {
        const jsonArr = JSON.parse(text);
        if (Array.isArray(jsonArr)) {
          return jsonArr.map((item, idx) => {
            const qText = item.pertanyaan || item.soal || item.question || '';
            const opts = item.options || {};
            const rawAns = (item.correctAnswer || item.jawaban || item.answer || 'A').toString().trim().toUpperCase();
            const ans = ['A', 'B', 'C', 'D'].includes(rawAns) ? (rawAns as 'A' | 'B' | 'C' | 'D') : 'A';
            
            const optA = opts.A || opts.a || (Array.isArray(opts) ? opts[0] : '') || '';
            const optB = opts.B || opts.b || (Array.isArray(opts) ? opts[1] : '') || '';
            const optC = opts.C || opts.c || (Array.isArray(opts) ? opts[2] : '') || '';
            const optD = opts.D || opts.d || (Array.isArray(opts) ? opts[3] : '') || '';

            const isValid = Boolean(qText && optA && optB && optC && optD && ['A', 'B', 'C', 'D'].includes(rawAns));
            let errorReason = '';
            if (!qText) errorReason = 'Pertanyaan kosong';
            else if (!optA || !optB || !optC || !optD) errorReason = 'Opsi jawaban A, B, C, D belum lengkap';
            else if (!['A', 'B', 'C', 'D'].includes(rawAns)) errorReason = `Kunci jawaban (${rawAns}) tidak valid (harus A, B, C, atau D)`;

            return {
              id: `q-json-${idx}`,
              pertanyaan: qText,
              options: { A: optA, B: optB, C: optC, D: optD },
              correctAnswer: ans,
              isValid,
              errorReason
            };
          });
        }
      } catch (e) {
        // Fall back to line-by-line parsing if JSON parse failed
      }
    }

    // Line-by-line parsing
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const results: ParsedQuestionItem[] = [];

    lines.forEach((line, idx) => {
      // 1. Try single-line JSON
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const item = JSON.parse(line);
          const qText = item.pertanyaan || item.soal || item.question || '';
          const opts = item.options || {};
          const rawAns = (item.correctAnswer || item.jawaban || item.answer || 'A').toString().trim().toUpperCase();
          const ans = ['A', 'B', 'C', 'D'].includes(rawAns) ? (rawAns as 'A' | 'B' | 'C' | 'D') : 'A';
          const optA = opts.A || opts.a || '';
          const optB = opts.B || opts.b || '';
          const optC = opts.C || opts.c || '';
          const optD = opts.D || opts.d || '';

          const isValid = Boolean(qText && optA && optB && optC && optD && ['A', 'B', 'C', 'D'].includes(rawAns));
          results.push({
            id: `line-${idx}`,
            pertanyaan: qText,
            options: { A: optA, B: optB, C: optC, D: optD },
            correctAnswer: ans,
            isValid,
            errorReason: isValid ? undefined : 'Format JSON tidak memiliki opsi atau kunci valid'
          });
          return;
        } catch (e) {
          // ignore
        }
      }

      // 2. Try Pipe delimiter '|'
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          const qText = parts[0];
          const optA = parts[1];
          const optB = parts[2];
          const optC = parts[3];
          const optD = parts[4];
          const rawAns = parts[5].toUpperCase();
          const isValidKey = ['A', 'B', 'C', 'D'].includes(rawAns);
          const isValid = Boolean(qText && optA && optB && optC && optD && isValidKey);

          results.push({
            id: `line-${idx}`,
            pertanyaan: qText,
            options: { A: optA, B: optB, C: optC, D: optD },
            correctAnswer: (isValidKey ? rawAns : 'A') as 'A' | 'B' | 'C' | 'D',
            isValid,
            errorReason: !isValidKey 
              ? `Kunci "${rawAns}" tidak valid (harus A, B, C, atau D)`
              : (!qText || !optA || !optB || !optC || !optD)
              ? 'Ada kolom kosong pada soal atau pilihan'
              : undefined
          });
          return;
        } else {
          results.push({
            id: `line-${idx}`,
            pertanyaan: line,
            options: { A: '', B: '', C: '', D: '' },
            correctAnswer: 'A',
            isValid: false,
            errorReason: `Format pipa kurang kolom (${parts.length}/6). Format: Soal | A | B | C | D | Kunci`
          });
          return;
        }
      }

      // 3. Try CSV / Semicolon delimiter (if line contains comma or semicolon)
      const delimiter = line.includes(';') ? ';' : ',';
      if (line.includes(delimiter)) {
        // Skip header line if present
        if (idx === 0 && (line.toLowerCase().includes('pertanyaan') || line.toLowerCase().includes('question'))) {
          return;
        }

        // CSV parsing with quotes handling
        const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
        const parts: string[] = [];
        let match;
        while ((match = regex.exec(line)) !== null) {
          let col = match[1] ? match[1].replace(/""/g, '"') : match[2];
          parts.push((col || '').trim());
        }

        if (parts.length >= 6) {
          const qText = parts[0];
          const optA = parts[1];
          const optB = parts[2];
          const optC = parts[3];
          const optD = parts[4];
          const rawAns = parts[5].toUpperCase();
          const isValidKey = ['A', 'B', 'C', 'D'].includes(rawAns);
          const isValid = Boolean(qText && optA && optB && optC && optD && isValidKey);

          results.push({
            id: `line-${idx}`,
            pertanyaan: qText,
            options: { A: optA, B: optB, C: optC, D: optD },
            correctAnswer: (isValidKey ? rawAns : 'A') as 'A' | 'B' | 'C' | 'D',
            isValid,
            errorReason: !isValidKey 
              ? `Kunci "${rawAns}" tidak valid (harus A, B, C, atau D)`
              : (!qText || !optA || !optB || !optC || !optD)
              ? 'Ada kolom CSV yang kosong'
              : undefined
          });
          return;
        }
      }

      // Default unrecognized line
      results.push({
        id: `line-${idx}`,
        pertanyaan: line,
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        isValid: false,
        errorReason: 'Format tidak dikenali. Gunakan format pemisah pipa: Soal | A | B | C | D | Kunci'
      });
    });

    return results;
  }, [rawText]);

  const validItems = useMemo(() => parsedItems.filter(item => item.isValid), [parsedItems]);
  const invalidItems = useMemo(() => parsedItems.filter(item => !item.isValid), [parsedItems]);

  const filteredItems = useMemo(() => {
    if (filterPreview === 'valid') return validItems;
    if (filterPreview === 'invalid') return invalidItems;
    return parsedItems;
  }, [parsedItems, validItems, invalidItems, filterPreview]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        setActiveTab('paste'); // switch to review the parsed text
      }
    };
    reader.readAsText(file);
  };

  // Download Templates
  const handleDownloadCsvTemplate = () => {
    const csvContent = `Pertanyaan,Pilihan A,Pilihan B,Pilihan C,Pilihan D,Kunci Jawaban
"Apa kepanjangan dari HTML?","Hyper Text Markup Language","High Text Marking Language","Hyperlink Text Mode","Home Tool Markup","A"
"Properti CSS apa yang digunakan untuk mengatur warna latar belakang?","color","bgcolor","background-color","fill","C"
"Manakah tag HTML yang digunakan untuk membuat tautan hyperlink?","<link>","<a>","<href>","<url>","B"
"Kata kunci JavaScript untuk deklarasi variabel tetap?","var","let","static","const","D"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_soal.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxtTemplate = () => {
    const txtContent = `Apa kepanjangan dari HTML? | Hyper Text Markup Language | High Text Marking Language | Hyperlink Text Mode | Home Tool Markup | A
Properti CSS apa yang digunakan untuk mengatur warna latar belakang? | color | bgcolor | background-color | fill | C
Manakah tag HTML yang digunakan untuk membuat tautan hyperlink? | <link> | <a> | <href> | <url> | B
Kata kunci JavaScript untuk deklarasi variabel tetap? | var | let | static | const | D`;

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_soal.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = () => {
    if (validItems.length === 0) return;

    // Convert each valid item into JSON string format expected by system
    const formattedQuestions = validItems.map(item => {
      const qObj = {
        pertanyaan: item.pertanyaan,
        options: item.options,
        correctAnswer: item.correctAnswer
      };
      return JSON.stringify(qObj);
    });

    onImport(formattedQuestions, importMode);
    onClose();
    // Reset fields
    setRawText('');
    setFileName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-150 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner">
              <HiOutlineArrowUpTray className="text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Import Bulk Soal Pilihan Ganda
                <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                  Batch Tool
                </Badge>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Tambahkan puluhan soal sekaligus dari format teks, CSV, atau berkas template
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <HiOutlineXMark className="text-xl" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-150 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineClipboardDocument className="text-base" />
            Paste Teks Soal
            {parsedItems.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                {parsedItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineArrowUpTray className="text-base" />
            Upload Berkas (CSV / TXT)
            {fileName && (
              <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                {fileName}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineInformationCircle className="text-base" />
            Panduan Format & Template
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">

          {/* TAB 1: Paste Text */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-700 block">
                    Masukkan Soal (1 baris per soal)
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Format: <code className="bg-gray-100 text-emerald-700 px-1 py-0.5 rounded font-mono font-bold">Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Kunci</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_QUESTIONS_PIPA)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HiOutlineSparkles className="text-sm" />
                  Isi Contoh 5 Soal
                </button>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Contoh:\nApa itu HTML? | Markup | Script | Style | Lang | A\nApa itu CSS? | Style Sheet | DB | Server | Compiler | A`}
                className="w-full h-44 bg-slate-50 border border-gray-200 rounded-xl p-3.5 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-y text-gray-800 placeholder:text-gray-400"
              />

              {rawText && (
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{rawText.split('\n').filter(l => l.trim().length > 0).length} baris terisi</span>
                  <button
                    type="button"
                    onClick={() => { setRawText(''); setFileName(''); }}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Bersihkan Teks
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 hover:border-emerald-400 bg-slate-50/60 rounded-2xl p-8 text-center transition-all cursor-pointer relative group">
                <input
                  type="file"
                  accept=".csv,.txt,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-14 h-14 mx-auto mb-3 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HiOutlineArrowUpTray className="text-2xl" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  Klik untuk memilih berkas atau Drag & Drop ke sini
                </h3>
                <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto">
                  Mendukung berkas <span className="font-bold text-gray-600">.CSV</span> (Comma Separated), <span className="font-bold text-gray-600">.TXT</span> (Pipa Delimited), atau <span className="font-bold text-gray-600">.JSON</span>
                </p>
                {fileName && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold">
                    <HiOutlineDocumentText className="text-base" />
                    Berkas terpilih: {fileName}
                  </div>
                )}
              </div>

              {/* Quick download templates */}
              <div className="bg-emerald-50/50 border border-emerald-150 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-950">Belum memiliki berkas?</p>
                  <p className="text-[11px] text-emerald-700 font-medium">Unduh template siap isi untuk mempermudah pengetikan soal Anda.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    variant="outline"
                    className="bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 text-xs font-bold h-8 rounded-lg flex items-center gap-1.5"
                  >
                    <HiOutlineDocumentArrowDown className="text-sm" />
                    Unduh CSV
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDownloadTxtTemplate}
                    variant="outline"
                    className="bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 text-xs font-bold h-8 rounded-lg flex items-center gap-1.5"
                  >
                    <HiOutlineDocumentArrowDown className="text-sm" />
                    Unduh TXT
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-5 text-xs text-gray-600">
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
                  <HiOutlineInformationCircle className="text-base text-emerald-600" />
                  Format Baris Pipa (TXT / Paste)
                </h4>
                <p className="leading-relaxed">
                  Setiap soal ditulis dalam 1 baris, dengan 6 bagian yang dipisahkan oleh karakter vertikal <code className="bg-white border px-1 py-0.5 rounded font-mono font-bold text-emerald-700">|</code>:
                </p>
                <div className="p-3 bg-gray-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed">
                  Pertanyaan | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Kunci
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-500 pt-1">
                  <li>Kunci jawaban harus berupa huruf <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, atau <strong>D</strong> (huruf besar atau kecil).</li>
                  <li>Tanda spasi di sekitar pemisah <code className="font-mono">|</code> akan otomatis dibersihkan oleh sistem.</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <h4 className="font-black text-gray-900 text-sm">Format Tabel CSV (Excel / Google Sheets)</h4>
                <p className="leading-relaxed">
                  Jika menggunakan Microsoft Excel atau Google Sheets, simpan dokumen sebagai <strong>CSV (.csv)</strong> dengan susunan kolom:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border border-gray-200 bg-white rounded-lg">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-2 text-left">Kolom 1</th>
                        <th className="p-2 text-left">Kolom 2</th>
                        <th className="p-2 text-left">Kolom 3</th>
                        <th className="p-2 text-left">Kolom 4</th>
                        <th className="p-2 text-left">Kolom 5</th>
                        <th className="p-2 text-left">Kolom 6</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr>
                        <td className="p-2 border-r">Pertanyaan</td>
                        <td className="p-2 border-r">Pilihan A</td>
                        <td className="p-2 border-r">Pilihan B</td>
                        <td className="p-2 border-r">Pilihan C</td>
                        <td className="p-2 border-r">Pilihan D</td>
                        <td className="p-2 font-bold text-emerald-700">Kunci (A/B/C/D)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <HiOutlineDocumentArrowDown className="text-base" /> Unduh Template CSV
                </Button>
                <Button
                  type="button"
                  onClick={handleDownloadTxtTemplate}
                  variant="outline"
                  className="border-gray-300 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <HiOutlineDocumentArrowDown className="text-base" /> Unduh Template TXT
                </Button>
              </div>
            </div>
          )}

          {/* Real-time Preview Section */}
          {parsedItems.length > 0 && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-2">
                    Pratinjau Hasil Parsing
                    <span className="text-[11px] font-normal text-gray-500">
                      ({validItems.length} Valid / {parsedItems.length} Total)
                    </span>
                  </h3>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFilterPreview('all')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      filterPreview === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Semua ({parsedItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPreview('valid')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      filterPreview === 'valid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                  >
                    Valid ({validItems.length})
                  </button>
                  {invalidItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterPreview('invalid')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        filterPreview === 'invalid' ? 'bg-red-500 text-white shadow-xs' : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      Bermasalah ({invalidItems.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Cards */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 border border-gray-150 rounded-xl p-3 bg-slate-50/50">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      item.isValid
                        ? 'bg-white border-gray-200 hover:border-emerald-300'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-gray-900 line-clamp-2">
                          {item.pertanyaan || <span className="italic text-gray-400">[Teks Soal Kosong]</span>}
                        </p>
                      </div>

                      {item.isValid ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <HiOutlineCheckCircle className="text-xs" /> Kunci: {item.correctAnswer}
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          <HiOutlineExclamationCircle className="text-xs" /> Tidak Valid
                        </span>
                      )}
                    </div>

                    {item.isValid ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const isKey = item.correctAnswer === optKey;
                          return (
                            <div
                              key={optKey}
                              className={`p-2 rounded-lg border text-[11px] truncate flex items-center gap-1.5 ${
                                isKey
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                  : 'bg-gray-50 border-gray-200 text-gray-600'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${
                                isKey ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {optKey}
                              </span>
                              <span className="truncate">{item.options[optKey]}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">
                        ⚠️ Alasan: {item.errorReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Import Mode: Append or Replace */}
              <div className="bg-slate-100/70 border border-gray-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-gray-700">Metode Penambahan:</span>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      Tambahkan ke soal yang ada {existingCount > 0 && `(+${existingCount} soal saat ini)`}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-red-600">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>Ganti semua soal yang ada</span>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold rounded-xl px-5 h-10"
          >
            Batal
          </Button>

          <Button
            type="button"
            onClick={handleExecuteImport}
            disabled={validItems.length === 0}
            className={`text-xs font-black px-6 h-10 rounded-xl flex items-center gap-2 transition-all shadow-md ${
              validItems.length > 0
                ? 'bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer shadow-emerald-200'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <HiOutlineCheck className="text-sm stroke-[3px]" />
            Import Sekarang ({validItems.length} Soal Valid)
          </Button>
        </div>

      </div>
    </div>
  );
};
