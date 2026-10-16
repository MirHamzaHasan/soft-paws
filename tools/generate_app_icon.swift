import AppKit
import Foundation

// Deterministic five-oval BarkLog mark. Regenerate on macOS with:
// swift tools/generate_app_icon.swift
let edge = 1024
let colorSpace = CGColorSpaceCreateDeviceRGB()
guard let context = CGContext(
    data: nil, width: edge, height: edge, bitsPerComponent: 8, bytesPerRow: edge * 4,
    space: colorSpace, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
) else { fatalError("Could not create icon canvas.") }

context.setFillColor(CGColor(red: 10 / 255, green: 10 / 255, blue: 10 / 255, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: edge, height: edge))
context.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))

let markEdge = Double(edge) * 0.64
let inset = Double(edge) * 0.18
func oval(_ x: Double, _ y: Double, _ width: Double, _ height: Double) {
    context.fillEllipse(in: CGRect(
        x: inset + x * markEdge,
        y: Double(edge) - inset - (y + height) * markEdge,
        width: width * markEdge, height: height * markEdge
    ))
}
oval(0.24, 0.48, 0.52, 0.42)
oval(0.04, 0.30, 0.20, 0.27)
oval(0.23, 0.06, 0.20, 0.27)
oval(0.54, 0.06, 0.20, 0.27)
oval(0.76, 0.30, 0.20, 0.27)

guard let cgImage = context.makeImage(),
      let png = NSBitmapImageRep(cgImage: cgImage).representation(using: .png, properties: [:])
else { fatalError("Could not encode icon.") }
let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let destination = root.appendingPathComponent("iosApp/iosApp/Assets.xcassets/AppIcon.appiconset/AppIcon.png")
try png.write(to: destination, options: .atomic)
print("Generated BarkLog's opaque 1024px iOS paw icon.")
