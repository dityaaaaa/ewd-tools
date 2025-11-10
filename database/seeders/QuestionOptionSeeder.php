<?php

namespace Database\Seeders;

use App\Models\QuestionVersion;
use App\Models\QuestionOption;
use Illuminate\Database\Seeder;

class QuestionOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua question versions dengan relasi
        $questionVersions = QuestionVersion::with(['aspectVersion.aspect'])->get();

        foreach ($questionVersions as $index => $questionVersion) {
            $aspectCode = $questionVersion->aspectVersion->aspect->code;
            $questionIndex = $index % 5; // Karena setiap aspek punya 5 pertanyaan
            
            // Buat opsi jawaban unik untuk setiap pertanyaan
            $options = $this->getUniqueOptionsForQuestion($aspectCode, $questionIndex, $questionVersion->is_mandatory);

            // Buat question options
            foreach ($options as $optionData) {
                QuestionOption::firstOrCreate([
                    'question_version_id' => $questionVersion->id,
                    'option_text' => $optionData['option_text'],
                ], [
                    'score' => $optionData['score'],
                ]);
            }
        }

        $this->command->info('Opsi jawaban unik untuk semua pertanyaan berhasil dibuat.');
    }

    /**
     * Mendapatkan opsi jawaban unik berdasarkan aspek dan pertanyaan
     */
    private function getUniqueOptionsForQuestion($aspectCode, $questionIndex, $isMandatory)
    {
        $optionsMap = [
            'A' => [
                0 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                1 => [
                    ['option_text' => 'Ya', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                2 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                3 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                4 => [
                    ['option_text' => 'Ya', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                5 => [
                    ['option_text' => 'Ya', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                6 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                7 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                8 => [
                    ['option_text' => 'Ya', 'score' => 100],
                    ['option_text' => 'Tidak', 'score' => -50],
                ],
            ],
            'B' => [
                0 => [
                    ['option_text' => 'Ya', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                1 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                2 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
            ],
            'C' => [
                0 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                1 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                    ['option_text' => 'N/A', 'score' => 100],
                ],
                2 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                3 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                4 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
            ],
            'D' => [ 
                0 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                1 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                2 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                3 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                4 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                5 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                6 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                    ['option_text' => 'N/A', 'score' => 100],
                ],
            ],
            'E' => [
                0 => [
                    ['option_text' => 'Ya', 'score' => 20],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                1 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                2 => [
                    ['option_text' => 'Ya', 'score' => 20],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                3 => [
                    ['option_text' => '> 5x', 'score' => -50],
                    ['option_text' => '<= 5x', 'score' => 100],
                ],
                4 => [
                    ['option_text' => '>100%', 'score' => 100],
                    ['option_text' => '<100% (1 Tahun)', 'score' => 50],
                    ['option_text' => '<100% (2 Tahun)', 'score' => -50],
                ],
                5 => [
                    ['option_text' => 'Ya (PDO >= 5 hr)', 'score' => -50],
                    ['option_text' => 'Ya (PDO <5 hr dan Freq.>=2x)', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                6 => [
                    ['option_text' => 'Ya', 'score' => -100],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                7 => [
                    ['option_text' => 'Ya', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                8 => [
                    ['option_text' => 'Ya', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                9 => [
                    ['option_text' => 'Tidak', 'score' => 100],
                    ['option_text' => 'Ya (inhouse >= 2 bulan)', 'score' => -500],
                    ['option_text' => 'Ya (audited >= 6 bulan)', 'score' => -500],
                ],
                10 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                    ['option_text' => 'Non-group', 'score' => 0],
                ],
                11 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                12 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                13 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                14 => [
                    ['option_text' => 'Ya', 'score' => 0],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                15 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                    ['option_text' => 'N/A', 'score' => 100],
                ],
            ],
            'F' => [
                0 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                1 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                2 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
            ],
            'G' => [
                0 => [
                    ['option_text' => 'Ya', 'score' => 20],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                1 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                2 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
            ],
            'H' => [
                0 => [
                    ['option_text' => 'Ya', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 80.00],
                ],
                1 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 75.00],
                ],
                2 => [
                    ['option_text' => 'Ya', 'score' => -50],
                    ['option_text' => 'Tidak', 'score' => 80.00],
                ],
                3 => [
                    ['option_text' => 'Ya', 'score' => 20],
                    ['option_text' => 'Tidak', 'score' => 80.00],
                ],
                4 => [
                    ['option_text' => 'Ya', 'score' => 20],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
                5 => [
                    ['option_text' => 'Ya', 'score' => 50],
                    ['option_text' => 'Tidak', 'score' => 100],
                ],
            ],
        ];

        $options = $optionsMap[$aspectCode][$questionIndex] ?? [
            ['option_text' => 'Ya', 'score' => 100.00],
            ['option_text' => 'Tidak', 'score' => 0.00],
        ];

        return $options;
    }
}