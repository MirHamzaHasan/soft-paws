import Foundation
import RiveRuntime
import Shared
import UIKit

/// Lazily decoded local files; every visible mascot gets its own artboard/controller.
@MainActor
private final class BarkMascotAssets {
    static let shared = BarkMascotAssets()
    private var loading: [String: Task<RiveRuntime.File, Error>] = [:]

    func file(notebook: Bool) async throws -> RiveRuntime.File {
        let name = notebook ? "barklog_care_notebook" : "barklog_spaniel"
        if let task = loading[name] { return try await task.value }
        let task = Task { @MainActor in
            let worker = try await Worker(configuration: .init(enableGPUCanvas: false))
            return try await RiveRuntime.File(source: .local(name, Bundle.main), worker: worker)
        }
        loading[name] = task
        do { return try await task.value }
        catch { loading[name] = nil; throw error }
    }
}

@MainActor
final class BarkMascotFactory: NSObject, @preconcurrency IosMascotFactory {
    func create(notebook: Bool, onReady: @escaping (KotlinBoolean) -> Void) -> any IosMascotRenderer {
        BarkMascotRenderer(notebook: notebook, onReady: onReady)
    }
}

@MainActor
private final class BarkMascotRenderer: NSObject, @preconcurrency IosMascotRenderer, RiveUIViewDelegate {
    let view = UIView(frame: .zero)
    private var riveView: RiveUIView?
    private var binding: ViewModelInstance?
    private var loading: Task<Void, Never>?
    private var onReady: ((KotlinBoolean) -> Void)?
    private var closed = false
    private var playing = true
    private var trigger: String?
    private var serial: Int32 = 0
    private var firedSerial: Int32 = 0

    init(notebook: Bool, onReady: @escaping (KotlinBoolean) -> Void) {
        self.onReady = onReady
        super.init()
        view.backgroundColor = .clear
        view.isOpaque = false
        view.isUserInteractionEnabled = false
        view.accessibilityElementsHidden = true
        loading = Task { @MainActor [weak self] in
            do {
                let file = try await BarkMascotAssets.shared.file(notebook: notebook)
                try Task.checkCancellation()
                let artboard = try await file.createArtboard(notebook ? "BarkLog Care Notebook" : "BarkLog Dog · Character Study")
                let binding = try await file.createViewModelInstance(.viewModelDefault(from: .artboardDefault(artboard)))
                let machine = try await artboard.createStateMachine(notebook ? "Care Companion" : "Dog Controller", binding: binding)
                let rive = try await Rive(file: file, artboard: artboard, stateMachine: machine)
                try Task.checkCancellation()
                guard let self, !self.closed else { return }
                let rendered = RiveUIView(rive: rive, delegate: self, isPaused: !self.playing)
                rendered.backgroundColor = .clear
                rendered.isOpaque = false
                rendered.isUserInteractionEnabled = false
                rendered.accessibilityElementsHidden = true
                rendered.translatesAutoresizingMaskIntoConstraints = false
                self.binding = binding
                self.riveView = rendered
                self.view.addSubview(rendered)
                NSLayoutConstraint.activate([
                    rendered.leadingAnchor.constraint(equalTo: self.view.leadingAnchor),
                    rendered.trailingAnchor.constraint(equalTo: self.view.trailingAnchor),
                    rendered.topAnchor.constraint(equalTo: self.view.topAnchor),
                    rendered.bottomAnchor.constraint(equalTo: self.view.bottomAnchor),
                ])
                #if DEBUG
                NSLog("BarkLogMascot ready %@", notebook ? "care-notebook" : "spaniel")
                #endif
                self.onReady?(KotlinBoolean(value: true))
                self.firePendingCue()
            } catch is CancellationError {
                // Leaving the screen cancels only this instance, never the shared file load.
            } catch {
                #if DEBUG
                NSLog("BarkLogMascot load failed: %@", String(describing: error))
                #endif
                self?.showFallback()
            }
        }
    }

    func update(trigger: String?, serial: Int32, playing: Bool) {
        guard !closed else { return }
        self.trigger = trigger
        self.serial = serial
        self.playing = playing
        riveView?.isPaused = !playing
        firePendingCue()
    }

    private func firePendingCue() {
        guard playing, !closed, serial != firedSerial, let trigger, let binding else { return }
        firedSerial = serial
        #if DEBUG
        NSLog("BarkLogMascot cue %@ (%d), bounds %@, attached %d", trigger, serial,
              String(describing: view.bounds), view.window != nil)
        #endif
        binding.fire(trigger: TriggerProperty(path: trigger))
    }

    func view(_ view: RiveUIView, didReceiveError: RiveUIViewError) {
        // Metal has no drawable before UIKit attaches/sizes the view, and may
        // temporarily lose one during lifecycle changes. The next display tick
        // retries; treating that as a permanent load error would disable motion.
        if case .noDrawable = didReceiveError { return }
        if case .noRenderer = didReceiveError, view.window == nil { return }
        #if DEBUG
        NSLog("BarkLogMascot render failed: %@", String(describing: didReceiveError))
        #endif
        showFallback()
    }

    private func showFallback() {
        riveView?.isPaused = true
        riveView?.rive = nil
        riveView?.removeFromSuperview()
        riveView = nil
        binding = nil
        onReady?(KotlinBoolean(value: false))
    }

    func close() {
        guard !closed else { return }
        closed = true
        loading?.cancel()
        loading = nil
        showFallback()
        onReady = nil
    }
}
