import Shared
import AVFoundation
import UIKit
import ImageIO

/// Local, bounded photo-to-H.264 renderer. One image and one pixel buffer at a time.
final class BarkVideoEngine: NSObject, IosVideoEngine {
    private final class RenderJob {
        private let lock = NSLock()
        private var stopped = false
        var cancelled: Bool { lock.lock(); defer { lock.unlock() }; return stopped }
        func cancel() { lock.lock(); stopped = true; lock.unlock() }
    }
    private let queue = DispatchQueue(label: "com.dracoarts.barklog.video", qos: .userInitiated)
    private let lock = NSLock()
    private var current: RenderJob?
    private weak var shareSheet: UIActivityViewController?
    private let files = FileManager.default
    private var exports: URL { files.temporaryDirectory.appendingPathComponent("BarkLogFilms", isDirectory: true) }
    private func removePartial(_ output: URL) {
        // AVAssetWriter may create a fast-start .sb-* sidecar beside its MP4.
        let owned = output.lastPathComponent
        for file in (try? files.contentsOfDirectory(at: output.deletingLastPathComponent(), includingPropertiesForKeys: nil)) ?? [] {
            if file.lastPathComponent == owned || file.lastPathComponent.hasPrefix(owned + ".sb-") { try? files.removeItem(at: file) }
        }
    }

