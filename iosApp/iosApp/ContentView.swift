import Shared
import SwiftUI
import UIKit

struct ContentView: View {
    var body: some View {
        SharedView().ignoresSafeArea()
    }
}

private struct SharedView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        #if DEBUG
        let arguments = ProcessInfo.processInfo.arguments
        let review = arguments.contains("-DesignReview")
        let screenIndex = arguments.firstIndex(of: "-DesignReviewScreen")
        let screen = screenIndex.flatMap { $0 + 1 < arguments.count ? arguments[$0 + 1] : nil }
        let fixtureIndex = arguments.firstIndex(of: "-DesignReviewFixture")
        let fixture = fixtureIndex.flatMap { $0 + 1 < arguments.count ? arguments[$0 + 1] : nil }
        #else
        let review = false
        let screen: String? = nil
        let fixture: String? = nil
        #endif
        return MainViewControllerKt.MainViewController(reviewEnabled: review, reviewStart: screen, reviewFixture: fixture)
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}
