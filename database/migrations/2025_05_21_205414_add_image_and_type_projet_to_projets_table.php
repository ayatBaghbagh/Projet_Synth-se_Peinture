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
    Schema::table('projets', function (Blueprint $table) {
        $table->string('image')->nullable()->after('titre');
        $table->enum('type_projet', ['Intérieur', 'Extérieur', 'Commercial', 'Résidentiel', 'Décoratif'])->after('image');
    });
}

public function down(): void
{
    Schema::table('projets', function (Blueprint $table) {
        $table->dropColumn(['image', 'type_projet']);
    });
}

};
