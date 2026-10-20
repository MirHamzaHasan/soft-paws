import SwiftUI

@main
struct SoftPawsApp: App {
    init() { BarkFirebaseAuth.configure() }
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
