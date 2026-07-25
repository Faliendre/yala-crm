<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCaptacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'business_name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'address' => 'required|string',
            'google_maps' => 'nullable|string',
            'business_hours' => 'nullable|string',
            'accepts_card' => 'boolean',
            'gave_card' => 'boolean',
            'licensing_type' => 'nullable|string',
            'offered_hosting' => 'boolean',
            'hosting_price' => 'nullable|numeric|min:0',
            'owner_name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'required|string',
            'whatsapp' => 'nullable|string',
            'offered_application' => 'nullable|string',
            'offered_price' => 'nullable|numeric|min:0',
            'promotion' => 'nullable|string',
            'status' => 'required|in:Captación,Follow-up,Training,Negotiation,Closed Sale,Lost',
            'notes' => 'nullable|string',
        ];

        if ($this->user()->role === 'admin') {
            $rules['seller_id'] = 'required|exists:users,id';
        }

        return $rules;
    }
}
