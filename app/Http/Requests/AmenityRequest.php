<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class AmenityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $amenityId = $this->route('id');
        return [
            'name' => [
                'required',
                'string',
                'max:250',
                Rule::unique('rooms', 'room_number')->ignore($amenityId),
            ],
            'icon'          => 'nullable|string|max:255',
            'is_active'     => 'nullable|boolean',
        ];
    }
}
