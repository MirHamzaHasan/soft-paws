import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidMultiplatformLibrary)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinSerialization)
    alias(libs.plugins.sqldelight)
}

kotlin {
    androidLibrary {
        namespace = "com.dracoarts.shared"
        compileSdk = 36
        minSdk = 26

        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }

        // Required for Compose Multiplatform resource accessors on Android.
        androidResources {
            enable = true
        }
    }

    listOf(iosArm64(), iosSimulatorArm64()).forEach { target ->
        target.binaries.framework {
            baseName = "Shared"
            isStatic = true
        }
    }

    sourceSets {
        commonTest.dependencies { implementation(kotlin("test")) }
        commonMain.dependencies {
            implementation(libs.llamatik)
            implementation(libs.okio)
            implementation(libs.ktor.client.core)
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.ui)
            implementation(compose.components.resources)
            implementation(libs.kotlinx.coroutines.core)
            implementation(libs.kotlinx.serialization.json)
            api(libs.sqldelight.runtime)
            implementation(libs.kotlinx.datetime)
        }
        androidMain.dependencies {
            implementation(libs.ktor.client.android)
            implementation(libs.sqldelight.android)
            implementation(libs.rive.android)
        }
        iosMain.dependencies {
            // Apply the official accessibility fix to the affected platform. The iOS
            // graph resolves these groups together; Android retains its API 36 baseline.
            implementation("org.jetbrains.compose.runtime:runtime:${libs.versions.compose.ios.runtime.get()}")
            implementation("org.jetbrains.compose.foundation:foundation:${libs.versions.compose.ios.runtime.get()}")
            implementation("org.jetbrains.compose.ui:ui:${libs.versions.compose.ios.runtime.get()}")
            implementation("org.jetbrains.compose.material3:material3:${libs.versions.compose.ios.material3.get()}")
            implementation(libs.sqldelight.native)
            implementation(libs.ktor.client.darwin)
        }
    }
}

sqldelight {
    databases {
        create("BarkLogDatabase") {
            packageName.set("com.dracoarts.shared.data.local")
            schemaOutputDirectory.set(file("src/commonMain/sqldelight/databases"))
            verifyMigrations.set(true)
        }
    }
}

compose.resources {
    packageOfResClass = "com.dracoarts.shared.generated.resources"
}

