<?php

namespace App\Http\Requests;

use App\Models\Run;
use App\Models\User;
use App\Regions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRegionRequest extends FormRequest
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
        /** @var Run $run */
        $run = $this->route('run');

        return [
            'region_id' => [
                'required',
                'string',
                Rule::in(['GENERAL', ...Regions::ids()]),
                Rule::unique('regions', 'region_id')->where('run_id', $run->id),
            ],
        ];
    }
}
