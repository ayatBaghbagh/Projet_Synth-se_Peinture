<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnsToDemandeDevisTable extends Migration
{
    public function up()
    {
        Schema::table('demande_devis', function (Blueprint $table) {
            if (!Schema::hasColumn('demande_devis', 'statut')) {
                $table->enum('statut', ['en_attente', 'devis_envoye', 'accepte', 'refuse', 'termine'])
                      ->default('en_attente')
                      ->after('finition');
            }

            if (!Schema::hasColumn('demande_devis', 'motif_refus')) {
                $table->text('motif_refus')->nullable()->after('statut');
            }

            if (!Schema::hasColumn('demande_devis', 'date_refus')) {
                $table->timestamp('date_refus')->nullable()->after('motif_refus');
            }
        });
    }

    public function down()
    {
        Schema::table('demande_devis', function (Blueprint $table) {
            $table->dropColumn(['statut', 'motif_refus', 'date_refus']);
        });
    }
}
