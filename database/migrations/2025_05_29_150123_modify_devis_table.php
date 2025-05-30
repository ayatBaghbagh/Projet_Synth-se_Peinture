<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devis', function (Blueprint $table) {
            // Modifier date_creation en timestamp avec valeur par défaut CURRENT_TIMESTAMP
            $table->timestamp('date_creation')->useCurrent()->change();
        });
    }

    public function down(): void
    {
        Schema::table('devis', function (Blueprint $table) {
            // Revenir à type date sans valeur par défaut (ou selon l'ancien état)
            $table->date('date_creation')->change();
        });
    }
};
