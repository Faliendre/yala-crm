<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;

    protected $table = 'sales';

    protected $fillable = [
        'captacion_id',
        'sold_system',
        'price',
        'discount',
        'commission',
        'sale_date',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'commission' => 'decimal:2',
        'sale_date' => 'date',
    ];

    public function captacion()
    {
        return $this->belongsTo(Captacion::class, 'captacion_id');
    }

    public function commissionPayout()
    {
        return $this->hasOne(Commission::class, 'sale_id');
    }

    // Mutator para guardar en Mayúsculas automáticamente
    public function setSoldSystemAttribute($value)
    {
        $this->attributes['sold_system'] = mb_strtoupper($value, 'UTF-8');
    }
}
