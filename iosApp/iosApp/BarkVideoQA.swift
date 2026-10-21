#if DEBUG
import Shared
import UIKit
import AVFoundation

/// Explicit Debug-only fixtures; never touches the owner's journal or photo library.
enum BarkVideoQA {
    static func preparePhotos() {
        let directory = try! FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true).appendingPathComponent("BarkLogPhotos", isDirectory: true)
        try! FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        for (index, name) in ["red", "green", "blue"].enumerated() {
            let color = [UIColor(red: 215/255, green: 48/255, blue: 48/255, alpha: 1), UIColor(red: 45/255, green: 185/255, blue: 70/255, alpha: 1), UIColor(red: 45/255, green: 80/255, blue: 215/255, alpha: 1)][index]
            let format = UIGraphicsImageRendererFormat(); format.scale = 1
            let data = UIGraphicsImageRenderer(size: CGSize(width: 600, height: 1000), format: format).jpegData(withCompressionQuality: 0.9) { ctx in
                color.setFill(); ctx.fill(CGRect(x: 0, y: 0, width: 600, height: 1000)); UIColor.white.setFill(); ctx.fill(CGRect(x: 20, y: 30, width: 80, height: 870)); UIColor.black.setFill(); ctx.cgContext.fillEllipse(in: CGRect(x: 405, y: 95, width: 150, height: 150))
            }
            try! data.write(to: directory.appendingPathComponent("video-qa-\(name).jpg"))
        }
    }
    static func run() {
        preparePhotos()
        let engine = BarkVideoEngine()
        var results: [[String: Any]] = []
        let options: [(HighlightAspect, Bool)] = [(.portrait, true), (.square, true), (.square, false)]
        let clips = ["red", "green", "blue"].enumerated().map { HighlightClip(photoId: "video-qa-\($0.element).jpg", caption: "QA moment \($0.offset + 1)") }
        func save() {
            let dir = FileManager.default.temporaryDirectory.appendingPathComponent("BarkLogFilms")
            if let data = try? JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys]) { try? data.write(to: dir.appendingPathComponent("qa-results.json")) }
        }
        func next(_ index: Int) {
            if index >= options.count {
                let dir = FileManager.default.temporaryDirectory.appendingPathComponent("BarkLogFilms")
                let before = Set((try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? [])
                engine.start(draft: HighlightDraft(dogId: "encoder-qa", clips: clips, aspect: .portrait, revision: 0, title: "QA film"), motion: true, progress: { _ in }) { filename, error in
                    let after = Set((try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? [])
                    results.append(["case": "cancel", "passed": filename == nil && error != nil && before == after, "remainingAddedFiles": Array(after.subtracting(before))]); save()
                    let missing = [HighlightClip(photoId: "missing-photo.jpg", caption: "Missing"), clips[1], clips[2]]
                    engine.start(draft: HighlightDraft(dogId: "encoder-qa", clips: missing, aspect: .square, revision: 0, title: "QA film"), motion: true, progress: { _ in }) { filename, error in
                        let after = Set((try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? [])
                        results.append(["case": "missing-input", "passed": filename == nil && error != nil && before == after, "remainingAddedFiles": Array(after.subtracting(before))]); save()
                    }
                }
                engine.cancel()
                return
            }
            let (aspect, motion) = options[index]
            var progressCount = 0
            engine.start(draft: HighlightDraft(dogId: "encoder-qa", clips: clips, aspect: aspect, revision: 0, title: "QA film"), motion: motion, progress: { _ in progressCount += 1 }) { filename, error in
                var record: [String: Any] = ["aspect": aspect.name, "motion": motion, "progressUpdates": progressCount]
                if let filename {
                    let url = FileManager.default.temporaryDirectory.appendingPathComponent("BarkLogFilms").appendingPathComponent(filename)
                    let asset = AVURLAsset(url: url), generator = AVAssetImageGenerator(asset: asset)
                    generator.requestedTimeToleranceBefore = .zero; generator.requestedTimeToleranceAfter = .zero
                    var order: [Int] = []
                    var captions = true
                    for i in 0..<3 {
                        if let image = try? generator.copyCGImage(at: CMTime(seconds: Double(i) * 2.8 + 1, preferredTimescale: 600), actualTime: nil) {
                            var bytes = [UInt8](repeating: 0, count: image.width * image.height * 4)
                            let context = CGContext(data: &bytes, width: image.width, height: image.height, bitsPerComponent: 8, bytesPerRow: image.width * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
                            context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
                            let center = (image.height / 2 * image.width + image.width / 2) * 4
                            let rgb = Array(bytes[center..<center+3]); order.append(rgb.firstIndex(of: rgb.max()!)!)
                            // CG image pixel rows preserve the encoded top-to-bottom image order.
                            let edge = ((image.height - 10) * image.width + 10) * 4
                            captions = captions && bytes[edge] > 235 && bytes[edge+1] > 235 && bytes[edge+2] > 235
                        }
                    }
                    record["filename"] = filename; record["duration"] = CMTimeGetSeconds(asset.duration); record["photoColorOrder"] = order; record["captionBackground"] = captions
                    record["width"] = asset.tracks(withMediaType: .video).first?.naturalSize.width; record["height"] = asset.tracks(withMediaType: .video).first?.naturalSize.height
                    func pixels(_ seconds: Double) -> [UInt8]? {
                        guard let image = try? generator.copyCGImage(at: CMTime(seconds: seconds, preferredTimescale: 600), actualTime: nil) else { return nil }
                        var bytes = [UInt8](repeating: 0, count: image.width * image.height * 4)
                        guard let context = CGContext(data: &bytes, width: image.width, height: image.height, bitsPerComponent: 8, bytesPerRow: image.width * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return nil }
                        context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height)); return bytes
                    }
                    let early = pixels(0.2), late = pixels(2.3)
                    let changed = early != nil && late != nil ? zip(early!, late!).filter { abs(Int($0.0) - Int($0.1)) > 8 }.count : -1
                    record["changedFrameComponents"] = changed
                    record["passed"] = filename.hasPrefix("SoftPaws-film-") && order == [0,1,2] && captions && abs(CMTimeGetSeconds(asset.duration) - 8.4) < 0.15 && (motion ? changed > 100 : changed >= 0 && changed < 30)
                } else { record["error"] = error ?? "Unknown export failure"; record["passed"] = false }
                results.append(record); save(); next(index + 1)
            }
        }
        next(0)
    }
}
#endif
