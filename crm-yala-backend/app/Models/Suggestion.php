<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Suggestion extends Model
{
    use HasFactory;

    protected $table = 'suggestions';

    protected $fillable = [
        'captacion_id',
        'description',
    ];

    public function captacion()
    {
        return $this->belongsTo(Captacion::class, 'captacion_id');
    }

    // Mutator para guardar en Mayúsculas automáticamente
    public function setDescriptionAttribute($value)
    {
        $this->attributes['description'] = mb_strtoupper($value, 'UTF-8');
    }
}
