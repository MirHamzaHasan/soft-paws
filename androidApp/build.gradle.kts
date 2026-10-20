import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import java.util.Properties
import groovy.json.JsonSlurper

plugins {
    alias(libs.plugins.googleServices) apply false
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.kotlinAndroid)
    alias(libs.plugins.composeCompiler)
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_11)
    }
}

// A copied BarkLog registration must never initialize Soft Paws services.
val softPawsApplicationId = "com.draco.apps.soft.paws"
val softPawsFirebaseConfigured = file("google-services.json").takeIf { it.isFile }?.let { config ->
    val data = JsonSlurper().parse(config) as Map<*, *>
    (data["client"] as? List<*>)?.count { client ->
        val info = (client as? Map<*, *>)?.get("client_info") as? Map<*, *>
        (info?.get("android_client_info") as? Map<*, *>)?.get("package_name") == softPawsApplicationId
    } == 1
} ?: false
if (softPawsFirebaseConfigured) apply(plugin = "com.google.gms.google-services")

val softPawsBillingProperties = Properties().apply {
    rootProject.file("local.properties").takeIf { it.isFile }?.inputStream()?.use { load(it) }
}
fun softPawsBillingValue(name: String): String = (providers.gradleProperty(name).orNull
    ?: softPawsBillingProperties.getProperty(name).orEmpty()).replace("\\", "\\\\").replace("\"", "\\\"")

android {
    namespace = "com.draco.arts.apps.bark.log.dogs.journal"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.draco.apps.soft.paws"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("boolean", "FIREBASE_CONFIGURED", softPawsFirebaseConfigured.toString())
        buildConfigField("String", "REVENUECAT_PUBLIC_KEY", "\"${softPawsBillingValue("softpaws.revenuecat.androidPublicKey")}\"")
        buildConfigField("String", "REVENUECAT_ENTITLEMENT_ID", "\"${softPawsBillingValue("softpaws.revenuecat.entitlementId")}\"")
        buildConfigField("String", "REVENUECAT_OFFERING_ID", "\"${softPawsBillingValue("softpaws.revenuecat.offeringId")}\"")
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
