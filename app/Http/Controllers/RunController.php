<?php

namespace App\Http\Controllers;

use App\Actions\CreateRunAction;
use App\Actions\GetRunsAction;
use App\Http\Requests\GetRunsRequest;
use App\Http\Requests\StoreRunRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RunController extends Controller
{
    public function index(GetRunsRequest $request, GetRunsAction $action): Response
    {
        $runs = $action->execute($request->user());

        return inertia('Runs/Index', [
            'runs' => $runs,
        ]);
    }

    public function store(StoreRunRequest $request, CreateRunAction $action): RedirectResponse
    {
        $action->execute(
            $request->user(),
            $request->string('name')->toString(),
            $request->string('run_type')->toString(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Run created.')]);

        return to_route('dashboard');
    }
}
