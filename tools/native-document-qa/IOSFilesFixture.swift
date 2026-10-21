import UIKit

/// External, simulator-only file input. Never links or writes to Soft Paws.
@main
final class FilesFixture: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_ application: UIApplication, didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let host = UIViewController()
        host.view.backgroundColor = .systemBackground
        let label = UILabel()
        label.numberOfLines = 0
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        do {
            let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            let bounds = CGRect(x: 0, y: 0, width: 320, height: 400)
            let text = "Soft Paws QA\nOwned local file input.\nNo medical instructions."
            let attributes: [NSAttributedString.Key: Any] = [.font: UIFont.systemFont(ofSize: 16), .foregroundColor: UIColor.black]
            let pdf = directory.appendingPathComponent("soft-paws-vaccination-qa.pdf")
            if !FileManager.default.fileExists(atPath: pdf.path) {
                try UIGraphicsPDFRenderer(bounds: bounds).writePDF(to: pdf) { context in
                    context.beginPage()
                    (text as NSString).draw(in: bounds.insetBy(dx: 20, dy: 30), withAttributes: attributes)
                }
            }
            let jpeg = directory.appendingPathComponent("soft-paws-vaccination-image-qa.jpg")
            if !FileManager.default.fileExists(atPath: jpeg.path) {
                let image = UIGraphicsImageRenderer(size: bounds.size).image { context in
                    UIColor.white.setFill(); context.fill(bounds)
                    (text as NSString).draw(in: bounds.insetBy(dx: 20, dy: 30), withAttributes: attributes)
                }
                guard let data = image.jpegData(compressionQuality: 0.9) else { throw NSError(domain: "OwnedFiles", code: 1) }
                try data.write(to: jpeg, options: .atomic)
            }
            label.text = "Sample files ready"
        } catch { label.text = "Could not prepare sample files" }
        host.view.addSubview(label)
        NSLayoutConstraint.activate([label.centerYAnchor.constraint(equalTo: host.view.centerYAnchor),
            label.leadingAnchor.constraint(equalTo: host.view.leadingAnchor, constant: 24), label.trailingAnchor.constraint(equalTo: host.view.trailingAnchor, constant: -24)])
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = host
        self.window = window
        window.makeKeyAndVisible()
        return true
    }
}
