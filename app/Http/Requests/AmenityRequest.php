<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Handle validation for Amenity requests.
 */
class AmenityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
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
                Rule::unique('amenities', 'name')->ignore($amenityId),
            ],
            'icon'          => 'nullable|string|max:255',
            'is_active'     => 'nullable|boolean',
        ];
    }
}
