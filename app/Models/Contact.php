<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'prenom',
        'nom', 
        'email',
        'telephone',
        'sujet',
        'typeProjet',
        'message'
    ];
}