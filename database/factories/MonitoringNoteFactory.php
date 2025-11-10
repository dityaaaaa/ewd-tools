<?php

namespace Database\Factories;

use App\Models\MonitoringNote;
use Illuminate\Database\Eloquent\Factories\Factory;

class MonitoringNoteFactory extends Factory
{
    protected $model = MonitoringNote::class;

    public function definition(): array
    {
        return [
            'watchlist_reason' => $this->faker->sentence(8),
            'account_strategy' => $this->faker->paragraph(),
        ];
    }
}