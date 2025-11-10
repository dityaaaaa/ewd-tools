<?php

namespace Database\Seeders;

use App\Models\Aspect;
use App\Models\AspectVersion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AspectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aspects = [
            [
                'code' => 'A',
                'versions' => [
                    [
                        'version_number' => 1,
                        'name' => 'Aspek Hukum',
                        'description' => 'Menilai kinerja keuangan, profitabilitas, leverage, dan likuiditas perusahaan.',
                    ]
                ]
            ],
            [
                'code' => 'B',
                'versions' => [
                    [
                        'version_number' => 1,
                        'name' => 'Aspek Manajemen',
                        'description' => 'Menilai struktur organisasi, kompetensi, dan pengalaman manajemen perusahaan.',
                    ]
                ]
            ],
            [
                'code' => 'C',
                'versions' => [
                    [
                        'version_number' => 1,
                        'name' => 'Aspek Teknis Produksi',
                        'description' => 'Menilai prospek usaha, kondisi pasar, dan daya saing perusahaan.',
                    ]
                ]
            ],
            [
                'code' => 'D',
                'versions' => [
                    [
                        'version_number' => 1,
                        'name' => 'Aspek Agunan/Jaminan',
                        'description' => 'Menilai kepatuhan hukum, perizinan, dan masalah legalitas perusahaan.',
                    ]
                ]
            ],
            [
                'code' => 'E',
                'versions' => [
                    [
                        'version_number' => 1,
                        'name' => 'Aspek Keuangan',
                        'description' => 'Menilai kepatuhan hukum, perizinan, dan masalah legalitas perusahaan.',
                    ]
                ]
            ],
            [
                'code' => 'F',
                'versions' => [
                    [
                        'version_number' => 1,
                        'name' => 'Aspek Pemasaran',
                        'description' => 'Menilai kepatuhan hukum, perizinan, dan masalah legalitas perusahaan.',
                    ]
                ]
            ],
            [
                'code' => 'G',
                'versions' => [
                    [
                        'version_number' => 1,
                        'name' => 'Aspek Amdal',
                        'description' => 'Menilai kepatuhan hukum, perizinan, dan masalah legalitas perusahaan.',
                    ]
                ]
            ],
            [
                'code' => 'H',
                'versions' => [
                    [
                        'version_number' => 1,
                        'name' => 'Aspek Lainnya',
                        'description' => 'Menilai kepatuhan hukum, perizinan, dan masalah legalitas perusahaan.',
                    ]
                ]
            ],
        ];

        foreach ($aspects as $aspectData) {
            $aspect = Aspect::firstOrCreate(['code' => $aspectData['code']]);
            
            foreach ($aspectData['versions'] as $versionData) {
                $aspect->aspectVersions()->firstOrCreate(
                    ['version_number' => $versionData['version_number']],
                    [
                        'name' => $versionData['name'],
                        'description' => $versionData['description'],
                    ]
                );
            }
        }

        $this->command->info('4 aspek dengan versi berhasil dibuat.');
    }
}
