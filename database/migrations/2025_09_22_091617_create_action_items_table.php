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
        Schema::create('action_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitoring_note_id')->constrained('monitoring_notes')->cascadeOnDelete();
            $table->text('action_description');
            $table->unsignedTinyInteger('item_type');
            $table->text('progress_notes')->nullable();
            $table->string('people_in_charge')->nullable();
            $table->text('notes')->nullable();
            $table->date('due_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->unsignedTinyInteger('status')->default(0);
            $table->foreignId('previous_action_item_id')->nullable()->constrained('action_items');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('action_items');
    }
};
