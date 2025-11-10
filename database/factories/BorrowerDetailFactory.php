<?php

namespace Database\Factories;

use App\Enums\FacilityType;
use App\Models\BorrowerDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

class BorrowerDetailFactory extends Factory
{
    protected $model = BorrowerDetail::class;

    public function definition(): array
    {
        $sectors = ['manufacturing', 'trading', 'services', 'agriculture', 'mining', 'energy'];
        $fields = ['steel', 'food', 'retail', 'logistics', 'construction', 'oil_gas'];

        return [
            'borrower_group'   => $this->faker->companySuffix(),
            'purpose'          => $this->faker->randomElement(array_map(fn($c) => $c->value, FacilityType::cases())),
            'economic_sector'  => $this->faker->randomElement($sectors),
            'business_field'   => $this->faker->randomElement($fields),
            'borrower_business'=> $this->faker->catchPhrase(),
            'collectibility'   => (string) $this->faker->numberBetween(1, 5),
            'restructuring'    => $this->faker->boolean(20),
        ];
    }
}