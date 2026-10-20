import SwiftUI

@main
struct BarkLogApp: App {
    init() { BarkFirebaseAuth.configure() }
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
