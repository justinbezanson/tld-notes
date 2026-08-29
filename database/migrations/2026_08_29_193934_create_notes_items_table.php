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
        Schema::create('notes_items', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('note_id');
            $table->string('location_id', 255)->nullable();
            $table->string('item_id', 255)->nullable();
            $table->string('item_name', 255);
            $table->integer('quantity')->default(0);
            $table->timestamps();

            $table->foreign('note_id')->references('id')->on('notes')->cascadeOnDelete();
            $table->index('note_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes_items');
    }
};
