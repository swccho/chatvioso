<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;

class WorkspacePolicy
{
    public function view(User $user, Workspace $workspace): bool
    {
        return $this->getMember($user, $workspace) !== null;
    }

    public function update(User $user, Workspace $workspace): bool
    {
        $member = $this->getMember($user, $workspace);
        return $member !== null && $member->isOwnerOrAdmin();
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        $member = $this->getMember($user, $workspace);
        return $member !== null && $member->isOwner();
    }

    public function invite(User $user, Workspace $workspace): bool
    {
        $member = $this->getMember($user, $workspace);
        return $member !== null && $member->isOwnerOrAdmin();
    }

    public function updateMember(User $user, Workspace $workspace): bool
    {
        $member = $this->getMember($user, $workspace);
        return $member !== null && $member->isOwnerOrAdmin();
    }

    public function removeMember(User $user, Workspace $workspace, WorkspaceMember $member): bool
    {
        $currentMember = $this->getMember($user, $workspace);
        if ($currentMember === null) {
            return false;
        }
        if ($member->user_id === $user->id) {
            return true;
        }
        return $currentMember->isOwnerOrAdmin();
    }

    private function getMember(User $user, Workspace $workspace): ?WorkspaceMember
    {
        return $workspace->members()->where('user_id', $user->id)->first();
    }
}
