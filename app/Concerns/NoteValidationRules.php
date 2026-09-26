<?php

namespace App\Concerns;

use App\Items;
use App\Regions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait NoteValidationRules
{
    /**
     * Get the validation rules for a note and its item lines. The location is
     * always validated against the region carried by the same payload.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function noteRules(): array
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
