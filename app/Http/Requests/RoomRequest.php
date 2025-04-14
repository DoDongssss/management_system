<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class RoomRequest extends FormRequest
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
        return [
            'room_number' => [
                'required',
                'string',
                'max:250',
                Rule::unique('rooms', 'room_number')->ignore($this->route('room')),
            ],
            'name'          => 'required|string|max:255',
            'type'          => 'required|string|max:255',
            'image'        => 'nullable',
            'status'        => 'required|string|max:255',
            'is_active'     => 'nullable|boolean',
        ];
    }
}
