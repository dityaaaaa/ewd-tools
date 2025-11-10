<?php

namespace App\Data;

use App\Enums\Classification; //

/**
 * Objek data internal untuk menyimpan hasil kalkulasi per aspek.
 */
readonly class AspectScoreDto
{
    public function __construct(
        public int $aspectVersionId,
        public float $totalScore,
        public Classification $classification
    ) {
    }
}