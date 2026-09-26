<?php

namespace App\Http\Requests;

use App\Items;
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
            'note_text' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'items' => [
                'nullable',
                'array',
                'max:100',
            ],
            'items.*' => [
                'array',
            ],
            'items.*.item_id' => [
                'nullable',
                'string',
                Rule::in(Items::ids()),
            ],
            'items.*.item_name' => [
                'required',
                'string',
                'max:255',
            ],
            'items.*.quantity' => [
                'required',
                'integer',
                'min:0',
                'max:9999',
            ],
        ];
    }
}
