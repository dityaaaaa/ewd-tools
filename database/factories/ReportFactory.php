<?php

namespace Database\Factories;

use App\Models\Borrower;
use App\Models\Period;
use App\Models\Template;
use App\Models\User;
use App\Enums\ReportStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'borrower_id' => Borrower::factory(),
            'period_id' => Period::factory(),
            'template_id' => Template::factory(),
            'created_by' => User::factory(),
            'status' => ReportStatus::SUBMITTED->value,
            'submitted_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
