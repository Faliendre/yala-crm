<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        
        $rules = [
            'username' => 'required|string|unique:users,username,' . $id,
        ];

        if ($this->user()->role === 'admin') {
            $rules['role'] = 'required|in:admin,seller';
        }

        if ($this->has('password') && !empty($this->password)) {
            $rules['password'] = 'required|string|min:6';
        }

        $rules['avatar'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048';

        return $rules;
    }
}
