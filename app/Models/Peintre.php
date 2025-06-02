<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Peintre extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

    protected $primaryKey = 'num_peintre'; // Clé primaire personnalisée
    public $incrementing = true; // true si c'est un integer auto-incrémenté
    protected $keyType = 'int'; // Type de la clé primaire

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'tele',
        'disponibilite',
        'password',
        'block',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}