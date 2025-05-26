<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // dans le fichier de migration
public function up()
{
    Schema::table('projets', function (Blueprint $table) {
        $table->boolean('favoris')->default(0);
    });
}

public function down()
{
    Schema::table('projets', function (Blueprint $table) {
        $table->dropColumn('favoris');
    });
}
};
