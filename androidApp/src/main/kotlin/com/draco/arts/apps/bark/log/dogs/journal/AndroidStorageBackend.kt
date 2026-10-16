package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Context
import com.dracoarts.shared.managers.StorageBackend

class AndroidStorageBackend(context: Context) : StorageBackend {
    private val preferences = context.getSharedPreferences("barklog_preferences_v1", Context.MODE_PRIVATE)

    override fun read(key: String): String? = preferences.getString(key, null)
    override fun write(key: String, value: String) {
        check(preferences.edit().putString(key, value).commit()) { "Could not save preference." }
    }
    override fun remove(key: String) {
        check(preferences.edit().remove(key).commit()) { "Could not remove preference." }
    }
    override fun keys(): Set<String> = preferences.all.keys
    override fun clear() {
        check(preferences.edit().clear().commit()) { "Could not clear preferences." }
    }
}
