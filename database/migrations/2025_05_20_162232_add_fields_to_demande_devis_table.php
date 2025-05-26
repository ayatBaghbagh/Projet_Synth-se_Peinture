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
    Schema::table('demande_devis', function (Blueprint $table) {
        $table->string('couleur_peinture')->nullable();
        $table->string('finition')->nullable();
    });
}

public function down(): void
{
    Schema::table('demande_devis', function (Blueprint $table) {
        $table->dropColumn(['couleur_peinture', 'finition']);
    });
}

};
