package com.dracoarts.shared

import com.dracoarts.shared.managers.StorageBackend
import platform.Foundation.NSUserDefaults

class IosStorageBackend : StorageBackend {
    private val preferences = NSUserDefaults.standardUserDefaults
    private val prefix = "barklog_preference_v1_"

    override fun read(key: String): String? = preferences.stringForKey(prefix + key)
    override fun write(key: String, value: String) { preferences.setObject(value, forKey = prefix + key) }
    override fun remove(key: String) { preferences.removeObjectForKey(prefix + key) }
    override fun keys(): Set<String> = preferences.dictionaryRepresentation().keys
        .mapNotNull { it as? String }
        .filter { it.startsWith(prefix) }
        .map { it.removePrefix(prefix) }
        .toSet()
    override fun clear() { keys().forEach(::remove) }
}
