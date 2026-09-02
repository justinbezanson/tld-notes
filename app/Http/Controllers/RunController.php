<?php

namespace App\Http\Controllers;

use App\Actions\GetRunsAction;
use App\Http\Requests\GetRunsRequest;
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
}
