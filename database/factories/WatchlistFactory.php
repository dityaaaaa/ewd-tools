<?php

namespace Database\Factories;

use App\Models\Borrower;
use App\Models\Report;
use App\Models\User;
use App\Enums\WatchlistStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Watchlist>
 */
class WatchlistFactory extends Factory
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
            'report_id' => Report::factory(),
            'status' => WatchlistStatus::ACTIVE->value,
            'added_by' => User::factory(),
        ];
    }
}
