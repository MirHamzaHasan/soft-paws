import Shared
import SwiftUI
import UIKit

struct ContentView: View {
    var body: some View {
        SharedView().ignoresSafeArea()
            .onOpenURL { BarkFirebaseAuth.shared.handle($0) }
            .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
                if let url = activity.webpageURL { BarkFirebaseAuth.shared.handle(url) }
            }
    }
}

private struct SharedView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        #if DEBUG
        let arguments = ProcessInfo.processInfo.arguments
        let review = arguments.contains("-DesignReview")
        let liveAiReview = review && arguments.contains("-LiveAIReview")
        let screenIndex = arguments.firstIndex(of: "-DesignReviewScreen")
        let screen = screenIndex.flatMap { $0 + 1 < arguments.count ? arguments[$0 + 1] : nil }
        let fixtureIndex = arguments.firstIndex(of: "-DesignReviewFixture")
        let fixture = fixtureIndex.flatMap { $0 + 1 < arguments.count ? arguments[$0 + 1] : nil }
        if review && ["park-video-v1", "soft-paws-video-v1"].contains(fixture ?? "") { BarkVideoQA.preparePhotos() }
        if review && arguments.contains("-VideoEncoderQA") { DispatchQueue.main.asyncAfter(deadline: .now() + 1) { BarkVideoQA.run() } }
        #else
        let review = false
        let liveAiReview = false
        let screen: String? = nil
        let fixture: String? = nil
        #endif
        return MainViewControllerKt.MainViewController(reviewEnabled: review, reviewStart: screen, reviewFixture: fixture, mascotFactory: BarkMascotFactory(), videoEngine: BarkVideoEngine(), authEngine: BarkFirebaseAuth.shared, purchasesEngine: BarkPurchases(), liveAiReview: liveAiReview)
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}
