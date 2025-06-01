<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('projets', function (Blueprint $table) {
            // Ajoutez la colonne id_client comme clé étrangère
            $table->unsignedBigInteger('id_client')->after('id_projet');
            
            // Définissez la contrainte de clé étrangère
            $table->foreign('id_client')
      ->references('id_client') // <-- adapter ici
      ->on('clients')
      ->onDelete('cascade');

        });
    }

    public function down()
    {
        Schema::table('projets', function (Blueprint $table) {
            // Supprimez la contrainte de clé étrangère d'abord
            $table->dropForeign(['id_client']);
            
            // Puis supprimez la colonne
            $table->dropColumn('id_client');
        });
    }
};