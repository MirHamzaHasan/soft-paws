import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import java.util.Properties

plugins {
    alias(libs.plugins.googleServices)
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.kotlinAndroid)
    alias(libs.plugins.composeCompiler)
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_11)
    }
}

val barkLogBillingProperties = Properties().apply {
    rootProject.file("local.properties").takeIf { it.isFile }?.inputStream()?.use { load(it) }
}
fun barkLogBillingValue(name: String): String = (providers.gradleProperty(name).orNull
    ?: barkLogBillingProperties.getProperty(name).orEmpty()).replace("\\", "\\\\").replace("\"", "\\\"")

android {
    namespace = "com.draco.arts.apps.bark.log.dogs.journal"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.draco.apps.bark.log"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "REVENUECAT_PUBLIC_KEY", "\"${barkLogBillingValue("barklog.revenuecat.androidPublicKey")}\"")
        buildConfigField("String", "REVENUECAT_ENTITLEMENT_ID", "\"${barkLogBillingValue("barklog.revenuecat.entitlementId")}\"")
        buildConfigField("String", "REVENUECAT_OFFERING_ID", "\"${barkLogBillingValue("barklog.revenuecat.offeringId")}\"")
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
    sourceSets.getByName("androidTest").assets.srcDir("../shared/src/commonMain/sqldelight/databases")

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    implementation(libs.revenuecat.purchases)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth)
    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play)
    implementation(libs.googleid)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.play)
    implementation(project(":shared"))
    implementation(libs.media3.transformer)
    implementation(libs.media3.effect)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.core)
    implementation(libs.kotlinx.datetime)
    testImplementation(kotlin("test"))
    testImplementation(libs.ktor.client.mock)
    testImplementation(libs.okio)
    testImplementation(libs.kotlinx.coroutines.core)
    testImplementation(libs.kotlinx.serialization.json)
    testImplementation(libs.sqldelight.jdbc)
    testImplementation(libs.kotlinx.datetime)
    androidTestImplementation(libs.androidx.test.runner)
    androidTestImplementation(libs.androidx.test.junit)
    androidTestImplementation(libs.androidx.test.uiautomator)
    androidTestImplementation(libs.kotlinx.coroutines.core)
    androidTestImplementation(libs.kotlinx.serialization.json)
    androidTestImplementation(libs.kotlinx.datetime)
}
