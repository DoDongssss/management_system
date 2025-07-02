<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Handle validation for Room requests.
 */
class RoomRequest extends FormRequest
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
        $roomId = $this->route('id');
        
        return [
            'room_number' => [
                'required',
                'string',
                'max:250',
                Rule::unique('rooms', 'room_number')->ignore($roomId),
            ],
            'name'          => 'required|string|max:255',
            'type'          => 'required|string|max:255',
            'room_amenities' => 'nullable|string', // Consider: 'array' if frontend sends as array
            'image'        => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'status'        => 'required|string|max:255',
            'is_active'     => 'nullable|boolean',
        ];
    }
}
