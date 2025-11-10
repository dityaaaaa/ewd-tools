<?php

namespace Tests\Unit;

use App\Models\Answer;
use App\Models\Aspect;
use App\Models\AspectVersion;
use App\Models\Borrower;
use App\Models\BorrowerDetail;
use App\Models\Period;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuestionVersion;
use App\Models\Report;
use App\Models\ReportAspect;
use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\VisibilityRule;
use App\Models\User;
use App\Services\ReportCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportCalculationServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Hidden questions (due to visibility) must contribute their max score
     * so weighting remains stable.
     */
    public function test_hidden_questions_counted_with_max_score(): void
    {
        // Borrower and context
        $borrower = Borrower::create(['name' => 'Acme']);
        BorrowerDetail::create([
            'borrower_id' => $borrower->id,
            'borrower_group' => 'Group A',
            'purpose' => \App\Enums\FacilityType::KIE->value,
            'economic_sector' => 'retail',
            'business_field' => 'retail',
            'borrower_business' => 'Retail Biz',
            'collectibility' => 1,
            'restructuring' => false,
        ]);

        // Template + Aspect with weight 100
        $template = Template::create();
        $tVersion = TemplateVersion::create(['template_id' => $template->id, 'version_number' => 1, 'name' => 'v1']);

        $aspect = Aspect::create(['code' => 'Z']);
        $aspectVersion = AspectVersion::create(['aspect_id' => $aspect->id, 'version_number' => 1, 'name' => 'Aspect Z v1']);
        $tVersion->aspects()->attach($aspect->id, ['weight' => 100]);

        // Questions under aspect
        $q1 = Question::create();
        $qv1 = QuestionVersion::create([
            'question_id' => $q1->id,
            'aspect_version_id' => $aspectVersion->id,
            'version_number' => 1,
            'question_text' => 'Visible question',
            'weight' => 60,
            'is_mandatory' => false,
        ]);
        // options: max 50
        $opt1a = QuestionOption::create(['question_version_id' => $qv1->id, 'option_text' => 'Low', 'score' => 0]);
        $opt1b = QuestionOption::create(['question_version_id' => $qv1->id, 'option_text' => 'High', 'score' => 50]);

        $q2 = Question::create();
        $qv2 = QuestionVersion::create([
            'question_id' => $q2->id,
            'aspect_version_id' => $aspectVersion->id,
            'version_number' => 1,
            'question_text' => 'Hidden question',
            'weight' => 40,
            'is_mandatory' => false,
        ]);
        // Hide q2 when economic_sector != 'mining' (our borrower is 'retail')
        VisibilityRule::create([
            'entity_type' => QuestionVersion::class,
            'entity_id' => $qv2->id,
            'description' => 'Only show for mining sector',
            'source_type' => 'borrower_detail',
            'source_field' => 'economic_sector',
            'operator' => '=',
            'value' => 'mining',
        ]);
        // options: max 100
        QuestionOption::create(['question_version_id' => $qv2->id, 'option_text' => 'No', 'score' => 0]);
        QuestionOption::create(['question_version_id' => $qv2->id, 'option_text' => 'Yes', 'score' => 100]);

        // User, Period & Report
        $user = User::factory()->create();
        $period = Period::create(['name' => '2025-Q1', 'start_date' => now(), 'end_date' => now()->addMonth(), 'created_by' => $user->id]);
        $report = Report::create([
            'borrower_id' => $borrower->id,
            'period_id' => $period->id,
            'template_id' => $template->id,
            'status' => \App\Enums\ReportStatus::SUBMITTED->value,
            'created_by' => $user->id,
        ]);

        // Answer only for visible question with score 50
        Answer::create([
            'report_id' => $report->id,
            'question_version_id' => $qv1->id,
            'question_option_id' => $opt1b->id,
            'notes' => null,
        ]);

        // Calculate
        $service = app(ReportCalculationService::class);
        $service->calculateAndStoreSummary($report);

        // Assert: Aspect total = 60% * 50 + 40% * 100 = 30 + 40 = 70
        $aspectRow = ReportAspect::where('report_id', $report->id)
            ->where('aspect_version_id', $aspectVersion->id)
            ->firstOrFail();

        // PRINT perbedaan kalkulasi (visible vs hidden contribution)
        $visibleContribution = ((float)$qv1->weight / 100) * (float)$opt1b->score;
        $hiddenMaxScore = (float) QuestionOption::where('question_version_id', $qv2->id)->max('score');
        $hiddenContribution = ((float)$qv2->weight / 100) * $hiddenMaxScore;
        $actualTotal = (float) $aspectRow->total_score;
        echo "Visible: {$qv1->weight}% * {$opt1b->score} = " . number_format($visibleContribution, 2) . PHP_EOL;
        echo "Hidden: {$qv2->weight}% * {$hiddenMaxScore} = " . number_format($hiddenContribution, 2) . PHP_EOL;
        echo "Total: " . number_format($actualTotal, 2) . PHP_EOL;

        $this->assertEquals(70.00, (float) $aspectRow->total_score);
    }
}