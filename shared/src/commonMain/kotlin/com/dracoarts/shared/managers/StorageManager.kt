package com.dracoarts.shared.managers

import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json

/** Preferences only. Care records and credentials must never use this namespace. */
interface StorageBackend {
    fun read(key: String): String?
    fun write(key: String, value: String)
    fun remove(key: String)
    fun keys(): Set<String>
    fun clear()
}

class StorageManager(private val backend: StorageBackend) {
    private val json = Json { ignoreUnknownKeys = true }

    fun setString(key: String, value: String) = backend.write(validKey(key), value)
    fun getString(key: String): String? = backend.read(validKey(key))

    fun setNumber(key: String, value: Double) {
        require(value.isFinite()) { "Numbers must be finite." }
        setString(key, value.toString())
    }
    fun getNumber(key: String): Double? = getString(key)?.toDoubleOrNull()

    fun setBoolean(key: String, value: Boolean) = setString(key, value.toString())
    fun getBoolean(key: String): Boolean? = when (getString(key)) {
        "true" -> true
        "false" -> false
        else -> null
    }

    fun <T> setObject(key: String, value: T, serializer: KSerializer<T>) =
        setString(key, json.encodeToString(serializer, value))

    fun <T> getObject(key: String, serializer: KSerializer<T>): T? =
        getString(key)?.let { runCatching { json.decodeFromString(serializer, it) }.getOrNull() }

    fun delete(key: String) = backend.remove(validKey(key))
    fun clearAll() = backend.clear()
    fun getAllKeys(): Set<String> = backend.keys()

    private fun validKey(key: String): String {
        require(key.isNotBlank() && key.length <= 256) { "Invalid storage key." }
        return key
    }
}
