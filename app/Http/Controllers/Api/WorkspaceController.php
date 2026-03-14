<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateWorkspaceAction;
use App\Http\Requests\StoreWorkspaceRequest;
use App\Http\Requests\UpdateWorkspaceRequest;
use App\Http\Resources\WorkspaceResource;
use App\Http\Resources\WorkspaceWithRoleResource;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorkspaceController extends ApiController
{
    public function __construct(
        private CreateWorkspaceAction $createWorkspace
    ) {}

    public function index(): JsonResponse
    {
        $user = request()->user();
        $workspaces = Workspace::whereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->with(['members' => fn ($q) => $q->where('user_id', $user->id)])
            ->get();

        return $this->success(WorkspaceWithRoleResource::collection($workspaces));
    }

    public function store(StoreWorkspaceRequest $request): JsonResponse
    {
        $user = $request->user();
        $workspace = $this->createWorkspace->execute(
            $user,
            $request->validated('name'),
            $request->validated('description')
        );

        return $this->success(new WorkspaceResource($workspace), 'Workspace created.', 201);
    }

    public function show(Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);
        $workspace->load('owner');
        return $this->success(new WorkspaceResource($workspace));
    }

    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);
        $workspace->update($request->validated());
        return $this->success(new WorkspaceResource($workspace->fresh()));
    }

    public function uploadLogo(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:2048'],
        ], [
            'logo.required' => 'Please select an image.',
            'logo.image' => 'The file must be an image.',
            'logo.max' => 'The image may not be greater than 2 MB.',
        ]);

        $file = $request->file('logo');
        if ($workspace->logo_path && Storage::disk('public')->exists($workspace->logo_path)) {
            Storage::disk('public')->delete($workspace->logo_path);
        }
        $path = $file->store('workspaces/'.$workspace->id, 'public');
        $workspace->update(['logo_path' => $path]);

        return $this->success([
            'logo_url' => Storage::disk('public')->url($path),
        ], 'Logo updated.');
    }
}
