<?php

namespace Database\Factories;

use App\Models\User;
use App\Enums\PeriodStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Period>
 */
class PeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-1 year', 'now');
        $endDate = $this->faker->dateTimeBetween($startDate, '+3 months');
        
        return [
            'name' => $this->faker->words(3, true),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'created_by' => User::factory(),
            'status' => $this->faker->randomElement([
                PeriodStatus::DRAFT->value,
                PeriodStatus::ACTIVE->value,
                PeriodStatus::EXPIRED->value,
            ]),
        ];
    }
}
