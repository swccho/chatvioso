<?php

namespace App\Http\Controllers\Api;

use App\Actions\AcceptWorkspaceInvitationAction;
use App\Actions\InviteUserToWorkspaceAction;
use App\Http\Requests\AcceptWorkspaceInvitationRequest;
use App\Http\Requests\StoreWorkspaceInvitationRequest;
use App\Http\Resources\WorkspaceMemberResource;
use App\Http\Resources\WorkspaceInvitationResource;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Http\JsonResponse;

class WorkspaceInvitationController extends ApiController
{
    public function __construct(
        private InviteUserToWorkspaceAction $inviteUser,
        private AcceptWorkspaceInvitationAction $acceptInvitation
    ) {}

    public function index(Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);
        $invitations = $workspace->invitations()
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->with('inviter')
            ->get();

        return $this->success(WorkspaceInvitationResource::collection($invitations));
    }

    public function store(StoreWorkspaceInvitationRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('invite', $workspace);

        $invitation = $this->inviteUser->execute(
            $workspace,
            $request->user(),
            $request->validated('email'),
            $request->validated('role')
        );
        $invitation->load('inviter');

        return $this->success(new WorkspaceInvitationResource($invitation), 'Invitation sent.', 201);
    }

    public function accept(AcceptWorkspaceInvitationRequest $request): JsonResponse
    {
        $invitation = WorkspaceInvitation::where('token', $request->validated('token'))->first();

        if (! $invitation) {
            return $this->notFound('Invitation not found.');
        }

        try {
            $member = $this->acceptInvitation->execute($invitation, $request->user());
            return $this->success(new WorkspaceMemberResource($member), 'Invitation accepted.');
        } catch (\InvalidArgumentException $e) {
            return $this->validationError(['token' => [$e->getMessage()]]);
        }
    }
}
