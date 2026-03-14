<?php

namespace App\Actions;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\WorkspaceInvitationNotification;
use Illuminate\Support\Str;

final class InviteUserToWorkspaceAction
{
    public function execute(Workspace $workspace, User $inviter, string $email, string $role): WorkspaceInvitation
    {
        $token = Str::random(64);
        while (WorkspaceInvitation::where('token', $token)->exists()) {
            $token = Str::random(64);
        }

        $invitation = WorkspaceInvitation::create([
            'workspace_id' => $workspace->id,
            'email' => $email,
            'role' => $role,
            'token' => $token,
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDays(7),
        ]);

        $invitation->load(['workspace', 'inviter']);
        $invitedUser = User::where('email', $email)->first();
        if ($invitedUser) {
            $invitedUser->notify(new WorkspaceInvitationNotification($invitation));
        }

        return $invitation;
    }
}
