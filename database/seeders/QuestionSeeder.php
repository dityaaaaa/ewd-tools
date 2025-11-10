<?php

namespace Database\Seeders;

use App\Models\Aspect;
use App\Models\AspectVersion;
use App\Models\Question;
use App\Models\QuestionVersion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aspectVersions = AspectVersion::with('aspect')->get()->keyBy(function($item) {
            return $item->aspect->code;
        });

        $questions = [
            [
                'aspect_code' => 'A',
                'questions' => [
                    [
                        'question_text' => 'Apakah legalitas dan perijinan nasabah telah jatuh tempo dan tidak sesuai ketentuan yang berlaku?',
                        'weight' => 15,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah ada tuntutan/masalah hukum dari internal/eksternal/pihak ketiga yang berdampak signifikan terhadap kondisi keuangan perusahaan?',
                        'weight' => 20,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah ada permasalahan (pemogokan, perselisihan tenaga kerja, pengurangan tenaga kerja, dll) antara manajemen/perusahaan dengan tenaga kerja yang berpotensi menggangu kelangsungan usaha debitur?',
                        'weight' => 15,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah debitur terindikasi memulai usaha baru diluar core bisnis yang belum dikuasai?',
                        'weight' => 10,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah justifikasi ekspornya masih terpenuhi sesuai dengan ketentuan?',
                        'weight' => 10,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah terdapat perikatan perjanjian yang masih belum sempurna?',
                        'weight' => 10,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah debitur tidak dapat memenuhi kesepakatan atau pemenuhan covenant dalam Perjanjian Kredit?',
                        'weight' => 10,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah debitur menggunakan KAP / KJPP / Asuransi / Notaris yang bukan Rekanan atau terdapat pembekuan izin/pengenaan sanksi dari regulator atau tidak mendapat izin OJK dan Kemenkeu atau QR tidak sesuai?',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Jika debitur belum mengganti KJPP / Asuransi yang bukan rekanan, apakah penggunaan KAP / KJPP / Notaris Non Rekanan tersebut telah mendapatkan persetujuan dari Direksi atau Pemegang Kewenangan Pemutus Kredit sesuai ketentuan di SPO Pembiayaan?',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                ]
            ],
            [
                'aspect_code' => 'B',
                'questions' => [
                    [
                        'question_text' => 'Apakah ada isu negatif tentang perusahaan / pemilik / pengurus perusahaan?',
                        'weight' => 25,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah ada perubahan pengurus yang tidak memenuhi ketentuan dalam Perjanjian Kredit?',
                        'weight' => 25,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah ada perubahan pemegang saham dan pengurus yang tidak memeunhi ketentuan dalam Perjanjian Kredit?',
                        'weight' => 20,
                        'is_mandatory' => true
                    ],
                ]
            ],
            [
                'aspect_code' => 'C',
                'questions' => [
                    [
                        'question_text' => 'Apakah ada masalah dengan lokasi usaha yang mengakibatkan terganggunya operasional perusahaan?',
                        'weight' => 20,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah mesin/alat produksi tidak dapat beroperasi dengan baik dalam waktu 3 bulan terakhir?',
                        'weight' => 20,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah ada ketergantungan/konsentrasi dari buyer maupun supplier pihak ketiga?',
                        'weight' => 20,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah utilisasi produksi mengalami penurunan lebih dari 30%?',
                        'weight' => 20,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah kisaran jumlah persediaan barang saat on the spot tidak mencerminkan nilai persediaan barang dalam laporan keuangan?',
                        'weight' => 20,
                        'is_mandatory' => false
                    ],
                ]
            ],
            [
                'aspect_code' => 'D',
                'questions' => [
                    [
                        'question_text' => 'Apakah terjadi perubahan penggunaan agunan yang dapat mempengaruhi proses eksekusi di masa mendatang?',
                        'weight' => 15,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah terdapat agunan yang belum diikat secara sempurna sesuai dengan jangka waktu dan ketentuan yang berlaku?',
                        'weight' => 30,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah penilaian agunan telah melampaui jangka waktu yang telah ditentukan?',
                        'weight' => 15,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah ada penutupan asuransi yang telah jatuh tempo dan belum diperpanjang (termasuk tunggakan pembayaran premi)?',
                        'weight' => 15,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah SCR nilai pasar total agunan mengalami penurunan dari periode sebelumnya (pengajuan baru/annual review/ perpanjangan)?',
                        'weight' => 10,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah ada masalah hukum terkait agunan?',
                        'weight' => 10,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Untuk agunan AR dan Inventory, apakah belum dilakukan update fidusia berkala sesuai dengan ketentuan perjanjian kredit?',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                ]
            ],
            [
                'aspect_code' => 'E',
                'questions' => [
                    [
                        'question_text' => 'Apakah perusahaan mengalami kerugian yang lebih besar dibandingkan dengan proyeksi keuangan yang telah ditetapkan? (setelah Commercial Operational Date untuk Project Financing)',
                        'weight' => 10,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah perusahaan mengalami penurunan penjualan lebih dari 20% dibandingkan periode sebelumnya? Yoy',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah sumber dana pelunasan kewajiban/angsuran tidak sepenuhnya  berasal dari cash flow usaha nasabah?',
                        'weight' => 5,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah DER : a. maksimal 5 kali (Kontraktor / Trading); <=5x b. maksimal 3 kali (Manufaktur); <=3x',
                        'weight' => 10,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah rasio DSCR > 100%? Apakah rasio DSCR < 100%? a. 2 (dua) tahun berturut-turut b. Tidak berturut-turut',
                        'weight' => 10,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah pernah terjadi tunggakan/past due kewajiban (Cash loan maupun Non cash loan) dalam 6 bulan terakhir?',
                        'weight' => 5,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah current ratio debitur <100%?',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah posisi modal perusahaan negatif?',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah debitur memiliki potensi kewajiban membayar denda / claim / tagihan akibat sengketa pajak / pihak ketiga lainnya atau mengalami gagal bayar atas surat berharga yang diterbitkan, yang dapat mengganggu pembayaran kewajiban kepada LPEI?',
                        'weight' => 5,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah nasabah tidak menyampaikan informasi / laporan keuangan secara tertib? (selambat-lambatnya diterima 3 bulan untuk laporan posisi triwulan sebelumnya) a. Laporan keuangan triwulan (inhouse) diterima lebih dari 2 bulan/tidak sesuai dengan ketentuan perjanjian kredit b. Laporan keuangan audited diterima lebih dari 6 bulan/tidak sesuai dengan ketentuan perjanjian kredit',
                        'weight' => 5,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah nasabah tidak mendapatkan dukungan yang positif dari perusahaan afiliasi atau grup usaha? ',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah ada tambahan kredit dari Bank/Institusi keuangan lain tanpa izin/persetujuan LPEI? (kecuali ditentukan lain oleh komite)',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah fasilitas kredit telah jatuh tempo dan belum dilakukan adendum PK?',
                        'weight' => 5,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah mutasi transaksi di rekening operasional Debitur melebihi 70% dari total omset?',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah realisasi penjualan di bawah 90% dari proyeksi penjualan yang digunakan untuk perhitungan kebutuhan pembiayaan?',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah komposisi Stok Piutang (AR+INV) tidak mencerminkan OS modal kerja?',
                        'weight' => 5,
                        'is_mandatory' => false
                    ],
                ]
            ],
            [
                'aspect_code' => 'F',
                'questions' => [
                    [
                        'question_text' => 'Apakah produk kurang kompetitif di market?',
                        'weight' => 40,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah terjadi gejolak/penurunan kondisi sektor usaha lain yang dapat berdampak negatif terhadap kondisi sektor usaha debitur?',
                        'weight' => 35,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah terjadi perubahan regulasi yang berdampak negatif pada penjualan debitur?',
                        'weight' => 25,
                        'is_mandatory' => false
                    ],
                ]
            ],
            [
                'aspect_code' => 'G',
                'questions' => [
                    [
                        'question_text' => 'Apakah nasabah mengelola lingkungan hidup dan masyarakat disekitar lokasi usaha dengan tidak baik sehingga memberikan dampak yang negatif terhadap lingkungan sekitarnya?',
                        'weight' => 40,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah debitur atau sektor usaha debitur berpotensi menghadapi isu lingkungan hidup / perubahan iklim yang dapat mempengaruhi secara signifikan kelangsungan / sustainability usahanya?',
                        'weight' => 35,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah terdapat ketidaksesuaian AMDAL/ketentuan lainnya pada usaha nasabah?',
                        'weight' => 25,
                        'is_mandatory' => false
                    ],
                ]
            ],
            [
                'aspect_code' => 'H',
                'questions' => [
                    [
                        'question_text' => 'Apakah nasabah menggunakan fasilitas kredit untuk tujuan lain diluar yang sudah disepakati?',
                        'weight' => 30,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah sumber dan penggunaan dana tidak mencerminkan prinsip pembelanjaan perusahaan yang sehat (tercermin pada rasio (WI - STD) bernilai negatif?',
                        'weight' => 20,
                        'is_mandatory' => false
                    ],
                    [
                        'question_text' => 'Apakah ada fasilitas dari Bank/financial institution lain dengan kolektibilitas NPL (past due) dalam 3 bulan terakhir?',
                        'weight' => 20,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah progress project tidak sesuai dengan rencana yang disepakati dengan LPEI (Untuk KIE)?',
                        'weight' => 10,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah realisasi progress proyek terlambat berdasarkan tahapan penyelesaian proyek atau terdapat cost overrun berdasarkan RAB yang dapat mengganggu cash flow nasabah? (untuk KIE)',
                        'weight' => 10,
                        'is_mandatory' => true
                    ],
                    [
                        'question_text' => 'Apakah hasil trade checking nasabah terdapat informasi yang negatif?',
                        'weight' => 10,
                        'is_mandatory' => false
                    ],
                ]
            ],
        ];

        foreach ($questions as $aspectQuestions) {
            if (!isset($aspectVersions[$aspectQuestions['aspect_code']])) continue;
            
            $aspectVersion = $aspectVersions[$aspectQuestions['aspect_code']];
            
            foreach ($aspectQuestions['questions'] as $index => $questionData) {
                $question = Question::firstOrCreate([]);
                
                $questionVersion = QuestionVersion::firstOrCreate([
                    'question_id' => $question->id,
                    'aspect_version_id' => $aspectVersion->id,
                    'version_number' => 1,
                    'question_text' => $questionData['question_text'],
                    'weight' => $questionData['weight'],
                    'is_mandatory' => $questionData['is_mandatory'],
                ]);

                $this->addVisibilityRules($questionVersion, $aspectQuestions['aspect_code'], $index);
            }
        }

        $this->command->info('40 pertanyaan dengan versi dan visibility rules berhasil dibuat.');
    }

    /**
     * Tambahkan visibility rules untuk pertanyaan tertentu
     */
    private function addVisibilityRules($questionVersion, $aspectCode, $questionIndex)
    {
        $visibilityRules = [];

        switch ($aspectCode) {
            case 'A':
                if ($questionIndex === 3) {
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya jika jenis agunan adalah properti',
                        'source_type' => 'borrower_facility',
                        'source_field' => 'collateral_type',
                        'operator' => 'equals',
                        'value' => 'property'
                    ];
                }
                if ($questionIndex === 4) {
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya jika nilai agunan > 1 miliar',
                        'source_type' => 'borrower_facility',
                        'source_field' => 'collateral_value',
                        'operator' => 'greater_than',
                        'value' => '1000000000'
                    ];
                }
                if ($questionIndex === 9) {
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya jika nilai agunan > 1 miliar',
                        'source_type' => 'borrower_facility',
                        'source_field' => 'collateral_value',
                        'operator' => 'greater_than',
                        'value' => '1000000000'
                    ];
                }
                break;

            case 'D': // Aspek Agunan/Jaminan
                if ($questionIndex === 3) { // Pertanyaan lokasi agunan strategis
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya jika jenis agunan adalah properti',
                        'source_type' => 'borrower_facility',
                        'source_field' => 'collateral_type',
                        'operator' => 'equals',
                        'value' => 'property'
                    ];
                }
                if ($questionIndex === 4) { // Pertanyaan asuransi agunan
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya jika nilai agunan > 1 miliar',
                        'source_type' => 'borrower_facility',
                        'source_field' => 'collateral_value',
                        'operator' => 'greater_than',
                        'value' => '1000000000'
                    ];
                }
                break;

            case 'E': // Aspek Keuangan
                if ($questionIndex === 4) { // Pertanyaan kewajiban jangka pendek
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya jika jenis fasilitas adalah kredit modal kerja',
                        'source_type' => 'borrower_facility',
                        'source_field' => 'facility_type',
                        'operator' => 'equals',
                        'value' => 'working_capital'
                    ];
                }
                break;

            case 'G': // Aspek AMDAL
                if ($questionIndex === 0) { // Pertanyaan dokumen AMDAL
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya jika sektor usaha memerlukan AMDAL',
                        'source_type' => 'borrower_detail',
                        'source_field' => 'business_sector',
                        'operator' => 'in',
                        'value' => 'manufacturing,mining,energy,chemical'
                    ];
                }
                if ($questionIndex === 2) { // Pertanyaan pengelolaan limbah
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya untuk industri dengan limbah B3',
                        'source_type' => 'borrower_detail',
                        'source_field' => 'business_sector',
                        'operator' => 'in',
                        'value' => 'manufacturing,chemical,mining'
                    ];
                }
                break;

            case 'C': // Aspek Teknis Produksi
                if ($questionIndex === 1) { // Pertanyaan teknologi produksi
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya untuk perusahaan manufaktur',
                        'source_type' => 'borrower_detail',
                        'source_field' => 'business_sector',
                        'operator' => 'equals',
                        'value' => 'manufacturing'
                    ];
                }
                break;

            case 'F': // Aspek Pemasaran
                if ($questionIndex === 3) { // Pertanyaan brand recognition
                    $visibilityRules[] = [
                        'description' => 'Tampilkan hanya jika omzet > 50 miliar',
                        'source_type' => 'borrower_detail',
                        'source_field' => 'annual_revenue',
                        'operator' => 'greater_than',
                        'value' => '50000000000'
                    ];
                }
                break;
        }

        // Buat visibility rules
        foreach ($visibilityRules as $ruleData) {
            \App\Models\VisibilityRule::firstOrCreate([
                'entity_type' => 'App\\Models\\QuestionVersion',
                'entity_id' => $questionVersion->id,
                'source_type' => $ruleData['source_type'],
                'source_field' => $ruleData['source_field'],
                'operator' => $ruleData['operator'],
            ], [
                'description' => $ruleData['description'],
                'value' => $ruleData['value'],
            ]);
        }
    }
}
