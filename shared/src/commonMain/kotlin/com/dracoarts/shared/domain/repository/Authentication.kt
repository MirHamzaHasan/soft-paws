package com.dracoarts.shared.domain.repository

import kotlinx.coroutines.flow.StateFlow

/** Identity comes only from the native Firebase SDK, never from journal documents. */
data class AuthUser(val uid: String, val email: String, val provider: String)
data class AuthSnapshot(val user: AuthUser? = null, val emailLinkPending: Boolean = false)

interface Authentication {
    val snapshot: StateFlow<AuthSnapshot>
    suspend fun perform(action: String, provider: String = "", email: String = "", password: String = "")
}

class AuthenticationException(message: String) : Exception(message)
