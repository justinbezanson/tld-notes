<?php

namespace App\Http\Requests;

use App\Concerns\NoteValidationRules;
use App\Models\Note;
use App\Models\Run;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
{
    use NoteValidationRules;

    /**
     * Determine if the user is authorized to make this request. The run policy
     * establishes ownership, so the note only has to belong to that run.
     */
    public function authorize(): bool
    {
        /** @var User|null $user */
        $user = $this->user();

        /** @var Run $run */
        $run = $this->route('run');

        $note = $this->route('note');

        if ($user === null || ! $user->can('update', $run)) {
            return false;
        }

        return $note instanceof Note && $note->run_id === $run->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->noteRules();
    }
}
