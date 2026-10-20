import Foundation
import RevenueCat
import Shared
import UIKit

/// RevenueCat owns receipts and cached store state. Dog/care/location data never enters this adapter.
final class BarkPurchases: NSObject, NativePurchasesEngine, PurchasesDelegate {
    private var listener: ((PremiumCustomer) -> Void)?
    private var customerInfo: CustomerInfo?
    private var packages: [String: Package] = [:]
    private var closed = false
    private var identityVersion = 0
    private func matches(_ user: String, _ revision: Int) -> Bool { !closed && configured && Purchases.isConfigured && Purchases.shared.appUserID == user && identityVersion == revision }
    private func setting(_ key: String) -> String {
        let value = (Bundle.main.object(forInfoDictionaryKey: key) as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        return value.hasPrefix("$(") ? "" : value
    }
    private var entitlementID: String { setting("SoftPawsRevenueCatEntitlementID") }
    private var configured: Bool { !setting("SoftPawsRevenueCatPublicKey").isEmpty && !entitlementID.isEmpty }
    private func main(_ action: @escaping () -> Void) { if Thread.isMainThread { action() } else { DispatchQueue.main.async(execute: action) } }
    private func result(_ error: String? = nil, cancelled: Bool = false) -> NativePurchaseResult { NativePurchaseResult(error: error, cancelled: cancelled) }
    func observe(listener_ listener: @escaping (PremiumCustomer) -> Void) {
        main { [self] in
            self.listener = listener; closed = false
            guard configured else { publish(); return }
            if !Purchases.isConfigured { Purchases.configure(withAPIKey: setting("SoftPawsRevenueCatPublicKey")) }
            Purchases.shared.delegate = self
            publish(); refresh { _ in }; loadOffers()
        }
    }
    func purchases(_ purchases: Purchases, receivedUpdated customerInfo: CustomerInfo) { main { [self] in self.customerInfo = customerInfo; publish() } }
    private func publish(error: String? = nil) {
        guard !closed else { return }
        let ready = configured && Purchases.isConfigured
        let entitlement = ready ? customerInfo?.entitlements[entitlementID] : nil
        let offers = [PremiumPlan.weekly, PremiumPlan.monthly, PremiumPlan.yearly].compactMap { plan -> PremiumOffer? in
            guard let package = packages[plan.key] else { return nil }
            return PremiumOffer(plan: plan, price: package.storeProduct.localizedPriceString, packageId: package.identifier)
        }
        listener?(PremiumCustomer(configured: ready, entitled: entitlement?.isActive == true,
            customerId: ready ? Purchases.shared.appUserID : nil, anonymous: ready && Purchases.shared.isAnonymous,
            expiresAtMillis: entitlement?.expirationDate.map { KotlinLong(value: Int64($0.timeIntervalSince1970 * 1000)) },
            managementUrl: customerInfo?.managementURL?.absoluteString, offers: offers, error: error))
    }
    private func loadOffers() {
        Purchases.shared.getOfferings { [weak self] offerings, error in self?.main { [weak self] in
            guard let self, !closed else { return }
            guard let offerings, error == nil else { publish(error: "Couldn't load store prices. Check your connection and try again."); return }
            let id = setting("SoftPawsRevenueCatOfferingID")
            let offering = id.isEmpty ? offerings.current : offerings.offering(identifier: id)
            packages = [:]
            for package in offering?.availablePackages ?? [] {
                let plan: PremiumPlan?
                switch package.packageType { case .weekly: plan = .weekly; case .monthly: plan = .monthly; case .annual: plan = .yearly; default: plan = nil }
                if let plan { packages[plan.key] = package }
            }
            publish(error: packages.isEmpty ? "No Premium plans are available from the store yet." : nil)
        } }
    }
    private func refresh(_ completion: @escaping (NativePurchaseResult) -> Void) {
        let user = Purchases.shared.appUserID, revision = identityVersion
        Purchases.shared.getCustomerInfo { [weak self] info, error in self?.main { [weak self] in
            guard let self else { return }
            guard matches(user, revision) else { completion(result("The store account changed. Try again.")); return }
            if let info, error == nil { customerInfo = info; publish(); completion(result()) }
            else { publish(error: "Couldn't refresh Premium. Check your connection."); completion(result("Couldn't finish the store request. Try again.")) }
        } }
    }
    func execute(action: String, plan: String, completion: @escaping (NativePurchaseResult) -> Void) {
        main { [self] in
            guard configured && Purchases.isConfigured else { completion(result("Purchases will be available after store setup.")); return }
            let user = Purchases.shared.appUserID, revision = identityVersion
            switch action {
            case "refresh": loadOffers(); refresh(completion)
            case "restore":
                Purchases.shared.restorePurchases { [weak self] info, error in self?.main { [weak self] in
                    guard let self else { return }
                    guard matches(user, revision) else { completion(result("The store account changed. Try again.")); return }
                    if let info, error == nil {
                        customerInfo = info; publish()
                        completion(result(info.entitlements[entitlementID]?.isActive == true ? nil : "No active Premium subscription was found for this store account."))
                    } else { completion(result("Couldn't restore purchases. Check your connection and try again.")) }
                } }
            case "purchase":
                guard let package = packages[plan] else { completion(result("This plan isn't available from the store yet.")); return }
                Purchases.shared.purchase(package: package) { [weak self] _, info, error, cancelled in self?.main { [weak self] in
                    guard let self else { return }
                    guard matches(user, revision) else { completion(result("The store account changed. Restore purchases for your current account.")); return }
                    if let info { customerInfo = info; publish() }
                    if cancelled { completion(result(cancelled: true)) }
                    else if error != nil { completion(result("The purchase wasn't completed. Try again in the store.")) }
                    else { completion(result(info?.entitlements[entitlementID]?.isActive == true ? nil : "The store hasn't activated Premium yet. Restore purchases after it finishes.")) }
                } }
            case "manage":
                let url = customerInfo?.managementURL ?? URL(string: "https://apps.apple.com/account/subscriptions")!
                guard url.scheme == "https" else { completion(result("Couldn't open subscription settings.")); return }
                UIApplication.shared.open(url, options: [:]) { opened in completion(self.result(opened ? nil : "Couldn't open subscription settings.")) }
            default: completion(result("Unknown store request."))
            }
        }
    }
    func identify(userId: String?, completion: @escaping (NativePurchaseResult) -> Void) {
        main { [self] in
            guard configured && Purchases.isConfigured else { completion(result()); return }
            if userId == Purchases.shared.appUserID || (userId == nil && Purchases.shared.isAnonymous) { completion(result()); return }
            identityVersion += 1
            let revision = identityVersion
            customerInfo = nil; publish()
            if let userId {
                Purchases.shared.logIn(userId) { [weak self] info, _, error in self?.main { [weak self] in
                    guard let self else { return }
                    guard matches(userId, revision) else { completion(result("The store account changed. Try again.")); return }
                    if let info, error == nil { customerInfo = info; publish(); completion(result()) }
                    else { completion(result("Couldn't refresh Premium for this account.")) }
                } }
            } else {
                Purchases.shared.logOut { [weak self] info, error in self?.main { [weak self] in
                    guard let self else { return }
                    guard !closed && revision == identityVersion && Purchases.shared.isAnonymous else { completion(result("The store account changed. Try again.")); return }
                    if let info, error == nil { customerInfo = info; publish(); completion(result()) }
                    else { completion(result("Couldn't refresh Premium for this account.")) }
                } }
            }
        }
    }
    func close() { main { [self] in closed = true; listener = nil; if configured && Purchases.isConfigured && Purchases.shared.delegate === self { Purchases.shared.delegate = nil } } }
}
