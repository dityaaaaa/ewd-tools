<?php

namespace Database\Seeders;

use App\Models\Aspect;
use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\AspectVersion;
use App\Models\AspectTemplateVersion;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat template utama
        $template = Template::firstOrCreate([]);

        // Buat versi template
        $templateVersion = TemplateVersion::firstOrCreate([
            'template_id' => $template->id,
            'version_number' => 1,
        ], [
            'name' => 'Template Monitoring Kredit 2025',
            'description' => 'Template standar untuk monitoring kredit tahun 2025 dengan 4 aspek penilaian utama.',
        ]);

        // Ambil semua aspects
        $aspects = Aspect::with('latestAspectVersion')->get();

        // Definisi bobot untuk setiap aspek
        $aspectWeights = [
            'A' => 0.40, // Aspek Keuangan - Bobot tertinggi
            'B' => 0.25, // Aspek Manajemen - Bobot sedang-tinggi
            'C' => 0.20, // Aspek Usaha - Bobot sedang
            'D' => 0.15, // Aspek Hukum & Kepatuhan - Bobot terendah
        ];

        // Hubungkan aspects dengan template version beserta bobotnya
        foreach ($aspects as $aspect) {
            $aspectCode = $aspect->code;
            
            if (isset($aspectWeights[$aspectCode])) {
                AspectTemplateVersion::firstOrCreate([
                    'template_version_id' => $templateVersion->id,
                    'aspect_id' => $aspect->id,
                ], [
                    'weight' => $aspectWeights[$aspectCode],
                ]);
            }
        }

        $this->command->info('Template monitoring dengan 4 aspek dan bobot berhasil dibuat.');
    }
}