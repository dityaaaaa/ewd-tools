<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Report;
use Illuminate\Database\Seeder;

class AnswerSeeder extends Seeder
{
    public function run(): void
    {
        $reports = Report::with(['template.latestTemplateVersion.aspects.latestAspectVersion.questionVersions.questionOptions'])->get();
        if ($reports->isEmpty()) {
            $this->command?->warn('No reports found. Run ReportSeeder first.');
            return;
        }

        foreach ($reports as $report) {
            if ($report->answers()->exists()) {
                continue; // skip if already seeded
            }

            $templateVersion = $report->template?->latestTemplateVersion;
            if (! $templateVersion) continue;

            $questionVersions = collect();
            foreach ($templateVersion->aspects as $aspect) {
                $qvs = $aspect->latestAspectVersion?->questionVersions ?? collect();
                $questionVersions = $questionVersions->merge($qvs);
            }

            // Seed 6-12 answers per report to simulate partial/complete forms
            $take = min($questionVersions->count(), random_int(6, 12));
            $selected = $questionVersions->shuffle()->take($take);

            foreach ($selected as $qv) {
                $option = $qv->questionOptions->random();

                Answer::factory()->create([
                    'report_id' => $report->id,
                    'question_version_id' => $qv->id,
                    'question_option_id' => $option->id,
                ]);
            }
        }

        $this->command?->info('Answers seeded for existing reports with realistic notes.');
    }
}