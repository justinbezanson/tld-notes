<?php

namespace App\Http\Requests;

use App\Models\Run;
use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request. The run policy
     * establishes ownership, so the task only has to belong to that run.
     */
    public function authorize(): bool
    {
        /** @var User|null $user */
        $user = $this->user();

        /** @var Run $run */
        $run = $this->route('run');

        $task = $this->route('task');

        if ($user === null || ! $user->can('update', $run)) {
            return false;
        }

        return $task instanceof Task && $task->run_id === $run->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', 'boolean'],
        ];
    }
}
