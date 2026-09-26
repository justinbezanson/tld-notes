<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The unique index on region_id is a leftover from when a note was itself a
     * region. Now that a run holds many regions and each region holds many
     * notes, it prevents a region from ever holding a second note.
     */
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropUnique(['region_id']);
            $table->index(['run_id', 'region_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropIndex(['run_id', 'region_id']);
            $table->unique('region_id');
        });
    }
};
