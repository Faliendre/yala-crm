<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Captacion extends Model
{
    use HasFactory;

    protected $table = 'captaciones';

    protected $fillable = [
        'business_name',
        'category',
        'address',
        'google_maps',
        'business_hours',
        'accepts_card',
        'gave_card',
        'licensing_type',
        'offered_hosting',
        'hosting_price',
        'owner_name',
        'contact_name',
        'phone',
        'whatsapp',
        'offered_application',
        'offered_price',
        'promotion',
        'status',
        'notes',
        'seller_id',
    ];

    protected $casts = [
        'accepts_card' => 'boolean',
        'gave_card' => 'boolean',
        'offered_hosting' => 'boolean',
        'offered_price' => 'decimal:2',
        'hosting_price' => 'decimal:2',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, 'captacion_id');
    }

    public function followups()
    {
        return $this->hasMany(Followup::class, 'captacion_id');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'captacion_id');
    }

    public function suggestions()
    {
        return $this->hasMany(Suggestion::class, 'captacion_id');
    }

    // Mutators para guardar en Mayúsculas automáticamente
    public function setBusinessNameAttribute($value)
    {
        $this->attributes['business_name'] = mb_strtoupper($value, 'UTF-8');
    }

    public function setCategoryAttribute($value)
    {
        $this->attributes['category'] = mb_strtoupper($value, 'UTF-8');
    }

    public function setAddressAttribute($value)
    {
        $this->attributes['address'] = mb_strtoupper($value, 'UTF-8');
    }

    public function setOwnerNameAttribute($value)
    {
        $this->attributes['owner_name'] = mb_strtoupper($value, 'UTF-8');
    }

    public function setContactNameAttribute($value)
    {
        $this->attributes['contact_name'] = $value ? mb_strtoupper($value, 'UTF-8') : null;
    }

    public function setOfferedApplicationAttribute($value)
    {
        $this->attributes['offered_application'] = $value ? mb_strtoupper($value, 'UTF-8') : null;
    }

    public function setPromotionAttribute($value)
    {
        $this->attributes['promotion'] = $value ? mb_strtoupper($value, 'UTF-8') : null;
    }

    public function setNotesAttribute($value)
    {
        $this->attributes['notes'] = $value ? mb_strtoupper($value, 'UTF-8') : null;
    }
}
