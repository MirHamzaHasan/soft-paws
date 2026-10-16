package com.draco.arts.apps.bark.log.dogs.journal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.saveable.rememberSaveable
import com.dracoarts.shared.App
import com.dracoarts.shared.AppState

class MainActivity : ComponentActivity() {
    private lateinit var platform: AndroidPlatform
    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (::platform.isInitialized) platform.device.handleIntent(intent)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val fixture = if (BuildConfig.DEBUG && intent.getBooleanExtra("designReview", false)) com.dracoarts.shared.presentation.review.BoardReviewDataSet.entries.firstOrNull { it.key == intent.getStringExtra("designReviewFixture") } else null
        platform = AndroidPlatform(this, fixture)
        setContent {
            val state = rememberSaveable(saver = AppState.Saver) { AppState() }
            BackHandler(enabled = state.canGoBack) { state.back() }
            App(platform, state, reviewEnabled = BuildConfig.DEBUG && intent.getBooleanExtra("designReview", false),
                reviewStart = if (BuildConfig.DEBUG) intent.getStringExtra("designReviewScreen") else null, boardFixture = fixture)
        }
    }

}
