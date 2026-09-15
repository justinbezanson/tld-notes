<?php

namespace App\Http\Controllers;

use App\Actions\CreateRegionAction;
use App\Http\Requests\StoreRegionRequest;
use App\Models\Run;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class RegionController extends Controller
{
    public function store(StoreRegionRequest $request, CreateRegionAction $action, Run $run): RedirectResponse
    {
        $action->execute(
            $request->user(),
            $run,
            $request->string('region_id')->toString(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Region added.')]);

        return back();
    }
}
