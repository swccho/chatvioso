<?php

namespace App\Actions;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMember;

final class AcceptWorkspaceInvitationAction
{
    public function execute(WorkspaceInvitation $invitation, User $user): WorkspaceMember
    {
        if ($invitation->isAccepted()) {
            throw new \InvalidArgumentException('Invitation has already been accepted.');
        }
        if ($invitation->isExpired()) {
            throw new \InvalidArgumentException('Invitation has expired.');
        }
        if (strtolower($invitation->email) !== strtolower($user->email)) {
            throw new \InvalidArgumentException('Invitation email does not match your account.');
        }

        $member = WorkspaceMember::create([
            'workspace_id' => $invitation->workspace_id,
            'user_id' => $user->id,
            'role' => $invitation->role,
        ]);

        $invitation->update(['accepted_at' => now()]);

        return $member->load('workspace', 'user');
    }
}
