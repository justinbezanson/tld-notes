<?php

namespace App\Http\Controllers;

use App\Actions\CreateNoteAction;
use App\Http\Requests\StoreNoteRequest;
use App\Models\Run;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class NoteController extends Controller
{
    public function store(StoreNoteRequest $request, CreateNoteAction $action, Run $run): RedirectResponse
    {
        $locationId = $request->string('location_id')->toString();

        $action->execute(
            $request->user(),
            $run,
            $request->string('region_id')->toString(),
            $locationId === 'GENERAL' ? null : $locationId,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note added.')]);

        return back();
    }
}