    func start(draft: HighlightDraft, motion: Bool, progress: @escaping (KotlinFloat) -> Void, finished: @escaping (String?, String?) -> Void) {
        let job = RenderJob()
        lock.lock(); current?.cancel(); current = job; lock.unlock()
        queue.async { [self] in
            let output = exports.appendingPathComponent("SoftPaws-film-\(UUID().uuidString).mp4")
            var succeeded = false
            defer {
                if !succeeded { removePartial(output) }
                lock.lock(); if current === job { current = nil }; lock.unlock()
            }
            do {
                try files.createDirectory(at: exports, withIntermediateDirectories: true)
                for file in (try? files.contentsOfDirectory(at: exports, includingPropertiesForKeys: [.contentModificationDateKey])) ?? [] {
                    if let date = try? file.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate, date.timeIntervalSinceNow < -86400 { try? files.removeItem(at: file) }
                }
                let free = try files.attributesOfFileSystem(forPath: exports.path)[.systemFreeSize] as? NSNumber
                guard (free?.int64Value ?? 0) > 64_000_000 else { throw failure("Free some space on this device, then try again.") }
                let width = Int(draft.aspect.width), height = Int(draft.aspect.height)
                let clips = draft.clips
                guard (3...12).contains(clips.count) else { throw failure("Choose 3–12 photos for your film.") }
                let source = try files.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: false).appendingPathComponent("BarkLogPhotos", isDirectory: true)
                let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
                writer.shouldOptimizeForNetworkUse = true
                let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
                    AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: width, AVVideoHeightKey: height,
                    AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 3_000_000, AVVideoExpectedSourceFrameRateKey: 30, AVVideoMaxKeyFrameIntervalKey: 30],
                    AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2, AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2, AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2]
                ])
                input.expectsMediaDataInRealTime = false
                let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
                    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
                    kCVPixelBufferWidthKey as String: width, kCVPixelBufferHeightKey as String: height,
                    kCVPixelBufferCGImageCompatibilityKey as String: true, kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
                ])
                guard writer.canAdd(input) else { throw failure("Video encoding isn't available on this device.") }
                writer.add(input)
                guard writer.startWriting() else { throw writer.error ?? failure("Couldn't start this film.") }
                writer.startSession(atSourceTime: .zero)
                do {
                    let perClip = 84, count = clips.count * perClip
                    var image: CGImage?, imageIndex = -1
                    let started = Date()
                    for frame in 0..<count {
                        while !input.isReadyForMoreMediaData {
                            if job.cancelled { throw failure("Export cancelled. Your draft stays saved.") }
                            if Date().timeIntervalSince(started) > 180 || writer.status == .failed { throw writer.error ?? failure("The encoder stopped. Try exporting again.") }
                            Thread.sleep(forTimeInterval: 0.002)
                        }
                        if job.cancelled { throw failure("Export cancelled. Your draft stays saved.") }
                        try autoreleasepool {
                            let index = frame / perClip
                            if imageIndex != index {
                                let id = clips[index].photoId
                                guard id.range(of: "^[a-zA-Z0-9-]+\\.(jpg|jpeg|png)$", options: .regularExpression) != nil else { throw failure("Choose this photo again.") }
                                let url = source.appendingPathComponent(id)
                                let size = try files.attributesOfItem(atPath: url.path)[.size] as? NSNumber
                                guard let size, size.int64Value > 0, size.int64Value <= 20_000_000,
                                    let data = CGImageSourceCreateWithURL(url as CFURL, nil),
                                    let decoded = CGImageSourceCreateThumbnailAtIndex(data, 0, [kCGImageSourceCreateThumbnailFromImageAlways: true, kCGImageSourceCreateThumbnailWithTransform: true, kCGImageSourceThumbnailMaxPixelSize: 2048] as CFDictionary)
                                else { throw failure("A selected photo couldn't be opened. Remove it and choose another.") }
                                image = decoded; imageIndex = index
                            }
                            var pixel: CVPixelBuffer?
                            guard let pool = adaptor.pixelBufferPool, CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixel) == kCVReturnSuccess, let pixel, let image else { throw failure("Couldn't prepare a video frame.") }
                            try draw(image: image, caption: clips[index].caption, pixel: pixel, width: width, height: height, fraction: motion ? CGFloat(frame % perClip) / CGFloat(perClip - 1) : 0)
                            guard adaptor.append(pixel, withPresentationTime: CMTime(value: Int64(frame), timescale: 30)) else { throw writer.error ?? failure("Couldn't write this film.") }
                        }
                        if frame % 6 == 0 { let fraction = Float(frame + 1) / Float(count); DispatchQueue.main.async { if !job.cancelled { progress(KotlinFloat(value: fraction)) } } }
                    }
                    input.markAsFinished()
                    writer.endSession(atSourceTime: CMTime(value: Int64(count), timescale: 30))
                    let ended = DispatchSemaphore(value: 0)
                    writer.finishWriting { ended.signal() }
                    guard ended.wait(timeout: .now() + 20) == .success, writer.status == .completed, !job.cancelled else { throw writer.error ?? failure("Export stopped. Your draft stays saved.") }
                    let asset = AVURLAsset(url: output)
                    guard let track = asset.tracks(withMediaType: .video).first,
                          Int(track.naturalSize.width) == width, Int(track.naturalSize.height) == height,
                          abs(CMTimeGetSeconds(asset.duration) - Double(clips.count) * 2.8) < 0.15 else { throw failure("Couldn't verify this video. Try again.") }
                    let generator = AVAssetImageGenerator(asset: asset)
                    _ = try generator.copyCGImage(at: .zero, actualTime: nil)
                    succeeded = true
                    DispatchQueue.main.async { finished(output.lastPathComponent, nil) }
                } catch { writer.cancelWriting(); throw error }
            } catch { removePartial(output); let message = (error as NSError).localizedDescription; DispatchQueue.main.async { finished(nil, message) } }
        }
    }
    func cancel() { lock.lock(); current?.cancel(); lock.unlock() }
    private func failure(_ message: String) -> NSError { NSError(domain: "BarkLog.Video", code: 1, userInfo: [NSLocalizedDescriptionKey: message]) }
    private func draw(image: CGImage, caption: String, pixel: CVPixelBuffer, width: Int, height: Int, fraction: CGFloat) throws {
        CVPixelBufferLockBaseAddress(pixel, [])
        defer { CVPixelBufferUnlockBaseAddress(pixel, []) }
        guard let context = CGContext(data: CVPixelBufferGetBaseAddress(pixel), width: width, height: height, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixel), space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue) else { throw failure("Couldn't draw a video frame.") }
        context.translateBy(x: 0, y: CGFloat(height)); context.scaleBy(x: 1, y: -1)
        UIGraphicsPushContext(context); defer { UIGraphicsPopContext() }
        UIColor.white.setFill(); context.fill(CGRect(x: 0, y: 0, width: width, height: height))
        let scale = max(CGFloat(width) / CGFloat(image.width), CGFloat(height) / CGFloat(image.height)) * (1 + 0.08 * fraction)
        let w = CGFloat(image.width) * scale, h = CGFloat(image.height) * scale
        UIImage(cgImage: image).draw(in: CGRect(x: (CGFloat(width) - w) / 2, y: (CGFloat(height) - h) / 2 - CGFloat(height) * 0.012 * fraction, width: w, height: h))
        if !caption.isEmpty {
            let style = NSMutableParagraphStyle(); style.lineBreakMode = .byWordWrapping
            let attrs: [NSAttributedString.Key: Any] = [.font: UIFont(name: "Inter-Medium", size: 28) ?? UIFont.systemFont(ofSize: 28, weight: .medium), .foregroundColor: UIColor(red: 29/255, green: 38/255, blue: 32/255, alpha: 1), .paragraphStyle: style]
            let text = caption as NSString
            let bounds = text.boundingRect(with: CGSize(width: width - 72, height: 1000), options: [.usesLineFragmentOrigin, .usesFontLeading], attributes: attrs, context: nil)
            let top = CGFloat(height) - ceil(bounds.height) - 56
            UIColor.white.setFill(); context.fill(CGRect(x: 0, y: top, width: CGFloat(width), height: CGFloat(height) - top))
            text.draw(in: CGRect(x: 36, y: top + 28, width: CGFloat(width - 72), height: ceil(bounds.height)), withAttributes: attrs)
        }
    }
    func cancelShare() { DispatchQueue.main.async { [weak self] in self?.shareSheet?.dismiss(animated: false); self?.shareSheet = nil } }
    func share(filename: String, finished: @escaping (KotlinBoolean, String?) -> Void) {
        DispatchQueue.main.async { [self] in
            guard filename.range(of: "^(?:BarkLog|SoftPaws)-film-[a-zA-Z0-9-]+\\.mp4$", options: .regularExpression) != nil, files.fileExists(atPath: exports.appendingPathComponent(filename).path),
                let window = UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).flatMap({ $0.windows }).first(where: { $0.isKeyWindow }), var host = window.rootViewController else { finished(KotlinBoolean(value: false), "Export this MP4 again, then choose a destination."); return }
            while let presented = host.presentedViewController { host = presented }
            let sheet = UIActivityViewController(activityItems: [exports.appendingPathComponent(filename)], applicationActivities: nil)
            sheet.popoverPresentationController?.sourceView = host.view
            sheet.popoverPresentationController?.sourceRect = CGRect(x: host.view.bounds.midX, y: host.view.bounds.maxY - 40, width: 1, height: 1)
            // Files and app sharing need no broad photo-library write permission.
            sheet.excludedActivityTypes = [.saveToCameraRoll]
            shareSheet = sheet
            sheet.completionWithItemsHandler = { _, done, _, error in finished(KotlinBoolean(value: done), error?.localizedDescription) }
            host.present(sheet, animated: true)
        }
    }
}
