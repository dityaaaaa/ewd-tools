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
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->restrictOnDelete();
            $table->foreignId('question_version_id')->constrained('question_versions')->restrictOnDelete();
            $table->foreignId('question_option_id')->constrained('question_options')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->timestampsTz();
            $table->unique(['report_id', 'question_version_id'], 'unique_report_question');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
