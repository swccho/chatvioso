<?php

namespace App\Actions;

use App\Models\Workspace;
use App\Models\WorkspaceMember;

final class UpdateMemberRoleAction
{
    public function execute(Workspace $workspace, WorkspaceMember $member, string $newRole): WorkspaceMember
    {
        if ($member->isOwner() && $newRole !== WorkspaceMember::ROLE_OWNER) {
            $ownerCount = $workspace->members()->where('role', WorkspaceMember::ROLE_OWNER)->count();
            if ($ownerCount <= 1) {
                throw new \InvalidArgumentException('Workspace must have at least one owner.');
            }
        }

        $member->update(['role' => $newRole]);
        return $member->fresh(['user']);
    }
}
