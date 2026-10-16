package com.dracoarts.shared.services

import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

/** Each instance owns resources acquired during partial or complete initialization. */
interface AppModule {
    val id: String
    val priority: Int
    val dependencies: Set<String> get() = emptySet()
    val required: Boolean get() = false
    suspend fun initialize()
    suspend fun close() = Unit
}

/** Serializes startup and live custom-plugin changes, with dependency ordering and rollback. */
class ModuleRegistry(modules: List<AppModule>, enabledIds: Set<String> = modules.map { it.id }.toSet()) {
    private val byId = modules.associateBy { it.id }
    private val ordered: List<AppModule>
    private val enabled = enabledIds.toMutableSet()
    private val mutex = Mutex()
    private var initialized = false
    private var active = emptyList<AppModule>()
    private val _activeIds = MutableStateFlow<Set<String>>(emptySet())
    val activeIds = _activeIds.asStateFlow()

    init {
        require(modules.all { it.id.isNotBlank() }) { "Module IDs must not be blank." }
        require(byId.size == modules.size) { "Duplicate module ID." }
        require(enabledIds.all { it in byId }) { "Unknown enabled module ID." }
        for (module in modules) {
            require(module.dependencies.all { it in byId && it != module.id }) { "Invalid dependencies for ${module.id}." }
            if (module.required) enabled += module.id
        }
        val remaining = modules.sortedWith(compareBy<AppModule> { it.priority }.thenBy { it.id }).toMutableList()
        val result = mutableListOf<AppModule>()
        val visited = mutableSetOf<String>()
        while (remaining.isNotEmpty()) {
            val next = remaining.firstOrNull { visited.containsAll(it.dependencies) }
            require(next != null) { "Module dependency cycle." }
            result += next
            visited += next.id
            remaining.remove(next)
        }
        ordered = result
        require(ordered.filter { it.id in enabled }.all { enabled.containsAll(it.dependencies) }) {
            "An enabled module requires a disabled dependency. Enable its dependencies first."
        }
    }

    suspend fun initialize(): Unit = mutex.withLock {
        if (initialized) return@withLock
        active = start(ordered.filter { it.id in enabled })
        initialized = true
        publish()
    }

    /** Enabling a registered custom plugin also starts its dependency closure. */
    suspend fun enable(id: String): Unit = mutex.withLock {
        check(initialized) { "Initialize the registry before changing plugins." }
        require(id in byId) { "Unknown module: $id" }
        val wanted = mutableSetOf<String>()
        fun include(moduleId: String) {
            if (wanted.add(moduleId)) byId.getValue(moduleId).dependencies.forEach(::include)
        }
        include(id)
        val additions = start(ordered.filter { it.id in wanted && it.id !in _activeIds.value })
        active = active + additions
        enabled += wanted
        publish()
    }

    /** Disable dependents first; required modules cannot be disabled. */
    suspend fun disable(id: String): Unit = mutex.withLock {
        check(initialized) { "Initialize the registry before changing plugins." }
        val module = byId[id] ?: error("Unknown module: $id")
        require(!module.required) { "Required module $id cannot be disabled." }
        require(active.none { id in it.dependencies }) { "Disable modules that depend on $id first." }
        if (module in active) {
            withContext(NonCancellable) { module.close() }
            active = active.filterNot { it.id == id }
        }
        enabled -= id
        publish()
    }

    suspend fun close(): Unit = mutex.withLock {
        val closing = active.asReversed()
        active = emptyList()
        initialized = false
        publish()
        val failure = withContext(NonCancellable) {
            var failure: Throwable? = null
            for (module in closing) {
                try { module.close() } catch (cause: Throwable) {
                    if (failure == null) failure = cause else if (failure !== cause) failure.addSuppressed(cause)
                }
            }
            failure
        }
        failure?.let { throw it }
    }

    private suspend fun start(modules: List<AppModule>): List<AppModule> {
        val started = mutableListOf<AppModule>()
        var starting: AppModule? = null
        try {
            for (module in modules) {
                starting = module
                module.initialize()
                started += module
                starting = null
            }
            return started.toList()
        } catch (cause: Throwable) {
            withContext(NonCancellable) {
                val rollback = listOfNotNull(starting) + started.asReversed()
                for (module in rollback) {
                    try { module.close() } catch (cleanup: Throwable) {
                        if (cleanup !== cause) cause.addSuppressed(cleanup)
                    }
                }
            }
            throw cause
        }
    }

    private fun publish() { _activeIds.value = active.map { it.id }.toSet() }
}
