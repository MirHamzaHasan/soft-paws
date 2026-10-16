package com.dracoarts.shared.services

import com.dracoarts.shared.data.local.SqlDelightJournalRepository

class LocalDataModule(private val journal: SqlDelightJournalRepository) : AppModule {
    override val id = "local-data"
    override val priority = -100
    override val required = true
    override suspend fun initialize() = journal.initialize()
    override suspend fun close() = journal.close()
}
