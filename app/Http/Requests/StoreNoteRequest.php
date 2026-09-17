<?php

namespace App\Http\Requests;

use App\Models\Run;
use App\Models\User;
use App\Regions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var User|null $user */
        $user = $this->user();

        /** @var Run $run */
        $run = $this->route('run');

        return $user?->can('update', $run) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $regionId = (string) ($this->input('region_id') ?? '');

        return [
            'region_id' => [
                'required',
                'string',
                Rule::in(['GENERAL', ...Regions::ids()]),
            ],
            'location_id' => [
                'required',
                'string',
                Rule::in(['GENERAL', ...Regions::locationsFor($regionId)]),
            ],
        ];
    }
}
