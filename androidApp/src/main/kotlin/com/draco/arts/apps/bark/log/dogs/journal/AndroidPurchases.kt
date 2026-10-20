package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.activity.ComponentActivity
import com.dracoarts.shared.domain.model.PremiumCustomer
import com.dracoarts.shared.domain.model.PremiumOffer
import com.dracoarts.shared.domain.model.PremiumPlan
import com.dracoarts.shared.services.NativePurchaseResult
import com.dracoarts.shared.services.NativePurchasesEngine
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.Offerings
import com.revenuecat.purchases.PackageType
import com.revenuecat.purchases.PurchaseParams
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesConfiguration
import com.revenuecat.purchases.PurchasesError
import com.revenuecat.purchases.interfaces.*
import com.revenuecat.purchases.models.StoreTransaction

/** Nothing configures or contacts RevenueCat until both owner-supplied values exist. */
class AndroidPurchases(private val activity: ComponentActivity) : NativePurchasesEngine {
    private val main = Handler(Looper.getMainLooper())
    private var listener: ((PremiumCustomer) -> Unit)? = null
    private var closed = false
    private var customer = PremiumCustomer()
    private var info: CustomerInfo? = null
    private var identityVersion = 0L
    private fun matches(user: String, revision: Long) = !closed && configured && Purchases.isConfigured && sdk.appUserID == user && identityVersion == revision
    private var packages = emptyMap<String, com.revenuecat.purchases.Package>()
    private val configured get() = BuildConfig.REVENUECAT_PUBLIC_KEY.isNotBlank() && BuildConfig.REVENUECAT_ENTITLEMENT_ID.isNotBlank()
    private val sdk get() = Purchases.sharedInstance
    private val updates = object : UpdatedCustomerInfoListener {
        override fun onReceived(customerInfo: CustomerInfo) { publish(customerInfo) }
    }
    private fun onMain(action: () -> Unit) { if (Looper.myLooper() == Looper.getMainLooper()) action() else main.post(action) }
    override fun observe(listener: (PremiumCustomer) -> Unit) = onMain {
        this.listener = listener; closed = false
        if (!configured) { listener(PremiumCustomer()); return@onMain }
        try {
            if (!Purchases.isConfigured) Purchases.configure(PurchasesConfiguration.Builder(activity.applicationContext, BuildConfig.REVENUECAT_PUBLIC_KEY).build())
            sdk.updatedCustomerInfoListener = updates
            customer = PremiumCustomer(configured = true)
            listener(customer)
            sdk.getCustomerInfo(customerCallback {})
            loadOffers()
        } catch (_: Exception) { listener(PremiumCustomer(error = "Premium is unavailable in this build. Your journal still works.")) }
    }
    private fun publish(next: CustomerInfo? = info, error: String? = null) = onMain {
        if (closed || !configured || !Purchases.isConfigured) return@onMain
        info = next
        val entitlement = next?.entitlements?.get(BuildConfig.REVENUECAT_ENTITLEMENT_ID)
        customer = customer.copy(configured = true, entitled = entitlement?.isActive == true,
            customerId = sdk.appUserID, anonymous = sdk.isAnonymous,
            expiresAtMillis = entitlement?.expirationDate?.time, managementUrl = next?.managementURL?.toString(), error = error)
        listener?.invoke(customer)
    }
    private fun loadOffers() {
        sdk.getOfferings(object : ReceiveOfferingsCallback {
            override fun onReceived(offerings: Offerings) = onMain {
                val offering = if (BuildConfig.REVENUECAT_OFFERING_ID.isBlank()) offerings.current else offerings[BuildConfig.REVENUECAT_OFFERING_ID]
                packages = offering?.availablePackages.orEmpty().mapNotNull { pkg ->
                    val plan = when (pkg.packageType) { PackageType.WEEKLY -> PremiumPlan.Weekly; PackageType.MONTHLY -> PremiumPlan.Monthly; PackageType.ANNUAL -> PremiumPlan.Yearly; else -> null }
                    plan?.let { it.key to pkg }
                }.toMap()
                customer = customer.copy(offers = PremiumPlan.entries.mapNotNull { plan -> packages[plan.key]?.let { PremiumOffer(plan, it.product.price.formatted, it.identifier) } })
                publish(error = if (packages.isEmpty()) "No Premium plans are available from the store yet." else null)
            }
            override fun onError(error: PurchasesError) { publish(error = "Couldn't load store prices. Check your connection and try again.") }
        })
    }
    private fun customerCallback(done: (NativePurchaseResult) -> Unit): ReceiveCustomerInfoCallback {
        val user = sdk.appUserID; val revision = identityVersion
        return object : ReceiveCustomerInfoCallback {
            override fun onReceived(customerInfo: CustomerInfo) = onMain {
                if (!matches(user, revision)) { done(NativePurchaseResult("The store account changed. Try again.")); return@onMain }
                publish(customerInfo); done(NativePurchaseResult())
            }
            override fun onError(error: PurchasesError) = onMain {
                if (matches(user, revision)) publish(error = "Couldn't refresh Premium. Check your connection.")
                done(NativePurchaseResult("Couldn't finish the store request. Try again."))
            }
        }
    }
    override fun execute(action: String, plan: String, completion: (NativePurchaseResult) -> Unit) = onMain {
        if (!configured || !Purchases.isConfigured) { completion(NativePurchaseResult("Purchases will be available after store setup.")); return@onMain }
        try { when (action) {
            "refresh" -> { loadOffers(); sdk.getCustomerInfo(customerCallback(completion)) }
            "restore" -> sdk.restorePurchases(customerCallback { result ->
                completion(if (result.error == null && info?.entitlements?.get(BuildConfig.REVENUECAT_ENTITLEMENT_ID)?.isActive != true) NativePurchaseResult("No active Premium subscription was found for this store account.") else result)
            })
            "purchase" -> {
                val pkg = packages[plan]
                if (pkg == null) { completion(NativePurchaseResult("This plan isn't available from the store yet.")); return@onMain }
                val user = sdk.appUserID; val revision = identityVersion
                sdk.purchase(PurchaseParams.Builder(activity, pkg).build(), object : PurchaseCallback {
                    override fun onCompleted(storeTransaction: StoreTransaction, customerInfo: CustomerInfo) = onMain {
                        if (!matches(user, revision)) { completion(NativePurchaseResult("The store account changed. Restore purchases for your current account.")); return@onMain }
                        publish(customerInfo)
                        completion(if (customerInfo.entitlements[BuildConfig.REVENUECAT_ENTITLEMENT_ID]?.isActive == true) NativePurchaseResult() else NativePurchaseResult("The store hasn't activated Premium yet. Restore purchases after it finishes."))
                    }
                    override fun onError(error: PurchasesError, userCancelled: Boolean) { completion(NativePurchaseResult(if(userCancelled) null else "The purchase wasn't completed. Try again in the store.", userCancelled)) }
                })
            }
            "manage" -> {
                val link = customer.managementUrl?.takeIf { it.startsWith("https://") } ?: "https://play.google.com/store/account/subscriptions"
                activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(link))); completion(NativePurchaseResult())
            }
            else -> completion(NativePurchaseResult("Unknown store request."))
        } } catch (_: Exception) { completion(NativePurchaseResult("Couldn't open the store. Try again.")) }
    }
    override fun identify(userId: String?, completion: (NativePurchaseResult) -> Unit) = onMain {
        if (!configured || !Purchases.isConfigured) { completion(NativePurchaseResult()); return@onMain }
        if (userId == sdk.appUserID || (userId == null && sdk.isAnonymous)) { completion(NativePurchaseResult()); return@onMain }
        val revision = ++identityVersion
        info = null; customer = customer.copy(entitled = false, customerId = null, anonymous = false, expiresAtMillis = null, managementUrl = null); listener?.invoke(customer)
        if (userId == null) sdk.logOut(object : ReceiveCustomerInfoCallback {
            override fun onReceived(customerInfo: CustomerInfo) = onMain {
                if (closed || revision != identityVersion || !sdk.isAnonymous) { completion(NativePurchaseResult("The store account changed. Try again.")); return@onMain }
                publish(customerInfo); completion(NativePurchaseResult())
            }
            override fun onError(error: PurchasesError) { completion(NativePurchaseResult("Couldn't refresh Premium for this account.")) }
        })
        else sdk.logIn(userId, object : LogInCallback {
            override fun onReceived(customerInfo: CustomerInfo, created: Boolean) = onMain {
                if (!matches(userId, revision)) { completion(NativePurchaseResult("The store account changed. Try again.")); return@onMain }
                publish(customerInfo); completion(NativePurchaseResult())
            }
            override fun onError(error: PurchasesError) { completion(NativePurchaseResult("Couldn't refresh Premium for this account.")) }
        })
    }

    override fun close() = onMain { closed = true; listener = null; if (configured && Purchases.isConfigured && sdk.updatedCustomerInfoListener === updates) sdk.updatedCustomerInfoListener = null }
}
