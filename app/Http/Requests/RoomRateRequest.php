<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomRateRequest extends FormRequest
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
        $roomRateId = $this->route('id'); 

        return [
            'room_id' => ['required', 'integer'],
            'durations_hours' => [
                'required',
                'integer',
                Rule::unique('rates')
                    ->where(function ($query) {
                        return $query->where('room_id', $this->room_id);
                    })
                    ->ignore($roomRateId)
            ],
            'price'     => 'required|integer',
            'is_active' => 'nullable|boolean',
        ];
    }
}
