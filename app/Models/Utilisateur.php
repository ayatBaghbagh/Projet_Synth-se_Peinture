<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, Notifiable,HasFactory;

    protected $table = 'utilisateurs';
    protected $primaryKey = 'num_User';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'num_User',
        'nom',
        'prenom',
        'email',
        'Phone',
        'password',
        'block',
        'remember_token',
        'role',// admin ou chef_equipe
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}