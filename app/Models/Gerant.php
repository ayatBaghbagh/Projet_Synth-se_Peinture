<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Gerant extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $primaryKey = 'id_gerant';
    
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'mot_de_passe',
        'role',
        'actif'
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'id_gerant');
    }

    public function notificationsNonLues()
    {
        return $this->hasMany(Notification::class, 'id_gerant')
                    ->where('lu', false)
                    ->orderBy('created_at', 'desc');
    }

    public function getNomCompletAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }
}