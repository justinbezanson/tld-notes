<?php

namespace App\Http\Controllers;

use App\Actions\CreateNoteAction;
use App\Actions\DeleteNoteAction;
use App\Actions\UpdateNoteAction;
use App\Http\Requests\DestroyNoteRequest;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Note;
use App\Models\Run;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class NoteController extends Controller
{
    public function store(StoreNoteRequest $request, CreateNoteAction $action, Run $run): RedirectResponse
    {
        $action->execute(
            $request->user(),
            $run,
            $request->string('region_id')->toString(),
            $this->locationId($request),
            $this->noteText($request),
            $request->validated('items', []),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note added.')]);

        return back();
    }

    /**
     * Update one of a run's notes. The run is type hinted so the framework binds
     * it before UpdateNoteRequest authorizes against the run policy.
     */
    public function update(UpdateNoteRequest $request, UpdateNoteAction $action, Run $run, Note $note): RedirectResponse
    {
        $action->execute(
            $note,
            $this->locationId($request),
            $this->noteText($request),
            $request->validated('items', []),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note updated.')]);

        return back();
    }

    /**
     * Delete one of a run's notes. The run is type hinted so the framework binds
     * it before DestroyNoteRequest authorizes against the run policy.
     */
    public function destroy(DestroyNoteRequest $request, DeleteNoteAction $action, Run $run, Note $note): RedirectResponse
    {
        $action->execute($note);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note deleted.')]);

        return back();
    }

    /**
     * Read the submitted location, storing the general sentinel as null.
     */
    private function locationId(StoreNoteRequest|UpdateNoteRequest $request): ?string
    {
        $locationId = $request->string('location_id')->toString();

        return $locationId === 'GENERAL' ? null : $locationId;
    }

    /**
     * Read the submitted free form text, storing an empty textarea as null.
     */
    private function noteText(StoreNoteRequest|UpdateNoteRequest $request): ?string
    {
        $noteText = $request->string('note_text')->toString();

        return $noteText === '' ? null : $noteText;
    }
}
