<?php

use Illuminate\Broadcasting\BroadcastController;
use Illuminate\Support\Facades\Route;

// API routes are loaded with 'api' prefix and middleware by bootstrap/app.php
Route::post('register', [App\Http\Controllers\Api\AuthController::class, 'register'])->name('api.register');
Route::post('login', [App\Http\Controllers\Api\AuthController::class, 'login'])->name('api.login');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::match(['get', 'post'], 'broadcasting/auth', [BroadcastController::class, 'authenticate'])->name('broadcasting.auth');
    Route::post('logout', [App\Http\Controllers\Api\AuthController::class, 'logout'])->name('api.logout');
    Route::get('user', [App\Http\Controllers\Api\AuthController::class, 'user'])->name('api.user');

    Route::get('notifications/unread-count', [App\Http\Controllers\Api\NotificationController::class, 'unreadCount'])->name('api.notifications.unread-count');
    Route::post('notifications/read-all', [App\Http\Controllers\Api\NotificationController::class, 'markAllRead'])->name('api.notifications.read-all');
    Route::get('notifications', [App\Http\Controllers\Api\NotificationController::class, 'index'])->name('api.notifications.index');
    Route::post('notifications/{id}/read', [App\Http\Controllers\Api\NotificationController::class, 'markRead'])->name('api.notifications.read');

    Route::prefix('profile')->name('api.profile.')->group(function (): void {
        Route::get('/', [App\Http\Controllers\Api\ProfileController::class, 'show'])->name('show');
        Route::put('/', [App\Http\Controllers\Api\ProfileController::class, 'update'])->name('update');
        Route::post('/avatar', [App\Http\Controllers\Api\ProfileController::class, 'uploadAvatar'])->name('avatar.upload');
        Route::get('/avatar', [App\Http\Controllers\Api\ProfileController::class, 'avatar'])->name('avatar');
        Route::put('/password', [App\Http\Controllers\Api\ProfileController::class, 'updatePassword'])->name('password');
        Route::get('/notification-preferences', [App\Http\Controllers\Api\ProfileController::class, 'getNotificationPreferences'])->name('notification-preferences');
        Route::put('/notification-preferences', [App\Http\Controllers\Api\ProfileController::class, 'updateNotificationPreferences'])->name('notification-preferences.update');
    });

    Route::prefix('workspaces')->name('api.workspaces.')->group(function (): void {
        Route::get('/', [App\Http\Controllers\Api\WorkspaceController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\Api\WorkspaceController::class, 'store'])->name('store');
        Route::post('invitations/accept', [App\Http\Controllers\Api\WorkspaceInvitationController::class, 'accept'])->name('invitations.accept');
        Route::get('{workspace}', [App\Http\Controllers\Api\WorkspaceController::class, 'show'])->name('show');
        Route::get('{workspace}/search', [App\Http\Controllers\Api\WorkspaceSearchController::class, '__invoke'])->name('search');
        Route::put('{workspace}', [App\Http\Controllers\Api\WorkspaceController::class, 'update'])->name('update');
        Route::post('{workspace}/logo', [App\Http\Controllers\Api\WorkspaceController::class, 'uploadLogo'])->name('logo');
        Route::get('{workspace}/members', [App\Http\Controllers\Api\WorkspaceMemberController::class, 'index'])->name('members.index');
        Route::put('{workspace}/members/{member}', [App\Http\Controllers\Api\WorkspaceMemberController::class, 'update'])->name('members.update');
        Route::delete('{workspace}/members/{member}', [App\Http\Controllers\Api\WorkspaceMemberController::class, 'destroy'])->name('members.destroy');
        Route::get('{workspace}/invitations', [App\Http\Controllers\Api\WorkspaceInvitationController::class, 'index'])->name('invitations.index');
        Route::post('{workspace}/invitations', [App\Http\Controllers\Api\WorkspaceInvitationController::class, 'store'])->name('invitations.store');

        Route::prefix('{workspace}/conversations')->name('conversations.')->group(function (): void {
            Route::get('/', [App\Http\Controllers\Api\ConversationController::class, 'index'])->name('index');
            Route::post('direct', [App\Http\Controllers\Api\ConversationController::class, 'storeDirect'])->name('store.direct');
            Route::post('group', [App\Http\Controllers\Api\ConversationController::class, 'storeGroup'])->name('store.group');
            Route::post('channel', [App\Http\Controllers\Api\ConversationController::class, 'storeChannel'])->name('store.channel');
            Route::get('{conversation}', [App\Http\Controllers\Api\ConversationController::class, 'show'])->name('show');
            Route::put('{conversation}', [App\Http\Controllers\Api\ConversationController::class, 'update'])->name('update');
            Route::post('{conversation}/read', [App\Http\Controllers\Api\ConversationController::class, 'markRead'])->name('read');
            Route::get('{conversation}/members', [App\Http\Controllers\Api\ConversationMemberController::class, 'index'])->name('members.index');
            Route::post('{conversation}/members', [App\Http\Controllers\Api\ConversationMemberController::class, 'store'])->name('members.store');
            Route::delete('{conversation}/members/{conversation_member}', [App\Http\Controllers\Api\ConversationMemberController::class, 'destroy'])->name('members.destroy');

            Route::get('{conversation}/pinned', [App\Http\Controllers\Api\MessageController::class, 'pinned'])->name('pinned');
            Route::get('{conversation}/messages', [App\Http\Controllers\Api\MessageController::class, 'index'])->name('messages.index');
            Route::post('{conversation}/messages', [App\Http\Controllers\Api\MessageController::class, 'store'])->name('messages.store');
            Route::put('{conversation}/messages/{message}', [App\Http\Controllers\Api\MessageController::class, 'update'])->name('messages.update');
            Route::delete('{conversation}/messages/{message}', [App\Http\Controllers\Api\MessageController::class, 'destroy'])->name('messages.destroy');
            Route::post('{conversation}/messages/{message}/reactions', [App\Http\Controllers\Api\MessageReactionController::class, 'store'])->name('messages.reactions.store');
            Route::post('{conversation}/messages/{message}/pin', [App\Http\Controllers\Api\MessagePinController::class, 'store'])->name('messages.pin');
            Route::delete('{conversation}/messages/{message}/pin', [App\Http\Controllers\Api\MessagePinController::class, 'destroy'])->name('messages.unpin');

            Route::get('{conversation}/files', [App\Http\Controllers\Api\ConversationFileController::class, 'index'])->name('files.index');
            Route::get('{conversation}/files/{attachment}/download', [App\Http\Controllers\Api\ConversationFileController::class, 'download'])->name('files.download');
        });
    });
});
