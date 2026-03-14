<?php

namespace App\Http\Controllers\Api;

use App\Actions\RemoveMemberAction;
use App\Actions\UpdateMemberRoleAction;
use App\Http\Requests\UpdateWorkspaceMemberRequest;
use App\Http\Resources\WorkspaceMemberResource;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Http\JsonResponse;

class WorkspaceMemberController extends ApiController
{
    public function __construct(
        private UpdateMemberRoleAction $updateMemberRole,
        private RemoveMemberAction $removeMember
    ) {}

    public function index(Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);
        $members = $workspace->members()->with('user')->get();
        return $this->success(WorkspaceMemberResource::collection($members));
    }

    public function update(
        UpdateWorkspaceMemberRequest $request,
        Workspace $workspace,
        WorkspaceMember $member
    ): JsonResponse {
        $this->authorize('updateMember', $workspace);
        if ($member->workspace_id !== $workspace->id) {
            return $this->notFound('Member not found in this workspace.');
        }

        try {
            $member = $this->updateMemberRole->execute($workspace, $member, $request->validated('role'));
            return $this->success(new WorkspaceMemberResource($member));
        } catch (\InvalidArgumentException $e) {
            return $this->validationError(['role' => [$e->getMessage()]]);
        }
    }

    public function destroy(Workspace $workspace, WorkspaceMember $member): JsonResponse
    {
        $this->authorize('removeMember', [$workspace, $member]);
        if ($member->workspace_id !== $workspace->id) {
            return $this->notFound('Member not found in this workspace.');
        }

        try {
            $this->removeMember->execute($workspace, $member);
            return $this->success(null, 'Member removed.');
        } catch (\InvalidArgumentException $e) {
            return $this->validationError(['member' => [$e->getMessage()]]);
        }
    }
}
