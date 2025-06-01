<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('taches_projet', function (Blueprint $table) {
            // S'assurer que la colonne projet_id existe et est unsignedBigInteger
            // Puis ajouter la clé étrangère
            $table->foreign('projet_id')
                ->references('id_projet')
                ->on('projets')
                ->onDelete('cascade'); // optionnel : supprimer les taches si projet supprimé
        });
    }

    public function down()
    {
        Schema::table('taches_projet', function (Blueprint $table) {
            $table->dropForeign(['projet_id']);
        });
    }
};
