<?php

namespace Database\Factories;

use App\Enums\ActionItemStatus;
use App\Enums\ActionItemType;
use App\Models\ActionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActionItemFactory extends Factory
{
    protected $model = ActionItem::class;

    public function definition(): array
    {
        return [
            'action_description' => $this->faker->sentence(6),
            'item_type'          => $this->faker->randomElement(array_map(fn($c) => $c->value, ActionItemType::cases())),
            'progress_notes'     => $this->faker->optional(0.6)->sentence(10),
            'people_in_charge'   => $this->faker->name(),
            'notes'              => $this->faker->optional(0.5)->sentence(8),
            'due_date'           => $this->faker->dateTimeBetween('now', '+6 months'),
            'status'             => $this->faker->randomElement(array_map(fn($c) => $c->value, ActionItemStatus::cases())),
        ];
    }
}