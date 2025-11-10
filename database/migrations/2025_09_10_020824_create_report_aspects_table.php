<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('report_aspects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->restrictOnDelete();
            $table->foreignId('aspect_version_id')->constrained('aspect_versions')->restrictOnDelete();
            $table->decimal('total_score', 5, 2)->default(0);
            $table->unsignedTinyInteger('classification')->default(0);
            $table->timestampsTz();
            $table->unique(['report_id', 'aspect_version_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_aspects');
    }
};
