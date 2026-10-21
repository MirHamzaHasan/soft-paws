import XCTest
import CoreGraphics

/// Compose's sticky editor action sits above the keyboard and outside the scroll body.
private func journalScrollBottom(_ app: XCUIApplication) -> CGFloat {
    let saves = ["Save poop", "Save pee", "Save meal", "Save walk", "Save symptom", "Save mood", "Save behavior", "Save grooming", "Save weight", "Save changes"]
    let save = app.buttons.matching(NSPredicate(format: "label IN %@", saves)).firstMatch
    return app.buttons["Close"].exists && save.exists && save.isHittable ? save.frame.minY - 36 : app.frame.maxY
}

/// Explicit live acceptance only; requires an already authenticated, synthetic QA journal.
/// No credentials are supplied; automatic profile/week scope requires its current consent.
final class LiveAtlasJourneys: XCTestCase {
    private var app: XCUIApplication!
    private let question = "How can you help me related to my dog?"
    override func setUpWithError() throws {
        guard ProcessInfo.processInfo.environment["BARKLOG_LIVE_ATLAS_QA"] == "1" else {
            throw XCTSkip("Live Atlas UI acceptance requires explicit BARKLOG_LIVE_ATLAS_QA=1 and an owned QA journal.")
        }
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        app.launchArguments = []
        app.launch()
    }
    private func text(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot())
        image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func press(_ element: XCUIElement) {
        for _ in 0..<10 {
            if element.exists && element.isHittable && element.frame.minY > 40 && element.frame.maxY < app.frame.maxY - 20 {
                element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
                return
            }
            app.swipeUp()
        }
        XCTFail("Requested control is unavailable: \(element)")
    }
    private func openChat() {
        let home = app.buttons["Home"]
        XCTAssertTrue(home.waitForExistence(timeout: 15), app.debugDescription)
        if text("Your account.").exists && app.buttons["Back"].exists { press(app.buttons["Back"]) }
        else if !app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Ask about ")).firstMatch.exists { press(home) }
        let ask = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Ask about ")).firstMatch
        XCTAssertTrue(ask.waitForExistence(timeout: 8), app.debugDescription)
        press(ask)
        if app.buttons["Enable BarkLog AI"].waitForExistence(timeout: 3) {
            if !app.buttons["Enable BarkLog AI"].isEnabled {
                press(app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "I agree to online AI processing")).firstMatch)
            }
            press(app.buttons["Enable BarkLog AI"])
        }
        XCTAssertTrue(app.buttons["Send message"].waitForExistence(timeout: 12), app.debugDescription)
        XCTAssertTrue(text("BarkLog AI").exists, "Live acceptance must not use a demo or local-model fixture.")
    }
    func testQuestionGetsRealReplyAndSurvivesRelaunch() throws {
        XCTAssertTrue(app.buttons["Profile"].waitForExistence(timeout: 15), app.debugDescription)
        press(app.buttons["Profile"])
        XCTAssertTrue(text("Email · Firebase account").waitForExistence(timeout: 12), "Sign in to the existing QA account before running live acceptance.")
        capture("atlas-account-restored")
        openChat()
        press(app.buttons["Chat options"])
        press(text("Past conversations"))
        press(app.buttons["New conversation"])
        XCTAssertTrue(app.buttons["Send message"].waitForExistence(timeout: 8))
        XCTAssertTrue(text("Profile + past 7 days").exists, "New scope must be explicit and automatic.")
        let single = app.textFields["Message BarkLog AI"]
        let input = single.exists ? single : app.textViews["Message BarkLog AI"]
        XCTAssertTrue(input.waitForExistence(timeout: 8), app.debugDescription)
        let original = (input.value as? String) ?? ""
        XCTAssertTrue(original.isEmpty, "Preserve any existing draft instead of overwriting it.")
        press(input)
        input.typeText(question)
        press(app.buttons["Send message"])
        if app.buttons["Stop response"].waitForExistence(timeout: 3) { capture("atlas-loading") }
        let complete = app.buttons["Try another response"]
        let answered = complete.waitForExistence(timeout: 65)
        capture(answered ? "atlas-answer" : "atlas-request-failed")
        XCTAssertTrue(answered, app.debugDescription)
        XCTAssertFalse(((input.value as? String) ?? "").contains(question), "Committed send must clear the composer.")
        app.terminate()
        app.launch()
        XCTAssertTrue(app.buttons["Profile"].waitForExistence(timeout: 15))
        press(app.buttons["Profile"])
        XCTAssertTrue(text("Email · Firebase account").waitForExistence(timeout: 12), "The native Firebase session must survive relaunch.")
        openChat()
        XCTAssertTrue(app.buttons["Try another response"].waitForExistence(timeout: 15), app.debugDescription)
        capture("atlas-answer-after-relaunch")
    }
}

/// Separate synthetic SQLite fixture; no Firebase or network calls are enabled.
final class SoundAndWeeklyReviewJourneys: XCTestCase {
    private var app: XCUIApplication!
    private func element(_ label: String) -> XCUIElement { app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch }
    private func press(_ el: XCUIElement) {
        for _ in 0..<16 {
            if el.exists && el.isHittable && el.frame.minY > 40 && el.frame.maxY < app.frame.maxY - 20 {
                let settled = el.frame; Thread.sleep(forTimeInterval: 0.35)
                if settled == el.frame { el.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap(); return }
            }
            let chat = app.buttons["Send message"].exists
            let rail = app.staticTexts["Native board screen"]
            let pageBottom = rail.exists && rail.isHittable ? rail.frame.minY - 8 : journalScrollBottom(app) - 12
            let bottom = chat ? (app.textFields["Message BarkLog AI"].exists ? app.textFields["Message BarkLog AI"].frame.minY - 20 : app.frame.height * 0.60) : pageBottom
            let low = max(160, bottom - 35), high = max(70, low - min(230, low * 0.6))
            let x = app.frame.width * (chat ? 0.5 : 0.98)
            let a = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: low))
            let b = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: high))
            a.press(forDuration: 0.02, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.05)
            Thread.sleep(forTimeInterval: 0.4)
        }
        XCTFail("Control unavailable: \(el)")
    }
    private func capture(_ name: String) { let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a) }
    func testNormalJournalCanOpenSoundSettings() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        app.launchArguments = []; app.launch()
        guard app.buttons["Profile"].waitForExistence(timeout: 15) else { throw XCTSkip("A pre-existing local QA journal is required; never create or reset one for this check.") }
        press(app.buttons["Profile"])
        let entry = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Interaction sounds")).firstMatch
        press(entry)
        XCTAssertTrue(element("A softer little tap.").waitForExistence(timeout: 8), app.debugDescription)
        capture("ios-normal-sound-settings-entry")
    }
    func testSoundsAndSourceBackedWeeklyCards() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-ai-cards-v1", "-DesignReviewScreen", "next-sounds"]
        app.launch()
        let sound = app.switches.matching(NSPredicate(format: "label BEGINSWITH %@", "Interaction sounds")).firstMatch
        XCTAssertTrue(sound.waitForExistence(timeout: 20), app.debugDescription)
        if app.staticTexts["Sounds are off."].exists { press(sound) }
        let sample = app.buttons["Preview button tap sound"]
        for _ in 0..<20 { if sample.exists && sample.isEnabled { break }; Thread.sleep(forTimeInterval: 0.25) }
        XCTAssertTrue(sample.isEnabled, app.debugDescription)
        capture("ios-sounds-settings")
        press(sample); press(app.buttons["Preview selection tick sound"]); press(app.buttons["Preview saved sound"])
        capture("ios-sounds-samples")
        press(app.buttons["Try in AI chat"])
        if !app.buttons["Send message"].waitForExistence(timeout: 3) {
            capture("ios-weekly-consent")
            press(app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "I agree to online AI processing")).firstMatch)
            press(app.buttons["Enable BarkLog AI"])
        }
        XCTAssertTrue(app.buttons["Send message"].waitForExistence(timeout: 15), app.debugDescription)
        press(app.buttons["Chat options"]); press(element("Past conversations")); press(app.buttons["New conversation"])
        let single = app.textFields["Message BarkLog AI"]
        let input = single.exists ? single : app.textViews["Message BarkLog AI"]
        XCTAssertTrue(input.waitForExistence(timeout: 8)); press(input)
        input.typeText("How is Bruno doing with his walks?")
        press(app.buttons["Send message"])
        XCTAssertTrue(app.buttons["Try another response"].waitForExistence(timeout: 25), app.debugDescription)
        for _ in 0..<3 { app.swipeDown() }
        capture("ios-weekly-answer")
        press(app.buttons["View 7 walk logs"]); capture("ios-weekly-sources"); press(app.buttons["Close records"]); capture("ios-weekly-card-lower")
        press(app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Review automatic profile and seven-day context")).firstMatch)
        XCTAssertTrue(element("Included with every question").waitForExistence(timeout: 6), app.debugDescription)
        capture("ios-weekly-context")
        press(app.buttons["Back to chat"])
        app.terminate(); app.launch()
        XCTAssertTrue(sound.waitForExistence(timeout: 15))
        for _ in 0..<20 { if app.buttons["Preview button tap sound"].isEnabled { break }; Thread.sleep(forTimeInterval: 0.25) }
        XCTAssertFalse(app.staticTexts["Sounds are off."].exists)
        XCTAssertTrue(app.buttons["Preview button tap sound"].isEnabled)
        capture("ios-sound-preference-restored")
    }
}

final class JournalJourneys: XCTestCase {
    private var app: XCUIApplication!
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        app.launchArguments = []
        app.launch()
        if !app.buttons["Profile"].waitForExistence(timeout: 8) {
            XCTAssertTrue(app.buttons["Add my dog"].waitForExistence(timeout: 8), app.debugDescription)
            tap(app.buttons["Add my dog"])
            let name = field("Dog’s name")
            name.tap(); name.typeText("BarkLog QA")
            tap(button(prefix: "Start BarkLog QA"))
            let coach = app.buttons["Start logging"]
            if coach.waitForExistence(timeout: 4) { coach.tap() }
        }
        XCTAssertTrue(app.buttons["Profile"].waitForExistence(timeout: 12), app.debugDescription)
    }

    private func button(prefix: String) -> XCUIElement {
        app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch
    }
    private func field(_ label: String) -> XCUIElement {
        let single = app.textFields[label]
        return single.exists ? single : app.textViews[label]
    }
    private func reveal(_ element: XCUIElement) {
        for _ in 0..<14 {
            if visible(element) { return }
            swipeContent(up: !(element.exists && element.frame.midY < 70))
        }
        XCTAssertTrue(visible(element), "Could not reveal \(element).\n" + app.debugDescription)
    }
    private func visible(_ element: XCUIElement) -> Bool {
        guard element.exists, element.isHittable else { return false }
        let f = element.frame
        if ["Home", "Timeline", "Insights", "Profile"].contains(element.label), f.minY > app.frame.maxY - 85 { return true }
        let tabs = app.buttons["Home"]
        let tabTop = tabs.exists && tabs.isHittable ? tabs.frame.minY - 6 : app.frame.maxY - 10
        let keyboard = app.keyboards.firstMatch
        if element.label.hasPrefix("Save ") && app.buttons["Close"].exists { return true }
        let bottom = min(tabTop, keyboard.exists ? keyboard.frame.minY : app.frame.maxY, journalScrollBottom(app)) - 8
        return f.minY >= 22 && f.maxY <= bottom
    }
    private func tap(_ element: XCUIElement) {
        reveal(element)
        element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    }
    private func swipeContent(up: Bool) {
        let frame = app.frame
        let keyboard = app.keyboards.firstMatch
        let tabs = app.buttons["Home"]
        let contentBottom = tabs.exists && tabs.isHittable ? tabs.frame.minY - 8 : frame.maxY - 12
        let bottom = min(contentBottom, keyboard.exists ? keyboard.frame.minY : frame.maxY, journalScrollBottom(app)) - 12
        let low = max(160, bottom - 35)
        let high = max(70, low - min(230, low * 0.6))
        let a = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: frame.width * 0.98, dy: up ? low : high))
        let b = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: frame.width * 0.98, dy: up ? high : low))
        a.press(forDuration: 0.02, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.05)
    }
    private func fill(_ label: String, _ value: String) {
        let input = field(label); tap(input)
        let old = (input.value as? String) ?? ""
        if !old.isEmpty {
            input.tap(withNumberOfTaps: 3, numberOfTouches: 1)
        }
        input.typeText(value)
    }
    private func capture(_ name: String) {
        Thread.sleep(forTimeInterval: 1.25)
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }

    func testQuickLogDraftDetailedSaveAndTimeline() throws {
        capture("native-home-light")
        let poop = button(prefix: "Log Poop.")
        reveal(poop); tap(poop)
        let add = app.buttons["Add details"]
        for _ in 0..<7 { if add.isHittable { break }; swipeContent(up: false) }
        reveal(add); tap(add)
        let walk = button(prefix: "Walk"); reveal(walk); tap(walk)
        fill("Duration · optional", "25")
        fill("Notes (optional)", "A quiet path. Native QA draft retained.")
        for _ in 0..<12 { if app.buttons["Close"].isHittable { break }; swipeContent(up: false) }
        tap(app.buttons["Close"])
        XCTAssertTrue(app.buttons["Keep draft"].waitForExistence(timeout: 4))
        tap(app.buttons["Keep draft"])
        tap(button(prefix: "Walk"))
        let notes = field("Notes (optional)"); reveal(notes)
        XCTAssertTrue((notes.value as? String)?.contains("Native QA draft retained") == true)
        let save = app.buttons["Save walk"]; reveal(save); tap(save)
        XCTAssertTrue(app.buttons["Edit record"].waitForExistence(timeout: 8))
        capture("native-record-detail")
        tap(app.buttons["Back"])
        tap(app.buttons["Timeline"])
        XCTAssertTrue(app.buttons["Dates & dog"].waitForExistence(timeout: 5))
        capture("native-timeline")
    }

    func testMedicationExpenseAndPickerCancellation() throws {
        tap(app.buttons["Profile"])
        capture("native-profile")
        tap(button(prefix: "Health records"))
        tap(button(prefix: "Medication"))
        tap(app.buttons["Add medication plan"])
        fill("Medication name", "QA caregiver plan")
        fill("Amount and unit", "As entered by caregiver")
        let savePlan = app.buttons["Save plan"]; reveal(savePlan); tap(savePlan)
        let given = app.buttons["Mark given"]; reveal(given); tap(given)
        XCTAssertTrue(app.buttons["Done"].waitForExistence(timeout: 8), app.debugDescription)
        capture("native-medication-saved")
        tap(app.buttons["Done"]); tap(app.buttons["Profile"])
        let expenses = button(prefix: "Expenses"); reveal(expenses); tap(expenses)
        tap(app.buttons["Add expense"])
        fill("Amount", "12.34")
        let receipt = app.buttons["Attach receipt"]; reveal(receipt); tap(receipt)
        let cancel = app.buttons["Cancel"].firstMatch
        XCTAssertTrue(cancel.waitForExistence(timeout: 8)); cancel.tap()
        let saveExpense = app.buttons["Save expense"]; reveal(saveExpense); tap(saveExpense)
        XCTAssertTrue(app.buttons["Edit expense"].waitForExistence(timeout: 8))
        capture("native-expense-saved")
    }

    func testSupportingScreensAndRealPdfHandoff() throws {
        let surfaces = [("Care calendar", "Add care task"), ("Training", "Name response"), ("Photo journal", "Add a photo"), ("Memory Book", "Previous month"), ("Safety Center", "Emergency card")]
        for (label, title) in surfaces {
            app.terminate(); app.launch()
            XCTAssertTrue(app.buttons["Profile"].waitForExistence(timeout: 12))
            tap(app.buttons["Profile"])
            let entry = button(prefix: label); reveal(entry); tap(entry)
            XCTAssertTrue(button(prefix: title).waitForExistence(timeout: 8), app.debugDescription)
            capture("native-" + label.lowercased().replacingOccurrences(of: " ", with: "-"))
        }
        app.terminate(); app.launch()
        tap(app.buttons["Profile"])
        let settings = button(prefix: "Settings & storage"); reveal(settings); tap(settings)
        let export = button(prefix: "Export journal"); reveal(export); tap(export)
        let preview = app.buttons["Preview report"]; reveal(preview); tap(preview)
        tap(app.buttons["Choose file format"]); tap(button(prefix: "PDF"))
        let ready = app.buttons["Share or print"]; XCTAssertTrue(ready.waitForExistence(timeout: 20)); tap(ready)
        tap(app.buttons["Open platform handoff"])
        let close = app.buttons["Close"].firstMatch
        XCTAssertTrue(close.waitForExistence(timeout: 20), app.debugDescription)
        capture("native-pdf-share"); close.tap()
    }

    func testCalendarCompletionAndTrainingSession() throws {
        tap(app.buttons["Profile"])
        tap(button(prefix: "Care calendar"))
        tap(app.buttons["Add care task"])
        fill("Task name", "QA brush and check")
        let save = app.buttons["Save task"]; reveal(save); tap(save)
        tap(app.buttons["Not now"])
        tap(button(prefix: "QA brush and check"))
        let complete = app.buttons["Mark complete"]; reveal(complete); tap(complete)
        XCTAssertTrue(app.buttons["View Timeline"].waitForExistence(timeout: 8), app.debugDescription)
        capture("native-task-complete")
        app.terminate(); app.launch()
        tap(app.buttons["Profile"])
        let training = button(prefix: "Training"); reveal(training); tap(training)
        let program = button(prefix: "Name response"); reveal(program); tap(program)
        let start = app.buttons["Start session"]
        let enroll = app.buttons["Enroll and start"]
        if enroll.exists { reveal(enroll); tap(enroll) } else { reveal(start); tap(start) }
        let response = button(prefix: "Mark a successful response"); reveal(response); tap(response)
        let finish = app.buttons["Finish session"]; reveal(finish); tap(finish)
        let saveSession = app.buttons["Save session"]; reveal(saveSession); tap(saveSession)
        XCTAssertTrue(app.buttons["View program progress"].waitForExistence(timeout: 8), app.debugDescription)
        capture("native-training-saved")
    }

    func testRealPdfHandoff() throws {
        tap(app.buttons["Profile"])
        tap(button(prefix: "Settings & storage"))
        tap(button(prefix: "Export journal"))
        tap(app.buttons["Preview report"])
        tap(app.buttons["Choose file format"]); tap(button(prefix: "PDF"))
        let ready = app.buttons["Share or print"]; XCTAssertTrue(ready.waitForExistence(timeout: 20)); tap(ready)
        tap(app.buttons["Open platform handoff"])
        let close = app.buttons["Close"].firstMatch
        XCTAssertTrue(close.waitForExistence(timeout: 20), app.debugDescription)
        capture("native-pdf-share")
        close.tap()
    }

    func testDarkAppearanceAndReducedMotion() throws {
        tap(app.buttons["Profile"])
        let settings = button(prefix: "Settings & storage"); reveal(settings); tap(settings)
        tap(app.buttons["Theme"])
        let dark = button(prefix: "Dark"); reveal(dark); tap(dark)
        let reduce = app.switches.matching(NSPredicate(format: "label BEGINSWITH %@", "Reduce motion")).firstMatch
        reveal(reduce); tap(reduce)
        capture("native-settings-dark-reduced-motion")
        app.terminate(); app.launch()
        XCTAssertTrue(app.buttons["Profile"].waitForExistence(timeout: 12))
        capture("native-home-dark-reduced-motion")
        tap(app.buttons["Profile"]); reveal(settings); tap(settings)
        tap(app.buttons["Theme"])
        let light = button(prefix: "Light"); reveal(light); tap(light)
        reveal(reduce); tap(reduce)
    }
}

/// Run only on a newly created, owned simulator. Never clears an existing journal.
final class FirstRunJourney: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        app.launchArguments = ["-DesignReview", "-DesignReviewScreen", "opening-value", "-DesignReviewFixture", "park-setup-v1"]
        app.launch()
    }

    private func capture(_ name: String) {
        Thread.sleep(forTimeInterval: 1.25)
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name; attachment.lifetime = .keepAlways; add(attachment)
    }

    private func reveal(_ element: XCUIElement) {
        for _ in 0..<16 {
            if element.exists && element.isHittable && element.label.hasPrefix("Save ") && app.buttons["Close"].exists { return }
            // The native prediction/accessory row extends above the keyboard AX frame.
            let keyboardTop = app.keyboards.firstMatch.exists ? app.keyboards.firstMatch.frame.minY - 48 : app.frame.maxY
            let tabsTop = app.buttons["Home"].exists ? app.buttons["Home"].frame.minY - 6 : app.frame.maxY - 10
            let bottom = min(keyboardTop, tabsTop, journalScrollBottom(app)) - 12
            if element.exists && element.isHittable && element.frame.minY >= 22 && element.frame.maxY <= bottom { return }
            let up = !(element.exists && element.frame.midY < 70)
            let low = max(160, bottom - 30), high = max(70, low - min(230, low * 0.6))
            let a = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: app.frame.width * 0.98, dy: up ? low : high))
            let b = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: app.frame.width * 0.98, dy: up ? high : low))
            a.press(forDuration: 0.02, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.05)
        }
        XCTFail("Could not reveal \(element).\n" + app.debugDescription)
    }

    private func tap(_ label: String) {
        let element = app.buttons[label].firstMatch
        XCTAssertTrue(element.waitForExistence(timeout: 12), app.debugDescription)
        if ["Home", "Timeline", "Insights", "Profile"].contains(label) { element.tap(); return }
        reveal(element)
        element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    }

    private func fill(_ label: String, _ value: String) {
        let single = app.textFields[label]
        let input = single.exists ? single : app.textViews[label]
        XCTAssertTrue(input.waitForExistence(timeout: 8), app.debugDescription)
        reveal(input); input.tap(); input.typeText(value)
        if label != "Practice note" {
            XCTContext.runActivity(named: "Dismiss single-line setup keyboard using Done") { _ in
                let done = app.keyboards.buttons.matching(NSPredicate(format: "identifier == 'Done' OR label ==[c] 'done'")).firstMatch
                XCTAssertTrue(done.waitForExistence(timeout: 4), app.debugDescription); done.tap()
            }
        }
    }

    func testGuidedSetupReusesProfileAndShortcutsWithoutSavingPractice() throws {
        if app.buttons["Profile"].waitForExistence(timeout: 2) {
            throw XCTSkip("Use a fresh owned First Run QA simulator. Existing journals must not be cleared.")
        }
        let start = app.buttons["Add my dog"]
        XCTAssertTrue(start.waitForExistence(timeout: 12), app.debugDescription)
        capture("native-first-run-opening"); tap("Add my dog")
        fill("Dog’s name", "BarkLog Guided QA")
        capture("native-first-run-name"); tap("Make it yours · optional")
        capture("native-first-run-route"); tap("Show me around")
        capture("native-first-run-photo-optional"); tap("Keep illustration")
        tap("Labrador")
        let age = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "4–7 years")).firstMatch
        reveal(age); age.tap(); capture("native-first-run-identity")
        for title in ["Training", "Photos"] {
            let shortcut = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", title)).firstMatch
            reveal(shortcut); shortcut.tap()
        }
        capture("native-first-run-shortcuts"); tap("Continue")
        tap("Log a practice walk"); capture("native-first-run-practice"); tap("Add a note")
        fill("Practice note", "Native first-run practice stays unsaved.")
        let noteCaption = app.staticTexts["A short note is often the useful part."]
        reveal(noteCaption); noteCaption.tap()
        capture("native-first-run-note"); tap("Preview in Timeline")
        XCTAssertTrue(app.staticTexts["Native first-run practice stays unsaved."].waitForExistence(timeout: 8), app.debugDescription)
        capture("native-first-run-timeline-preview"); tap("Continue")
        capture("native-first-run-local-storage"); tap("Open our journal")
        capture("native-first-run-ready"); tap("Go to Home")
        XCTAssertTrue(app.buttons["Timeline"].waitForExistence(timeout: 12), app.debugDescription)
        capture("native-first-run-home")
        if app.buttons["Start logging"].waitForExistence(timeout: 3) { app.buttons["Start logging"].tap() }
        tap("Timeline")
        let emptyJournal = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "No matching records")).firstMatch
        XCTAssertTrue(emptyJournal.waitForExistence(timeout: 10), app.debugDescription)
        XCTAssertFalse(app.staticTexts["Native first-run practice stays unsaved."].exists)
        capture("native-first-run-real-empty-timeline")
        tap("Profile")
        let savedProfile = app.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", "Labrador · 4–7 years")).firstMatch
        XCTAssertTrue(savedProfile.waitForExistence(timeout: 8), app.debugDescription)
        capture("native-first-run-profile-reused")
        tap("Home")
        reveal(app.buttons["Training"])
        XCTAssertTrue(app.buttons["Training"].exists && app.buttons["Photos"].exists)
        capture("native-first-run-shortcuts-reused")
        tap("Profile")
        let settings = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Settings & storage")).firstMatch
        reveal(settings); settings.tap()
        for title in ["Training", "Photos", "Medication"] {
            let shortcut = app.switches[title]
            reveal(shortcut); shortcut.tap()
        }
        capture("native-home-shortcuts-settings")
        tap("Back"); tap("Home")
        reveal(app.buttons["Medication"]); tap("Medication")
        XCTAssertTrue(app.buttons["Add medication plan"].waitForExistence(timeout: 8), app.debugDescription)
        capture("native-home-medication-shortcut")
    }
}

/// Explicit Debug fixture uses a different SQLite filename and preference namespace.
final class BoardParityJourneys: XCTestCase {
    private var app: XCUIApplication!
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-day-v1", "-DesignReviewScreen", "home"]
        app.launch()
        XCTAssertTrue(app.buttons["Profile"].waitForExistence(timeout: 15), app.debugDescription)
    }
    private func button(_ prefix: String) -> XCUIElement {
        app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch
    }
    private func reveal(_ element: XCUIElement) {
        for _ in 0..<16 {
            if element.exists && element.isHittable && element.label.hasPrefix("Save ") && app.buttons["Close"].exists { return }
            let tabsTop = app.buttons["Home"].exists ? app.buttons["Home"].frame.minY - 6 : app.frame.maxY - 12
            let keyboardTop = app.keyboards.firstMatch.exists ? app.keyboards.firstMatch.frame.minY - 48 : app.frame.maxY
            let bottom = min(tabsTop, keyboardTop, journalScrollBottom(app)) - 12
            if element.exists && element.isHittable && element.frame.minY >= 48 && element.frame.maxY <= bottom { return }
            let up = !(element.exists && element.frame.midY < 80)
            let low = max(160, bottom - 30), high = max(80, low - min(250, low * 0.6))
            let a = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: app.frame.width * 0.98, dy: up ? low : high))
            let b = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: app.frame.width * 0.98, dy: up ? high : low))
            a.press(forDuration: 0.02, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.05)
        }
        XCTFail("Could not reveal element.\n" + app.debugDescription)
    }
    private func tap(_ element: XCUIElement) {
        XCTAssertTrue(element.waitForExistence(timeout: 10), app.debugDescription)
        reveal(element); element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    }
    private func capture(_ name: String) {
        Thread.sleep(forTimeInterval: 1.25)
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    func testCommittedQuickLogAndEarlyUndoPreserveCount() throws {
        let poop = button("Log Poop.")
        XCTAssertTrue(poop.waitForExistence(timeout: 8), app.debugDescription)
        let before = poop.label
        capture("parity-home-before")
        tap(poop)
        let feedback = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Poop logged at")).firstMatch
        XCTAssertTrue(feedback.waitForExistence(timeout: 4), app.debugDescription)
        tap(app.buttons["Undo"])
        let restored = XCTNSPredicateExpectation(predicate: NSPredicate(format: "label == %@", before), object: poop)
        XCTAssertEqual(XCTWaiter.wait(for: [restored], timeout: 5), .completed)
        capture("parity-home-after-undo")
    }
    func testWalkDraftSurvivesCloseAndSaveOpensCommittedDetail() throws {
        tap(app.buttons["Add details"]); tap(button("Walk"))
        let singleDuration = app.textFields["Duration · optional"]
        let duration = singleDuration.exists ? singleDuration : app.textViews["Duration · optional"]
        tap(duration)
        if let old = duration.value as? String, old != "Empty", !old.isEmpty { duration.tap(withNumberOfTaps: 3, numberOfTouches: 1) }
        duration.typeText("24")
        let notes = app.textViews["Notes (optional)"]
        tap(notes)
        if let old = notes.value as? String, old != "Empty", !old.isEmpty { notes.tap(withNumberOfTaps: 3, numberOfTouches: 1) }
        notes.typeText("Board parity QA: quiet riverside route.")
        let caption = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "A note for later")).firstMatch
        reveal(caption); caption.tap()
        tap(app.buttons["Close"])
        tap(app.buttons["Keep draft"])
        tap(button("Walk"))
        reveal(notes)
        XCTAssertTrue((notes.value as? String)?.contains("quiet riverside route") == true, app.debugDescription)
        capture("parity-retained-walk-note")
        tap(app.buttons["Save walk"])
        XCTAssertTrue(app.buttons["Edit record"].waitForExistence(timeout: 10), app.debugDescription)
        capture("parity-committed-walk")
    }
    func testRestScreensRemainReachableWithRealFixture() throws {
        let screens = ["home", "timeline", "insights-overview", "profile-hub", "log-chooser", "form-poop", "form-pee", "form-meal", "form-walk", "form-symptom", "form-mood", "form-behavior", "form-grooming", "form-weight", "onboarding-route", "onboarding-identity", "onboarding-breed", "onboarding-age", "onboarding-shortcuts", "onboarding-practice", "onboarding-notes", "onboarding-timeline", "onboarding-storage", "onboarding-ready"]
        for id in screens {
            app.terminate()
            app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-day-v1", "-DesignReviewScreen", id]
            app.launch()
            XCTAssertTrue(app.buttons.firstMatch.waitForExistence(timeout: 12), "Missing \(id): " + app.debugDescription)
            Thread.sleep(forTimeInterval: 1.2)
            capture("parity-" + id)
            XCTAssertFalse(app.staticTexts["Couldn't prepare the separate review journal."].exists, app.debugDescription)
        }
    }
}

/// Operation failures are one-shot Debug faults on the separate real SQLite QA journal.
/// Screenshots use separate real QA stores; no capture resets or deletes records.
private func captureBoardRest(_ test: XCTestCase, cases: [(String, String, String)]) {
    let app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
    for (id, fixture, expected) in cases {
        XCTContext.runActivity(named: "Rest: " + id) { _ in
            app.terminate()
            app.launchArguments = ["-DesignReview", "-DesignReviewFixture", fixture, "-DesignReviewScreen", id]
            app.launch()
            let label = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", expected)).firstMatch
            XCTAssertTrue(label.waitForExistence(timeout: 15), id + ": " + app.debugDescription)
            Thread.sleep(forTimeInterval: 1.3)
            let image = XCTAttachment(screenshot: app.screenshot())
            image.name = "visual-" + id; image.lifetime = .keepAlways; test.add(image)
            XCTAssertFalse(app.staticTexts["Couldn't prepare the separate review journal."].exists)
        }
    }
}

final class BoardVisualVariants: XCTestCase {
    override func setUpWithError() throws { continueAfterFailure = false }
    func testCoreFamiliesAtRest() {
        captureBoardRest(self, cases: [
            ("home", "park-day-v1", "Add details"),
            ("form-meal", "park-full-v1", "Save meal"),
            ("form-walk", "park-full-v1", "Save walk"),
            ("profile-hub", "park-full-v1", "Switch dog"),
            ("care-calendar", "park-full-v1", "Care calendar"),
            ("memory-book", "park-contexts-v1", "Memory Book"),
            ("photo-detail", "park-full-v1", "Park walk"),
            ("report-preview", "park-full-v1", "Report preview"),
            ("trends-month", "park-contexts-v1", "Recorded walk minutes"),
            ("training-program", "park-full-v1", "Name response")
        ])
    }
}

final class BoardVisualEditors: XCTestCase {
    override func setUpWithError() throws { continueAfterFailure = false }
    func testEveryTypedEditorAtRest() {
        captureBoardRest(self, cases: ["poop", "pee", "meal", "walk", "symptom", "mood", "behavior", "grooming", "weight"].map {
            ("form-" + $0, "park-full-v1", "Save " + $0)
        })
    }
}

final class BoardVisualFamilies: XCTestCase {
    override func setUpWithError() throws { continueAfterFailure = false }
    func testSupportingFamiliesAtRest() {
        let full = "park-full-v1", contexts = "park-contexts-v1", empty = "park-empty-v1"
        captureBoardRest(self, cases: [
            ("log-chooser", full, "Create a log."),
            ("record-detail", full, "Edit record"), ("record-edit", full, "Save changes"),
            ("dog-switcher", full, "Choose a dog"), ("dog-add", full, "Add a dog"),
            ("dog-edit", full, "Edit dog"), ("profile-settings", full, "Settings"),
            ("health-records", full, "Health records"), ("medication-list", full, "Medication"),
            ("medication-plan", full, "Add medication plan"), ("medication-plan-edit", full, "Edit medication plan"),
            ("medication-detail", full, "Example medication"), ("medication-given", full, "Recorded as given"),
            ("medication-archive", full, "Archive this plan?"), ("medication-empty", empty, "No active plans"),
            ("vaccination-list", full, "Vaccinations"), ("vaccination-form", full, "Add vaccination"),
            ("care-task-detail", full, "Mark complete"), ("care-task-form", full, "Edit care task"),
            ("reminder-opt-in", full, "Not now"), ("care-task-overdue", full, "Mark complete now"),
            ("care-task-complete", full, "View Timeline"), ("care-task-delete", full, "Delete task"),
            ("trends-sparse", contexts, "2 recorded weights"), ("trends-empty", empty, "No observations in this range"),
            ("safety-home", full, "Safety Center"), ("emergency-card", contexts, "Emergency card"),
            ("emergency-contact", full, "Emergency contacts"), ("toxicity-search", full, "Toxicity lookup"),
            ("toxicity-result", full, "Chocolate"), ("toxicity-unknown", full, "Not found in the offline list"),
            ("first-aid", full, "Bleeding"), ("triage", full, "What are you seeing?"),
            ("vet-prep", full, "Prepare a report"), ("export-format", full, "Choose a format"),
            ("export-complete", full, "Share or print"), ("training-catalog", full, "Training"),
            ("training-progress", full, "Practice again"), ("training-session", full, "Finish session"),
            ("training-summary", full, "Session saved"), ("photo-journal", full, "Photo journal"),
            ("photo-picker", full, "Choose a photo"), ("photo-form", full, "Edit photo details"),
            ("photo-baselines", full, "Baselines"), ("photo-missing", full, "Photo file not available"),
            ("expenses-list", full, "Expenses"), ("expense-form", full, "Add expense"),
            ("expense-detail", full, "Edit expense"), ("expense-delete", full, "Delete this expense?"),
            ("expense-empty", empty, "No expenses recorded"),
            ("memory-highlight", contexts, "The evening park loop"), ("memory-sparse", contexts, "One saved highlight"),
            ("memory-photo-missing", contexts, "Photo unavailable"), ("memory-share", contexts, "Share October"),
            ("memory-collection", contexts, "Keep these moments"), ("memory-caption", contexts, "Your words, kept"),
            ("memory-empty", contexts, "No highlights chosen"), ("home-empty", empty, "Nothing recorded yet today"),
            ("timeline-filtered-empty", full, "No matching records"),
            ("no-dog", "park-no-dog-v1", "Start with your dog")
        ])
    }
}

/// These journeys use the existing separate QA SQLite file and never reset it.
final class BoardMotionJourneys: XCTestCase {
    private var app: XCUIApplication!
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-day-v1", "-DesignReviewScreen", "home"]
        app.launch()
        XCTAssertTrue(app.buttons["Add details"].waitForExistence(timeout: 15), app.debugDescription)
    }
    private func button(_ prefix: String) -> XCUIElement {
        app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch
    }
    private func capture(_ name: String) {
        Thread.sleep(forTimeInterval: 0.9)
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    func testCareStripBrowseDetailAndBackKeepPosition() throws {
        let earlier = button("Show earlier care records")
        let latest = button("Show latest care records")
        XCTAssertTrue(earlier.waitForExistence(timeout: 8)); XCTAssertTrue(earlier.isEnabled)
        earlier.tap()
        let moved = XCTNSPredicateExpectation(predicate: NSPredicate(format: "enabled == true"), object: latest)
        XCTAssertEqual(XCTWaiter.wait(for: [moved], timeout: 4), .completed)
        capture("motion-care-earlier")
        let records = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", ". View record"))
        let visible = records.allElementsBoundByIndex.first { $0.isHittable && $0.frame.minX > 20 && $0.frame.maxX < app.frame.width - 20 }
        let record = try XCTUnwrap(visible, app.debugDescription)
        let label = record.label; let x = record.frame.minX
        record.tap()
        XCTAssertTrue(app.buttons["Edit record"].waitForExistence(timeout: 8), app.debugDescription)
        capture("motion-care-record")
        app.buttons["Back"].tap()
        XCTAssertTrue(earlier.waitForExistence(timeout: 8))
        let returned = app.buttons[label]
        XCTAssertTrue(returned.waitForExistence(timeout: 5)); XCTAssertTrue(returned.isHittable)
        XCTAssertEqual(returned.frame.minX, x, accuracy: 3, "Back should preserve the browsed care position")
        latest.tap(); capture("motion-care-latest")
        XCTAssertFalse(latest.isEnabled)
    }
    func testDirectionalTabsChooserAndCalendarBack() throws {
        let countBefore = button("Log Pee.").label
        for (tab, expected) in [("Profile", "Switch dog"), ("Timeline", "Timeline"), ("Insights", "This week"), ("Home", "Add details")] {
            app.buttons[tab].tap()
            XCTAssertTrue(app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", expected)).firstMatch.waitForExistence(timeout: 8), app.debugDescription)
            capture("motion-tab-" + tab.lowercased())
        }
        app.buttons["Add details"].tap()
        XCTAssertTrue(app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Create a log.")).firstMatch.waitForExistence(timeout: 8), app.debugDescription)
        capture("motion-cover-chooser"); app.buttons["Back"].tap()
        XCTAssertTrue(app.buttons["Add details"].waitForExistence(timeout: 8))
        app.buttons["Profile"].tap()
        XCTAssertTrue(button("Care calendar").waitForExistence(timeout: 8))
        // XCTest's UIKit idle signal does not include our Compose page clock.
        // Inspect the settled page before exercising its child control.
        capture("motion-profile-before-calendar")
        button("Care calendar").coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        XCTAssertTrue(app.buttons["Back"].waitForExistence(timeout: 8)); capture("motion-push-calendar")
        app.buttons["Back"].tap()
        XCTAssertTrue(app.buttons["Switch dog"].waitForExistence(timeout: 8)); capture("motion-back-profile")
        app.buttons["Home"].tap()
        XCTAssertEqual(button("Log Pee.").label, countBefore)
    }
    func testLoadingCareStripKeepsQuickCareInPlace() throws {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-day-v1", "-DesignReviewScreen", "home-loading"]
        app.launch()
        let heading = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Quick care")).firstMatch
        XCTAssertTrue(heading.waitForExistence(timeout: 8), app.debugDescription)
        XCTAssertFalse(button("Show earlier care records").exists, "Expected the delayed read, not a settled Home capture")
        let before = heading.frame.minY
        capture("motion-home-loading")
        XCTAssertTrue(button("Show earlier care records").waitForExistence(timeout: 20), app.debugDescription)
        XCTAssertEqual(heading.frame.minY, before, accuracy: 2, "Reading records must not move Quick care")
        capture("motion-home-loaded")
    }
}

final class BoardRecoveryJourneys: XCTestCase {
    private var app: XCUIApplication!
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
    }
    private func open(_ id: String, fixture: String = "park-full-v1") {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", fixture, "-DesignReviewScreen", id]
        app.launch()
    }
    private func label(_ value: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", value)).firstMatch
    }
    private func button(_ prefix: String) -> XCUIElement {
        app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch
    }
    private func tap(_ element: XCUIElement) {
        XCTAssertTrue(element.waitForExistence(timeout: 15), app.debugDescription)
        for _ in 0..<12 {
            if element.isHittable && element.frame.minY > 48 && (element.frame.maxY < journalScrollBottom(app) || element.label.hasPrefix("Save ")) { element.tap(); return }
            let bottom = min(journalScrollBottom(app) - 20, app.keyboards.firstMatch.exists ? app.keyboards.firstMatch.frame.minY - 30 : app.frame.maxY - 55)
            let a = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: app.frame.width * 0.98, dy: bottom))
            let b = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: app.frame.width * 0.98, dy: max(100, bottom - 280)))
            a.press(forDuration: 0.02, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.05)
        }
        XCTFail("Cannot reach \(element.label): " + app.debugDescription)
    }
    private func capture(_ id: String) {
        Thread.sleep(forTimeInterval: 1.25)
        let shot = XCTAttachment(screenshot: app.screenshot()); shot.name = id; shot.lifetime = .keepAlways; add(shot)
    }
    func testStartupAndJournalReadRetryPreserveExistingJournal() throws {
        for id in ["startup-retry", "journal-error"] {
            open(id)
            XCTAssertTrue(app.buttons["Try again"].waitForExistence(timeout: 15), app.debugDescription)
            capture(id)
            tap(app.buttons["Try again"])
            XCTAssertTrue(app.buttons["Add details"].waitForExistence(timeout: 15), app.debugDescription)
            capture(id + "-recovered")
        }
    }
    func testLocalCatalogEmptyAndErrorRetry() throws {
        for (id, title) in [("training-empty", "No programs available"), ("training-error", "Couldn't open training programs")] {
            open(id)
            XCTAssertTrue(label(title).waitForExistence(timeout: 15), app.debugDescription)
            capture(id)
            tap(app.buttons["Try again"])
            XCTAssertTrue(button("Name response").waitForExistence(timeout: 10), app.debugDescription)
            capture(id + "-recovered")
        }
    }
    func testFailedAdministrationRetainsIntentAndExplicitRetryCreatesResult() throws {
        open("medication-save-error")
        tap(app.buttons["Mark given"])
        XCTAssertTrue(label("Administration not saved").waitForExistence(timeout: 8), app.debugDescription)
        XCTAssertFalse(label("Recorded as given").exists)
        capture("medication-save-error")
        tap(app.buttons["Retry save"])
        XCTAssertTrue(app.buttons["Done"].waitForExistence(timeout: 10), app.debugDescription)
        XCTAssertTrue(label("Recorded as given").exists)
        capture("medication-retry-committed")
    }
    func testPhotoCancellationAndDenialStayDistinct() throws {
        for (id, action, title) in [("photo-unavailable", "Open platform picker", "No photo was added"), ("photo-permission-denied", "Open platform picker", "Photo access not granted")] {
            open(id); tap(app.buttons[action])
            XCTAssertTrue(label(title).waitForExistence(timeout: 8), app.debugDescription)
            capture(id)
        }
    }
    func testExportFailureRetriesActualFilePreparation() throws {
        open("export-failure")
        XCTAssertTrue(app.buttons["Try again"].waitForExistence(timeout: 15), app.debugDescription)
        capture("export-failure")
        tap(app.buttons["Try again"])
        XCTAssertTrue(app.buttons["Share or print"].waitForExistence(timeout: 15), app.debugDescription)
        capture("export-file-ready-after-retry")
    }

    private func field(_ name: String) -> XCUIElement {
        let plain = app.textFields[name]
        return plain.exists ? plain : app.textViews[name]
    }
    private func fill(_ name: String, _ value: String) {
        let input = field(name); tap(input)
        if let old = input.value as? String, old != "Empty", !old.isEmpty { input.tap(withNumberOfTaps: 3, numberOfTouches: 1) }
        input.typeText(value)
    }
    func testFailedMealSaveKeepsEnteredValuesUntilRetryCommits() throws {
        open("save-error")
        XCTAssertTrue(app.buttons["Save meal"].waitForExistence(timeout: 15), app.debugDescription)
        fill("Food or recipe · optional", "Dry food")
        tap(app.buttons["Save meal"])
        let failed = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Couldn't save this change.")).firstMatch
        XCTAssertTrue(failed.waitForExistence(timeout: 8), app.debugDescription)
        XCTAssertFalse(app.buttons["Edit record"].exists)
        capture("save-error-retained-values")
        tap(app.buttons["Save meal"])
        XCTAssertTrue(app.buttons["Edit record"].waitForExistence(timeout: 15), app.debugDescription)
        capture("meal-retry-committed")
    }
    func testStaleEditRequiresReviewAndReloadConfirmation() throws {
        open("stale-record")
        XCTAssertTrue(app.buttons["Save changes"].waitForExistence(timeout: 15), app.debugDescription)
        fill("Duration · optional", "25")
        tap(app.buttons["Save changes"])
        XCTAssertTrue(app.buttons["Review saved version"].waitForExistence(timeout: 10), app.debugDescription)
        capture("stale-record-retained-draft")
        tap(app.buttons["Keep editing my draft"])
        tap(app.buttons["Reload saved details"])
        XCTAssertTrue(label("Replace this draft?").waitForExistence(timeout: 8), app.debugDescription)
        tap(app.buttons["Keep editing"])
        XCTAssertTrue(app.buttons["Save changes"].exists)
        capture("stale-record-reload-cancelled")
    }
    func testRealFileShareHandoffCanBeCancelled() throws {
        open("export-complete")
        tap(app.buttons["Share or print"]); tap(app.buttons["Open platform handoff"])
        let close = app.buttons["Close"].firstMatch
        XCTAssertTrue(close.waitForExistence(timeout: 20), app.debugDescription)
        capture("export-real-native-share")
        close.tap()
        XCTAssertTrue(app.buttons["Back to preview"].waitForExistence(timeout: 10), app.debugDescription)
    }
}

/// All writes are confined to park-video-v1, never the owner's journal.
final class HighlightAndChatJourneys: XCTestCase {
    private var app: XCUIApplication!
    override func setUpWithError() throws { continueAfterFailure = false; app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log") }
    private func launch(_ screen: String) {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewScreen", screen, "-DesignReviewFixture", "park-video-v1"]
        app.launch()
        Thread.sleep(forTimeInterval: 0.7)
    }
    private func reveal(_ label: String) -> XCUIElement {
        let target = app.buttons[label]
        for _ in 0..<12 {
            let review = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Native board screen")).firstMatch
            let bottom = review.exists ? review.frame.minY - 60 : app.frame.maxY - 40
            if target.exists && target.isHittable && target.frame.minY > 65 && target.frame.maxY < bottom { return target }
            let low = bottom - 25, high = max(100, low - 240)
            let origin = app.coordinate(withNormalizedOffset: .zero)
            let a = origin.withOffset(CGVector(dx: app.frame.width * 0.98, dy: low))
            let b = origin.withOffset(CGVector(dx: app.frame.width * 0.98, dy: high))
            a.press(forDuration: 0.02, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.05)
            Thread.sleep(forTimeInterval: 0.8)
        }
        return target
    }
    private func text(_ label: String) -> XCUIElement { app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch }
    private func press(_ element: XCUIElement) { element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap(); Thread.sleep(forTimeInterval: 0.65) }
    private func capture(_ name: String) { let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image) }
    func test01VideoDraftGateRealExportAndShareCancellation() throws {
        launch("VideoHighlight")
        XCTAssertTrue(text("Make a little film.").waitForExistence(timeout: 15), app.debugDescription)
        capture("video-editor")
        press(reveal("Choose photos"));press(app.buttons["From my phone"])
        XCTAssertTrue(app.buttons["Cancel"].waitForExistence(timeout: 8), app.debugDescription)
        capture("video-native-photo-picker");press(app.buttons["Cancel"])
        press(reveal("Export video · Premium"))
        let see = app.buttons["See Premium"]
        if see.waitForExistence(timeout: 3) {
            press(see); let demo = reveal("Try demo Premium"); XCTAssertTrue(demo.isEnabled, app.debugDescription); press(demo)
            XCTAssertTrue(app.buttons["Export video · Premium"].waitForExistence(timeout: 8))
            press(reveal("Export video · Premium"))
        }
        XCTAssertTrue(text("Your film is ready.").waitForExistence(timeout: 90), app.debugDescription)
        capture("video-ready")
        press(reveal("Save or share MP4"))
        let cancel = app.buttons["Close"]
        if cancel.waitForExistence(timeout: 4) { press(cancel) } else { app.swipeDown() }
        XCTAssertTrue(text("Your film is ready.").waitForExistence(timeout: 8))
        launch("VideoHighlight")
        XCTAssertTrue(text("Make a little film.").waitForExistence(timeout: 12))
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Preview photo 1")).firstMatch.exists, app.debugDescription)
    }
    func test02ChatPhotosVetReportAndContacts() throws {
        launch("next-ai-privacy")
        let consent = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Use the messages I send for an AI response.")).firstMatch
        XCTAssertTrue(consent.waitForExistence(timeout: 12), app.debugDescription)
        let openChat = reveal("Open AI chat")
        if !openChat.isEnabled { press(consent) }
        press(reveal("Open AI chat"))
        XCTAssertTrue(app.buttons["Send message"].waitForExistence(timeout: 10), app.debugDescription)
        if !app.buttons["When was the last walk?"].exists {
            press(app.buttons["Chat options"]); press(app.buttons["Past conversations"])
            press(reveal("New conversation"))
            XCTAssertTrue(app.buttons["When was the last walk?"].waitForExistence(timeout: 8))
        }
        capture("chat-empty")
        press(app.buttons["When was the last walk?"])
        let stop = app.buttons["Stop response"]
        if stop.waitForExistence(timeout: 3) { capture("chat-streaming") }
        XCTAssertTrue(app.buttons["Try another response"].waitForExistence(timeout: 15), app.debugDescription)
        capture("chat-answer")
        XCTAssertTrue(app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Choose journal context")).firstMatch.exists)
        press(app.buttons["Chat options"])
        press(app.buttons["Report for my vet"])
        XCTAssertTrue(text("A report for your vet").waitForExistence(timeout: 6), app.debugDescription)
        capture("chat-vet-report")
        press(app.buttons["Download PDF · Premium"])
        XCTAssertTrue(app.buttons["Save or share PDF"].waitForExistence(timeout: 10), app.debugDescription)
        capture("chat-pdf-ready")
        press(app.buttons["Back to chat"])
        press(app.buttons["Chat options"]); press(app.buttons["Call my vet"])
        XCTAssertTrue(text("Call your vet").waitForExistence(timeout: 5))
        capture("chat-vet-contacts");press(app.buttons["Back to chat"])
        press(app.buttons["Attach a photo"])
        XCTAssertTrue(text("Add a photo").waitForExistence(timeout: 5))
        press(app.buttons["Choose from photos"])
        let cancelPhoto = app.buttons["Cancel"]
        XCTAssertTrue(cancelPhoto.waitForExistence(timeout: 8), app.debugDescription)
        capture("chat-native-photo-picker")
        press(cancelPhoto)
        XCTAssertTrue(app.buttons["Attach a photo"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["Attach a photo"].isEnabled)
        capture("chat-photo-result")
    }
    func test03KeyboardEntryAndClearQaDraft() throws {
        launch("next-chat")
        let single=app.textFields["Message BarkLog AI"]
        let input=single.exists ? single : app.textViews["Message BarkLog AI"]
        XCTAssertTrue(input.waitForExistence(timeout: 10),app.debugDescription)
        let before=(input.value as? String) ?? ""
        let initialTree=XCTAttachment(string: "before=\(before)\n" + app.debugDescription)
        initialTree.name="keyboard-initial-tree"; initialTree.lifetime = .keepAlways; add(initialTree)
        // Preserve any owner-authored draft; only clear our own temporary typing probe.
        let probe=["QA keyboard check","QA keyboard chec","K"].contains(before)
        if !before.isEmpty && !probe { return }
        press(input)
        if probe { input.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue,count:before.count)) }
        input.typeText("Keyboard QA")
        XCTAssertTrue(((input.value as? String) ?? "").contains("Keyboard QA"))
        let send=app.buttons["Send message"], attach=app.buttons["Attach a photo"]
        XCTAssertTrue(send.exists && send.isHittable && send.frame.height >= 44,app.debugDescription)
        XCTAssertTrue(attach.exists && attach.isHittable && attach.frame.height >= 44,app.debugDescription)
        XCTAssertGreaterThanOrEqual(send.frame.minY,input.frame.maxY - 2,"Composer controls must stay below the input instead of overlapping it.")
        if app.keyboards.firstMatch.exists { XCTAssertLessThanOrEqual(send.frame.maxY,app.keyboards.firstMatch.frame.minY + 2) }
        let geometry=XCTAttachment(string: "input=\(input.frame) send=\(send.frame) attach=\(attach.frame) keyboard=\(app.keyboards.firstMatch.frame)\n" + app.debugDescription)
        geometry.name="keyboard-layout-tree";geometry.lifetime = .keepAlways;add(geometry)
        capture("chat-keyboard")
        input.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue,count:11))
        // UIKit may still hold the final composing character after rapid deletes.
        Thread.sleep(forTimeInterval: 0.4)
        let remaining=(input.value as? String) ?? ""
        if !remaining.isEmpty && "Keyboard QA".hasPrefix(remaining) {
            input.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue,count:remaining.count))
        }
        Thread.sleep(forTimeInterval: 0.4)
        XCTAssertEqual((input.value as? String) ?? "", "")
        capture("chat-keyboard-cleared")
    }

}

/// The additional-dog profile uses the approved onboarding in a separate real SQLite journal.
final class AddDogReviewJourneys: XCTestCase {
    private var app: XCUIApplication!
    private func element(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", label)).firstMatch
    }
    // Read one AX snapshot per attempt: animated Compose nodes can be replaced between queries.
    private func nodes() -> [XCUIElementSnapshot] {
        guard let root = try? app.snapshot() else { return [] }
        func flatten(_ node: XCUIElementSnapshot) -> [XCUIElementSnapshot] { [node] + node.children.flatMap(flatten) }
        return flatten(root)
    }
    private func contentBottom(_ tree: [XCUIElementSnapshot]) -> CGFloat {
        var bottom = app.frame.height - 25
        for node in tree where !node.frame.isEmpty && node.frame.minY > 40 {
            if node.elementType == .staticText && node.label == "Native board screen" {
                // The review toolbar sits below the content's home-indicator inset.
                bottom = min(bottom, node.frame.minY - 48)
            } else if node.elementType == .keyboard ||
               (node.elementType == .button && ["Finish later", "Home"].contains(node.label)) {
                bottom = min(bottom, node.frame.minY - 10)
            }
        }
        return bottom
    }
    private func scroll(_ bottom: CGFloat) {
        let low = max(180, bottom - 25), high = max(105, low - 240)
        let x = app.frame.width * 0.98
        let a = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: low))
        let b = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: high))
        a.press(forDuration: 0.02, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.3)
        Thread.sleep(forTimeInterval: 0.6)
    }
    private func touch(_ frame: CGRect) {
        app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: frame.midX, dy: frame.midY)).tap()
        Thread.sleep(forTimeInterval: 0.65)
    }
    private func press(_ label: String) {
        for _ in 0..<25 {
            let tree = nodes(); let bottom = contentBottom(tree)
            let limit = ["Finish later", "Home", "Timeline", "Insights", "Profile"].contains(label) ? app.frame.maxY - 20 : bottom
            if let node = tree.first(where: { $0.label.hasPrefix(label) && !$0.frame.isEmpty && $0.frame.minY > 40 && $0.frame.maxY < limit }) {
                let step = tree.first(where: { $0.elementType == .button && $0.label.hasPrefix("Native board screen,") })?.label
                touch(node.frame)
                // A tap can stop residual scroll momentum before it activates a control.
                if label == "Continue", let step {
                    let settled = nodes()
                    if settled.contains(where: { $0.label == step }),
                       let current = settled.first(where: { $0.elementType == .button && $0.label == label && !$0.frame.isEmpty && $0.frame.minY > 40 && $0.frame.maxY < contentBottom(settled) }) {
                        touch(current.frame)
                    }
                }
                return
            }
            scroll(bottom)
        }
        XCTFail("Missing control: \(label). \(app.debugDescription)")
    }
    private func choose(_ label: String) {
        for _ in 0..<25 {
            let tree = nodes(); let bottom = contentBottom(tree)
            if tree.contains(where: { $0.label == label + " ×" || $0.label == "Remove " + label }) { return }
            if let node = tree.first(where: { $0.elementType == .button && $0.label.hasPrefix(label) && !$0.frame.isEmpty && $0.frame.minY > 40 && $0.frame.maxY < bottom }) {
                if !node.isSelected { touch(node.frame) }
                return
            }
            scroll(bottom)
        }
        XCTFail("Missing choice: \(label)")
    }
    private func field(_ label: String, _ value: String) {
        for _ in 0..<25 {
            let tree = nodes(); let bottom = contentBottom(tree)
            if let node = tree.first(where: { [.textField, .textView].contains($0.elementType) && ($0.label == label || $0.label.hasPrefix(label + ", ")) && !$0.frame.isEmpty && $0.frame.minY > 40 && $0.frame.maxY < bottom }) {
                let query = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
                let single = app.textFields.matching(query).firstMatch
                let input = single.exists ? single : app.textViews.matching(query).firstMatch
                // Focus the text line, including in tall empty multiline fields.
                touch(CGRect(x: node.frame.minX + 24, y: node.frame.minY + 22, width: 1, height: 1))
                if !app.keyboards.firstMatch.waitForExistence(timeout: 3) { input.tap() }
                XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 3), "The field must have keyboard focus before typing.")
                if let old = node.value as? String, old != "Empty", !old.isEmpty { input.tap(withNumberOfTaps: 3, numberOfTouches: 1) }
                input.typeText(value)
                if label == "Your dog’s name" { capture("keyboard-entry") }
                let done = app.keyboards.buttons["Done"]
                if done.exists { done.tap() }
                else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
                for _ in 0..<20 { if !app.keyboards.firstMatch.exists { break }; Thread.sleep(forTimeInterval: 0.1) }
                // Compose safe-area and review-toolbar geometry settle after UIKit removes the keyboard.
                Thread.sleep(forTimeInterval: 1)
                return
            }
            scroll(bottom)
        }
        XCTFail("Missing field: \(label). \(app.debugDescription)")
    }
    private func waitFor(_ label: String) { XCTAssertTrue(element(label).waitForExistence(timeout: 15), app.debugDescription) }
    private func advance(_ label: String, to heading: String) {
        press(label)
        // UIKit may consume the first tap while closing its text-selection overlay.
        if !element(heading).waitForExistence(timeout: 3) { press(label) }
        waitFor(heading)
    }
    private func capture(_ name: String) { let a = XCTAttachment(screenshot: app.screenshot()); a.name = "ios-add-dog-" + name; a.lifetime = .keepAlways; add(a) }
    private func launch() {
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-add-dog-v1", "-DesignReviewScreen", "dog-switcher"]
        app.launch(); waitFor("Choose a dog")
    }
    private func startAdditionalDog() {
        launch();press("Add another dog")
        if element("A journal for each dog.").waitForExistence(timeout: 3) {
            press("Try Debug Premium preview");waitFor("Choose a dog");press("Add another dog")
        }
    }
    func testFullNewDogSetupResumesAndSavesItsOwnProfile() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        let name = "Luna " + String(Int(Date().timeIntervalSince1970) % 100000)
        startAdditionalDog()
        for _ in 0..<17 { if element("Who’s your dog?").exists { break }; press("Back") }
        waitFor("Who’s your dog?")
        let initialName = app.textFields["Your dog’s name"].exists ? app.textFields["Your dog’s name"] : app.textViews["Your dog’s name"]
        XCTAssertFalse(initialName.value as? String == "Bruno")
        capture("fresh-profile")
        field("Your dog’s name",name)
        XCTAssertEqual(initialName.value as? String, name)
        press("Continue")
        waitFor("What chapter are they in?"); press("Puppy")
        waitFor("How old is \(name)?"); field("Years","1"); field("Months","2"); press("Continue")
        waitFor("Their breed. Or their mix."); choose("Beagle"); press("Continue")
        waitFor("A little more about them."); press("Female"); press("Continue")
        waitFor("Their size, in your words."); press("Small"); field("Recorded weight","9.5"); press("Continue")
        waitFor("How new is dog care?"); press("Some experience")
        waitFor("What would help most?"); choose("Keep their memories"); press("Continue")
        waitFor("How does your day go?"); choose("Every day is different"); press("Continue")
        waitFor("What are you curious about?"); choose("Training & play"); press("Continue")
        waitFor("What’s your dog like?"); choose("Curious"); press("Continue")
        waitFor("What do they enjoy?"); choose("Sniffing walks"); press("Continue")
        waitFor("What’s on their menu?"); choose("Wet food"); field("Known allergies or sensitivities","New dog sensitivity note"); advance("Continue", to: "The things only you know.")
        waitFor("The things only you know."); field("Known conditions","Caregiver observation"); field("Medications or care instructions","Existing vet instructions"); field("Anything else to know?","Prefers a quiet doorway")
        press("Finish later"); waitFor("Choose a dog"); XCTAssertFalse(element(name).exists); capture("paused-without-new-dog")
        app.terminate(); startAdditionalDog(); waitFor("The things only you know.")
        XCTAssertEqual(app.textViews["Known conditions"].value as? String,"Caregiver observation")
        capture("resumed-notes"); press("Continue")
        waitFor("A little nudge?"); press("Choose access")
        waitFor("A nudge when it helps."); waitFor("Off · logging still works."); capture("optional-access")
        press("Review dog details"); waitFor("Does this sound like \(name)?"); capture("profile-review")
        press("Edit name"); waitFor("Who’s your dog?"); press("Continue"); waitFor("Does this sound like \(name)?")
        press("Add \(name)")
        capture("after-confirmation")
        XCTAssertTrue(element("Ask about \(name)").waitForExistence(timeout: 15), app.debugDescription)
        capture("new-dog-home"); press("Profile"); press("Dog profile"); waitFor("\(name)’s profile."); capture("saved-profile")
        press("Switch or add dog"); waitFor("Choose a dog"); waitFor("Bruno"); waitFor(name); capture("both-dogs")
    }
    func testSavedAdditionalDogCanOpenHomeAfterRelaunch() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-add-dog-v1", "-DesignReviewScreen", "next-home"]
        app.launch()
        XCTAssertTrue(app.buttons["Home"].waitForExistence(timeout: 15), app.debugDescription)
        capture("saved-home-after-relaunch")
        XCTAssertTrue(element("Ask about Luna ").exists, app.debugDescription)
        press("Profile"); press("Dog profile")
        XCTAssertTrue(element("Luna ").waitForExistence(timeout: 10), app.debugDescription)
        capture("saved-profile-after-relaunch")
        press("Switch or add dog"); waitFor("Choose a dog"); waitFor("Bruno"); capture("switcher-after-relaunch")
    }

}

final class ProfileTabReviewJourneys: XCTestCase {
    func testProfileMenuAndSelectedTabStayTogether() throws {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
        for theme in ["Light", "Dark"] { for reduced in [false, true] {
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-add-dog-v1", "-DesignReviewScreen", "next-home", "-barklog_preference_v1_board_review_adddog_v1_theme", theme,
            "-barklog_preference_v1_board_review_adddog_v1_reduce_motion", reduced ? "true" : "false"]
        app.launch()
        XCTAssertTrue(app.buttons["Home"].waitForExistence(timeout: 15))
        for origin in (reduced ? ["Home"] : ["Home", "Timeline", "Insights"]) {
            if origin != "Home" { app.buttons[origin].tap(); Thread.sleep(forTimeInterval: 1) }
            let dockBounds = app.buttons["Profile"].frame
            app.buttons["Profile"].tap()
            let selected = NSPredicate(format: "selected == true")
            expectation(for: selected, evaluatedWith: app.buttons["Profile"])
            waitForExpectations(timeout: 10)
            Thread.sleep(forTimeInterval: 0.8)
            XCTAssertEqual(app.buttons["Profile"].frame, dockBounds, "Profile keeps the same dock while opening its menu")
            XCTAssertFalse(app.buttons["Home"].isSelected)
            XCTAssertTrue(app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Your account.")).firstMatch.exists)
            let shot = XCTAttachment(screenshot: app.screenshot())
            shot.name = "ios-" + theme.lowercased() + (reduced ? "-reduced" : "-motion") + "-profile-from-" + origin.lowercased(); shot.lifetime = .keepAlways; add(shot)
            app.buttons["Home"].tap(); Thread.sleep(forTimeInterval: 1)
            XCTAssertTrue(app.buttons["Home"].isSelected)
            XCTAssertFalse(app.buttons["Profile"].isSelected)
        } }
        app.terminate()
        }
    }
}

final class PremiumSafetyJourneys: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.draco.apps.bark.log")
    private func launch(_ screen: String, _ theme: String = "Light") {
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-premium-safety-v1", "-DesignReviewScreen", screen,
            "-barklog_preference_v1_board_review_premiumsafety_v1_theme", theme,
            "-barklog_preference_v1_board_review_premiumsafety_v1_emergency-country", "US"]
        app.launch(); Thread.sleep(forTimeInterval: 1)
    }
    private func element(_ label: String) -> XCUIElement {
        let matches = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", label))
        let visible = matches.allElementsBoundByIndex.filter { $0.exists && !$0.frame.isEmpty && $0.isHittable }
        return (label == "Continue with free journal" ? visible.last : visible.first) ?? matches.firstMatch
    }
    private func visible(_ label: String) -> XCUIElement {
        for _ in 0..<16 {
            let e = element(label)
            let marker = app.staticTexts["Native board screen"]
            let bottom = label == "Close profile" ? app.frame.height - 25 : (marker.exists ? marker.frame.minY - 48 : app.frame.height - 25)
            if e.exists && e.frame.height > 0 && e.frame.minY > 40 && e.frame.maxY < bottom { return e }
            let scroll = app.scrollViews.firstMatch
            var dragBottom = min(bottom - 25, scroll.exists ? scroll.frame.maxY - 15 : bottom - 25)
            let freeButtons = app.buttons.matching(NSPredicate(format: "label == %@", "Continue with free journal")).allElementsBoundByIndex.filter { $0.frame.minY > app.frame.height / 2 }
            if let fixedFree = freeButtons.last { dragBottom = min(dragBottom, fixedFree.frame.minY - 40) }
            let x = app.frame.width / 2
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: dragBottom)).press(forDuration: 0.02, thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: 190)), withVelocity: .slow, thenHoldForDuration: 0.2)
            Thread.sleep(forTimeInterval: 0.3)
        }
        shot("ios-missing-control");XCTFail("Missing visible element: \(label). \(app.debugDescription)"); return element(label)
    }
    private func press(_ label: String) { let e = visible(label);app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: e.frame.midX, dy: e.frame.midY)).tap();Thread.sleep(forTimeInterval: 1) }
    private func shot(_ name: String) { let a = XCTAttachment(screenshot: app.screenshot());a.name = name;a.lifetime = .keepAlways;add(a) }
    func testPricingAndEmergencyRemainHonestWithoutStoreSetup() {
        continueAfterFailure = false
        // This new fixture starts free and never contacts Firebase, AI or RevenueCat.
        for theme in ["Light", "Dark"] {
            launch("next-paywall", theme)
            XCTAssertTrue(visible("Weekly").exists);XCTAssertTrue(visible("Monthly").exists);XCTAssertTrue(visible("Yearly").exists)
            shot("ios-" + theme.lowercased() + "-pricing")
            XCTAssertTrue(visible("Store setup pending · no payment starts here.").exists)
            launch("triage", theme);press("Possible poisoning");XCTAssertTrue(visible("Emergency card").exists)
            shot("ios-" + theme.lowercased() + "-free-emergency")
            XCTAssertTrue(visible("Animal poison services").exists);XCTAssertTrue(visible("Call (888) 426-4435").exists)
            shot("ios-" + theme.lowercased() + "-animal-services")
            launch("next-train-dog", theme);XCTAssertTrue(visible("Train your dog").exists);shot("ios-" + theme.lowercased() + "-training-coming-soon")
            launch("next-nearby-vet", theme);XCTAssertTrue(visible("See Premium").exists);shot("ios-" + theme.lowercased() + "-nearby-gate")
        }
        app.terminate()
    }
    func testNewNotebookPlansAndFreeExit() {
        continueAfterFailure = false
        for theme in ["Light", "Dark"] {
            launch("next-plan", theme);XCTAssertTrue(visible("A plan for").exists);shot("ios-" + theme.lowercased() + "-new-plan")
            press("Review Bruno’s full profile");XCTAssertTrue(visible("Close profile").exists);shot("ios-" + theme.lowercased() + "-new-plan-profile");press("Close profile")
            launch("next-paywall", theme);XCTAssertTrue(element("Say hello to the notebook puppy").waitForExistence(timeout: 10));XCTAssertTrue(visible("Monthly").exists);shot("ios-" + theme.lowercased() + "-new-paywall")
            press("Yearly");press("Weekly");press("Monthly")
            XCTAssertFalse(visible("Continue with monthly").isEnabled)
            XCTAssertTrue(visible("Pet food scanner").exists);XCTAssertTrue(visible("Planned feature · not available yet.").exists);shot("ios-" + theme.lowercased() + "-new-coming-soon")
            press("Restore");XCTAssertTrue(visible("Restore a purchase.").exists);XCTAssertFalse(visible("Restore purchases").isEnabled)
            launch("next-paywall", theme)
            press("Continue with free journal");XCTAssertFalse(element("Continue with monthly").exists)
            launch("next-manage-plan", theme);XCTAssertTrue(visible("Your BarkLog.").exists);shot("ios-" + theme.lowercased() + "-new-manage-plan")
            press("Explore Premium");XCTAssertTrue(visible("Monthly").exists)
        }
        app.terminate()
    }
    func testNewPlanMotionAndReducedMotionFrames() {
        continueAfterFailure = false
        launch("next-plan", "Light")
        element("¼×").tap();Thread.sleep(forTimeInterval: 0.2)
        element("Replay").tap()
        let started = Date()
        for (offset, name) in [(0.62, "25"), (1.24, "50"), (1.86, "75")] {
            Thread.sleep(forTimeInterval: max(0, offset - Date().timeIntervalSince(started)))
            shot("ios-plan-entry-" + name)
        }
        Thread.sleep(forTimeInterval: 4.5);shot("ios-plan-entry-final")
        for theme in ["Light", "Dark"] {
            app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "park-premium-safety-v1", "-DesignReviewScreen", "next-paywall",
                "-barklog_preference_v1_board_review_premiumsafety_v1_theme", theme,
                "-barklog_preference_v1_board_review_premiumsafety_v1_reduce_motion", "true"]
            app.launch();Thread.sleep(forTimeInterval: 1)
            XCTAssertTrue(visible("Monthly").exists)
            XCTAssertFalse(element("Say hello to the notebook puppy").exists)
            press("Yearly");XCTAssertTrue(visible("Continue with yearly").exists)
            shot("ios-" + theme.lowercased() + "-reduced-paywall")
        }
        app.terminate()
    }
    func testPremiumSafetyConsentAndManualVetSearch() {
        continueAfterFailure = false
        launch("next-paywall", "Dark");press("Try Debug Premium preview")
        launch("first-aid", "Dark")
        if element("Review AI & your records").exists {
            press("Review AI & your records");press("I agree to online AI processing");press("Enable BarkLog AI")
        }
        press("Ask BarkLog AI");XCTAssertTrue(visible("DESIGN PREVIEW").exists);shot("ios-dark-safety-preview")
        launch("next-nearby-vet", "Dark")
        _ = visible("City and country")
        let query = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", "City and country", "City and country, ")
        let single = app.textFields.matching(query).firstMatch
        let input = single.exists ? single : app.textViews.matching(query).firstMatch
        XCTAssertTrue(input.exists);input.tap();input.typeText("London, UK")
        if app.keyboards.buttons["Done"].exists { app.keyboards.buttons["Done"].tap() }
        else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
        Thread.sleep(forTimeInterval: 1)
        // The search URL is tested separately; avoid opening an external service here.
        XCTAssertTrue(visible("Find clinics in Maps").isEnabled);shot("ios-dark-nearby-manual-city")
        launch("next-manage-plan", "Dark");press("End Debug preview")
        app.terminate()
    }

}

/// Soft Paws only: separate app container and explicit synthetic SQLite fixture.
final class SoftPawsCoreJourneys: XCTestCase {
    private var app: XCUIApplication!
    private let fixturePreference = "-barklog_preference_v1_board_review_softpawsday_v1_"
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
    }
    private func launch(theme: String = "Light", reduced: Bool = true) {
        if app.state != .notRunning { app.terminate() }
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", "home",
            fixturePreference + "theme", theme, fixturePreference + "reduce_motion", reduced ? "true" : "false"]
        app.launch()
        XCTAssertTrue(item("A quick check-in").waitForExistence(timeout: 25))
    }
    private func item(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch
    }
    private func press(_ label: String) {
        let fixed = ["Today", "Journal", "Care", "Memories", "You", "Close", "Settings", "Keep this check-in", "Keep this note", "Save changes", "Edit record", "Delete record", "Keep record", "Delete permanently", "Back to today", "View record"]
        for attempt in 0..<15 {
            // Resolve afresh: radio labels and newly materialised LazyColumn rows
            // are not necessarily Buttons in the iOS accessibility tree.
            let exact = item(label)
            let button = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", label)).firstMatch
            let target = exact.exists ? exact : button
            let footer = ["Save changes", "Keep this note", "Keep this check-in", "Keep record", "Edit record", "Today"].map { app.buttons[$0] }.filter { $0.exists && $0.isHittable }.map { $0.frame.minY }.min() ?? app.frame.maxY
            let bottom = min(app.frame.maxY - 14, footer - 12)
            if target.exists && target.isHittable && (fixed.contains(label) || target.frame.midY < bottom) {
                target.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap(); return
            }
            if attempt < 3 { Thread.sleep(forTimeInterval: 0.2); continue }
            let start = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: app.frame.maxX - 8, dy: max(170, bottom - 24)))
            let end = app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: app.frame.maxX - 8, dy: max(70, bottom - 250)))
            start.press(forDuration: 0.02, thenDragTo: end)
        }
        XCTFail("Control not reachable: \(label): \(app.debugDescription)")
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot())
        image.name = name; image.lifetime = .keepAlways; add(image)
    }
    func testLitterSaveReopensAndFiveTabsRemainSelected() throws {
        launch()
        sleep(4); capture("ios-light-home")
        press("Litter")
        XCTAssertTrue(item("A little litter check.").waitForExistence(timeout: 12))
        capture("ios-light-log-litter")
        press("Urine observed")
        press("Keep this check-in")
        XCTAssertTrue(item("A small thing, kept.").waitForExistence(timeout: 12))
        capture("ios-light-saved")
        press("Back to today")
        app.terminate(); app.launch()
        XCTAssertTrue(item("A quick check-in").waitForExistence(timeout: 20))
        capture("ios-light-reopened")
        for (tab, heading) in [("Journal", "The little things, in order."), ("Care", "Care, in one place."), ("Memories", "Ordinary, lovely days."), ("You", "A place for both of you.")] {
            press(tab)
            XCTAssertTrue(item(heading).waitForExistence(timeout: 12))
            XCTAssertTrue(app.buttons[tab].isSelected)
            capture("ios-light-\(tab.lowercased())")
        }
        press("Today")
        XCTAssertTrue(item("A quick check-in").waitForExistence(timeout: 12))
        capture("ios-returned-home")
    }
    func testAccessibilityWithLiveCatAndDarkPalette() throws {
        launch(reduced: false)
        press("Say hello to Miso")
        Thread.sleep(forTimeInterval: 0.2); capture("ios-cat-motion-200")
        Thread.sleep(forTimeInterval: 0.7); capture("ios-cat-motion-900")
        Thread.sleep(forTimeInterval: 0.9); capture("ios-cat-motion-1800")
        for _ in 0..<2 {
            for (tab, heading) in [("Journal", "The little things, in order."), ("Care", "Care, in one place."), ("Memories", "Ordinary, lovely days."), ("You", "A place for both of you.")] {
                press(tab)
                XCTAssertTrue(item(heading).waitForExistence(timeout: 12))
                XCTAssertGreaterThan(app.buttons.count, 0)
            }
            press("Today")
            XCTAssertTrue(item("A quick check-in").waitForExistence(timeout: 12))
        }
        launch(theme: "Dark")
        sleep(2); capture("ios-dark-home")
        press("Care")
        XCTAssertTrue(item("Care, in one place.").waitForExistence(timeout: 12))
        capture("ios-dark-care")
    }
    func testCatKeepsItsIdleAfterGreetingAndTapAndHonoursReducedMotion() throws {
        launch(reduced: false)
        let cat = app.buttons["Say hello to Miso"]
        XCTAssertTrue(cat.waitForExistence(timeout: 15))
        let bounds = cat.frame
        XCTAssertGreaterThan(bounds.width, 80)
        XCTAssertLessThan(bounds.width, app.frame.width)
        func pixels(_ name: String) throws -> [UInt8] {
            let shot = app.screenshot()
            let attachment = XCTAttachment(screenshot: shot)
            attachment.name = name; attachment.lifetime = .keepAlways; add(attachment)
            let image = shot.image
            let source = try XCTUnwrap(image.cgImage)
            let rect = bounds.offsetBy(dx: -app.frame.minX, dy: -app.frame.minY).applying(
                CGAffineTransform(scaleX: CGFloat(source.width) / app.frame.width,
                    y: CGFloat(source.height) / app.frame.height))
            let crop = try XCTUnwrap(source.cropping(to: rect))
            // Normalize the crop: a cropped CGImage may retain its full-frame provider.
            var bytes = [UInt8](repeating: 0, count: crop.width * crop.height * 4)
            try bytes.withUnsafeMutableBytes { buffer in
                let context = try XCTUnwrap(CGContext(data: buffer.baseAddress,
                    width: crop.width, height: crop.height, bitsPerComponent: 8,
                    bytesPerRow: crop.width * 4, space: CGColorSpaceCreateDeviceRGB(),
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue))
                context.draw(crop, in: CGRect(x: 0, y: 0, width: CGFloat(crop.width), height: CGFloat(crop.height)))
            }
            return bytes
        }
        func changes(_ first: [UInt8], _ second: [UInt8]) -> Int {
            XCTAssertEqual(first.count, second.count)
            return zip(first, second).filter { abs(Int($0.0) - Int($0.1)) > 8 }.count
        }
        Thread.sleep(forTimeInterval: 4.5)
        let first = try pixels("ios-idle-4500")
        Thread.sleep(forTimeInterval: 2.1)
        let second = try pixels("ios-idle-6600")
        Thread.sleep(forTimeInterval: 3.1)
        let third = try pixels("ios-idle-9700")
        XCTAssertGreaterThan(changes(first, second), 30, "Cat froze after greeting")
        XCTAssertGreaterThan(changes(second, third), 30, "Cat stopped its ongoing idle")
        cat.tap(); Thread.sleep(forTimeInterval: 0.9)
        XCTAssertGreaterThan(changes(third, try pixels("ios-hello-900")), 30)
        Thread.sleep(forTimeInterval: 3.6)
        let resumed = try pixels("ios-after-tap-4500")
        Thread.sleep(forTimeInterval: 2.2)
        XCTAssertGreaterThan(changes(resumed, try pixels("ios-after-tap-6700")), 30, "Idle did not resume after tap")
        launch(theme: "Dark", reduced: false); Thread.sleep(forTimeInterval: 4.5)
        let dark = try pixels("ios-dark-idle-4500")
        Thread.sleep(forTimeInterval: 2.1)
        XCTAssertGreaterThan(changes(dark, try pixels("ios-dark-idle-6600")), 30, "Dark-theme idle froze")
        launch(reduced: true); Thread.sleep(forTimeInterval: 1.6)
        XCTAssertFalse(app.buttons["Say hello to Miso"].exists)
        let still = try pixels("ios-reduced-1600")
        Thread.sleep(forTimeInterval: 2.2)
        XCTAssertEqual(changes(still, try pixels("ios-reduced-3800")), 0)
        launch(reduced: false)
    }
    func testSavedCatMotionSettingKeepsTheReviewAnimated() throws {
        func savedMotionHome() {
            app.terminate()
            app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1",
                "-DesignReviewScreen", "home", fixturePreference + "theme", "Light"]
            app.launch()
            XCTAssertTrue(item("A quick check-in").waitForExistence(timeout: 25))
        }
        var settingRound = 0
        func toggleSavedMotion() {
            settingRound += 1
            press("Settings")
            let reduce = app.switches["Reduce motion"]
            XCTAssertTrue(reduce.waitForExistence(timeout: 10))
            for _ in 0..<8 {
                let frame = reduce.frame
                if reduce.isHittable && frame.minY > 80 && frame.maxY < app.frame.maxY - 80 {
                    Thread.sleep(forTimeInterval: 0.5)
                    if abs(reduce.frame.midY - frame.midY) < 1 { break }
                }
                let origin = app.coordinate(withNormalizedOffset: .zero)
                let x = app.frame.width * 0.98
                origin.withOffset(CGVector(dx: x, dy: app.frame.height - 100)).press(
                    forDuration: 0.02,
                    thenDragTo: origin.withOffset(CGVector(dx: x, dy: app.frame.height * 0.35)),
                    withVelocity: .slow, thenHoldForDuration: 0.3)
                Thread.sleep(forTimeInterval: 0.5)
            }
            capture("ios-motion-setting-\(settingRound)-before")
            // Compose exposes switch state through traits, not UIKit's numeric value.
            // Let scrolling settle, then tap the observed track in screen coordinates.
            let frame = reduce.frame
            XCTAssertTrue(reduce.isHittable && frame.minY > 80 && frame.maxY < app.frame.maxY - 80)
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: frame.midX, dy: frame.midY)).tap()
            Thread.sleep(forTimeInterval: 0.6)
            capture("ios-motion-setting-\(settingRound)-after")
        }
        launch(reduced: false)
        toggleSavedMotion(); savedMotionHome()
        Thread.sleep(forTimeInterval: 0.8)
        XCTAssertFalse(app.buttons["Say hello to Miso"].exists)
        toggleSavedMotion(); savedMotionHome()
        // No launch-argument motion override: this proves the saved setting and handoff.
        XCTAssertTrue(app.buttons["Say hello to Miso"].waitForExistence(timeout: 15))
    }
    func testDatedJournalEditCancelDeleteAndReopen() throws {
        func title(_ value: String) {
            let editable = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", "Title", "Title, ")
            let label = app.textFields.matching(editable).firstMatch.exists || app.textViews.matching(editable).firstMatch.exists ? "Title" : "Title · optional"
            let query = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
            let single = app.textFields.matching(query).firstMatch
            let input = single.exists ? single : app.textViews.matching(query).firstMatch
            XCTAssertTrue(input.waitForExistence(timeout: 12))
            input.tap()
            XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5))
            let old = input.value as? String ?? ""
            if old != "Empty" && !old.isEmpty {
                input.press(forDuration: 1.1)
                let menu = app.menuItems["Select All"]
                let all = menu.exists ? menu : app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Select All")).firstMatch
                XCTAssertTrue(all.waitForExistence(timeout: 4), "Select the full title before replacing it")
                all.tap()
                input.typeText(XCUIKeyboardKey.delete.rawValue)
                let empty = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@ OR value == %@", "", "Empty"), object: input)
                XCTAssertEqual(XCTWaiter.wait(for: [empty], timeout: 3), .completed)
            }
            input.typeText(value)
            let done = app.keyboards.buttons["Done"]
            if done.exists { done.tap() } else { input.typeText("\n") }
        }
        let note = "Window watching QA \(Int(Date().timeIntervalSince1970))"
        let revised = note + " edited"
        launch()
        press("Note")
        XCTAssertTrue(item("One thing to remember.").waitForExistence(timeout: 12))
        title(note); press("Everyday note"); press("Keep this note")
        XCTAssertTrue(item("A small thing, kept.").waitForExistence(timeout: 12))
        press("View record")
        XCTAssertTrue(item("What you recorded").waitForExistence(timeout: 12)); capture("ios-light-record")
        press("Edit record")
        XCTAssertTrue(item("Keep the context right.").waitForExistence(timeout: 12)); capture("ios-light-edit")
        title(revised); press("Save changes")
        XCTAssertTrue(item(revised).waitForExistence(timeout: 12))
        press("Delete record")
        XCTAssertTrue(item("Delete this record?").waitForExistence(timeout: 12)); capture("ios-light-delete")
        press("Keep record")
        XCTAssertTrue(item("What you recorded").waitForExistence(timeout: 12))
        launch(); press("Journal")
        XCTAssertTrue(item("The little things, in order.").waitForExistence(timeout: 12)); capture("ios-light-journal")
        press("Notes")
        let nineteenth = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "19 October 2026")).firstMatch
        XCTAssertTrue(nineteenth.exists); nineteenth.tap()
        XCTAssertTrue(item("No matching check-ins yet").waitForExistence(timeout: 12)); capture("ios-light-empty-day")
        let twentieth = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "20 October 2026")).firstMatch
        XCTAssertTrue(twentieth.exists); twentieth.tap()
        press(revised); press("Delete record"); press("Delete permanently")
        XCTAssertTrue(item("The little things, in order.").waitForExistence(timeout: 12))
        XCTAssertFalse(item(revised).exists)
        launch(theme: "Dark"); press("Journal"); capture("ios-dark-journal")
        press("Meals"); press("A meal, mostly eaten.")
        XCTAssertTrue(item("What you recorded").waitForExistence(timeout: 12)); capture("ios-dark-record")
        press("Edit record"); capture("ios-dark-edit"); press("Close")
        XCTAssertTrue(item("What you recorded").waitForExistence(timeout: 12))
        press("Delete record"); capture("ios-dark-delete"); press("Keep record")
    }
}

final class SoftPawsHealthJourneys: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
    private let fixturePreference = "-barklog_preference_v1_board_review_softpawsday_v1_"
    private func launch(_ screen: String, _ theme: String = "Light") {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", screen,
            fixturePreference + "theme", theme, fixturePreference + "reduce_motion", "true"]
        app.launch()
        let headings = ["medications": "Your vet’s plan, remembered.", "med-form": "Keep the prescribed details.",
            "med-detail": "Your saved instructions", "med-history": "Care history, kept.",
            "vaccinations": "Dates worth keeping close.", "vaccine-form": "A vaccination, recorded."]
        if let heading = headings[screen] { XCTAssertTrue(item(heading).waitForExistence(timeout: 25)) }
        Thread.sleep(forTimeInterval: 0.5)
    }
    private func item(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")).firstMatch
    }
    private func reveal(_ label: String) -> XCUIElement {
        for _ in 0..<18 {
            let value = item(label)
            let footers = ["Keep plan", "Keep record", "Record as given", "Add a prescribed plan", "Add a record", "Keep plan active", "Archive plan"].map { app.buttons[$0] }.filter { $0.exists && $0.isHittable && $0.frame.minY > 200 }
            let bottom = footers.map { $0.frame.minY - 14 }.min() ?? app.frame.maxY - 22
            if value.exists && value.isHittable && value.frame.minY > 30 && (footers.contains(where: { $0.label == label }) || value.frame.maxY < bottom) {
                Thread.sleep(forTimeInterval: 0.4); return item(label)
            }
            let x = app.frame.width - 9
            let upwards = label == "Back" || (value.exists && value.frame.maxY < 40)
            let start = upwards ? CGFloat(150) : max(220, bottom - 25)
            let end = upwards ? min(bottom - 24, CGFloat(420)) : max(90, start - 240)
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: start)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: end)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        capture("ios-health-missing"); XCTFail("Missing control \(label): \(app.debugDescription)"); return item(label)
    }
    private func press(_ label: String) {
        let value = reveal(label)
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        Thread.sleep(forTimeInterval: 0.6)
    }
    private func fill(_ label: String, _ text: String) {
        let value = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let input = single.exists ? single : app.textViews.matching(predicate).firstMatch
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3)).tap()
        if !app.keyboards.firstMatch.waitForExistence(timeout: 3) { input.tap() }
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 4))
        if let old = input.value as? String, old != "Empty", !old.isEmpty {
            input.press(forDuration: 1.1)
            let all = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Select All")).firstMatch
            XCTAssertTrue(all.waitForExistence(timeout: 4), "Select the full saved value before replacing it")
            all.tap(); input.typeText(XCUIKeyboardKey.delete.rawValue)
            let empty = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@ OR value == %@", "", "Empty"), object: input)
            XCTAssertEqual(XCTWaiter.wait(for: [empty], timeout: 3), .completed)
        }
        input.typeText(text)
        let entered = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@", text), object: input)
        XCTAssertEqual(XCTWaiter.wait(for: [entered], timeout: 3), .completed)
        let done = app.keyboards.buttons["Done"]
        if done.exists { done.tap() }
        else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
        Thread.sleep(forTimeInterval: 1)
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func openDocumentPicker() {
        for _ in 0..<16 {
            let bottom = app.buttons["Keep record"].exists ? app.buttons["Keep record"].frame.minY - 14 : app.frame.maxY - 25
            for label in ["Change document", "Attach document"] {
                let action = item(label)
                if action.exists && action.isHittable && action.frame.minY > 35 && action.frame.maxY < bottom { press(label); return }
            }
            let x = app.frame.width - 9
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: bottom - 25)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: max(90, bottom - 265))),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        XCTFail("No visible document picker action: \(app.debugDescription)")
    }
    func testPrescribedCareAndVaccinationUseTheLocalJournal() throws {
        continueAfterFailure = false
        let stamp = String(Int(Date().timeIntervalSince1970))
        let name = "Clinic plan QA " + stamp
        let instructions = "Copy of the clinic instructions for QA."
        let vaccine = "Clinic record QA " + stamp
        launch("medications")
        XCTAssertTrue(item("Your vet’s plan, remembered.").waitForExistence(timeout: 20)); capture("ios-light-medications")
        press("Add a prescribed plan"); XCTAssertTrue(item("Keep the prescribed details.").waitForExistence(timeout: 10)); capture("ios-light-med-form")
        fill("Medication name", name); fill("Prescribed instructions", instructions)
        press("Back"); press("Keep draft")
        launch("med-form"); XCTAssertTrue(item("Medication name").waitForExistence(timeout: 10))
        let medicationInput = app.textViews.matching(NSPredicate(format: "label BEGINSWITH %@", "Medication name")).firstMatch
        XCTAssertTrue(medicationInput.value.debugDescription.contains(name))
        press("Keep plan"); XCTAssertTrue(item("Your saved instructions").waitForExistence(timeout: 12)); capture("ios-light-med-detail")
        XCTAssertTrue(item(instructions).exists)
        press("Record as given"); XCTAssertTrue(item("Recorded as given.").waitForExistence(timeout: 12)); capture("ios-health-given")
        press("Back to plan"); press("Archive this plan"); press("Keep plan active")
        XCTAssertTrue(item("Your saved instructions").waitForExistence(timeout: 10))
        press("Archive this plan"); press("Archive plan")
        XCTAssertTrue(item("Care history, kept.").waitForExistence(timeout: 12)); capture("ios-light-med-history")
        launch("med-history"); press(name); XCTAssertTrue(reveal("Archived · reminders off").exists)
        launch("vaccinations"); XCTAssertTrue(item("Dates worth keeping close.").waitForExistence(timeout: 12)); capture("ios-light-vaccinations")
        press("Add a record"); XCTAssertTrue(item("A vaccination, recorded.").waitForExistence(timeout: 12)); capture("ios-light-vaccine-form")
        fill("Name on the record", vaccine); fill("Clinic or vet · optional", "Owned QA clinic")
        press("Attach document")
        let cancel = app.buttons["Cancel"].firstMatch
        XCTAssertTrue(cancel.waitForExistence(timeout: 12)); capture("ios-health-native-document-picker"); cancel.tap()
        XCTAssertTrue(reveal("No document added. Your entries are still here.").exists)
        press("Keep record"); XCTAssertTrue(item("Dates worth keeping close.").waitForExistence(timeout: 12))
        launch("vaccinations"); press(vaccine)
        XCTAssertTrue(item("A vaccination, recorded.").waitForExistence(timeout: 10)); capture("ios-health-record-reopened")
        for screen in ["medications", "med-form", "med-detail", "med-history", "vaccinations", "vaccine-form"] {
            launch(screen, "Dark"); Thread.sleep(forTimeInterval: 1); capture("ios-dark-" + screen)
        }
        app.terminate()
    }

    func testCareScreensAtRestBothThemes() {
        continueAfterFailure = false
        for theme in ["Light", "Dark"] {
            for screen in ["medications", "med-form", "med-detail", "med-history", "vaccinations", "vaccine-form"] {
                launch(screen, theme); capture("ios-rest-" + theme.lowercased() + "-" + screen)
            }
        }
        app.terminate()
    }
    func testChosenReminderSavesBeforeNotificationPermission() {
        continueAfterFailure = false
        launch("med-form")
        fill("Medication name", "Chosen reminder QA " + String(Int(Date().timeIntervalSince1970)))
        fill("Prescribed instructions", "Copy of the clinic instructions for QA.")
        fill("Start date · YYYY-MM-DD", "2026-11-01"); press("Remind me at a time I choose")
        fill("Reminder time · HH:mm", "23:59"); press("Keep plan")
        XCTAssertTrue(item("Your saved instructions").waitForExistence(timeout: 12))
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        XCTAssertFalse(springboard.alerts.firstMatch.exists, "Saving the plan must not request permission.")
        if item("Enable notifications").exists {
            press("Enable notifications")
            let deny = springboard.buttons.matching(NSPredicate(format: "label == %@ OR label == %@", "Don’t Allow", "Don't Allow")).firstMatch
            if deny.waitForExistence(timeout: 3) { deny.tap() }
        }
        capture("ios-reminder-after-commit")
        press("Archive this plan"); press("Archive plan")
        XCTAssertTrue(item("Care history, kept.").waitForExistence(timeout: 12))
        app.terminate()
    }

    // A separate native input app supplies files through the system Files UI.
    // No product file, picker result or care repository is injected.
    private func prepareOwnedFiles() {
        let fixture = XCUIApplication(bundleIdentifier: "com.draco.qa.softpaws.files")
        fixture.launch()
        XCTAssertTrue(fixture.staticTexts["Sample files ready"].waitForExistence(timeout: 15))
        fixture.terminate()
    }
    private func chooseNativeFile(_ prefix: String) {
        func candidate() -> XCUIElement { app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch }
        if !candidate().waitForExistence(timeout: 5) {
            let browse = app.buttons["Browse"].firstMatch
            if browse.exists { browse.tap() }
            if !item("SoftPaws QA Files").waitForExistence(timeout: 3) {
                let local = item("On My iPhone")
                if local.waitForExistence(timeout: 3) { local.tap() }
            }
            let folder = item("SoftPaws QA Files")
            if folder.waitForExistence(timeout: 5) { folder.tap() }
        }
        let file = candidate()
        XCTAssertTrue(file.waitForExistence(timeout: 12), app.debugDescription)
        capture("ios-native-file-choice"); file.tap()
        XCTAssertTrue(reveal("Open or share document").exists)
    }
    func testVaccinationPdfImportDraftAndNativeHandoff() {
        continueAfterFailure = false
        prepareOwnedFiles()
        let name = "Native document QA 20261021"
        launch("vaccinations")
        let editing = item(name).exists
        if editing { press(name) } else { press("Add a record"); fill("Name on the record", name) }
        openDocumentPicker()
        chooseNativeFile("soft-paws-vaccination-qa")
        press("Back"); press("Keep draft")
        launch(editing ? "vaccinations" : "vaccine-form")
        if editing { press(name) }
        XCTAssertTrue(reveal("Open or share document").exists)
        capture("ios-pdf-retained-draft"); press("Keep record")
        XCTAssertTrue(item("Dates worth keeping close.").waitForExistence(timeout: 12))
        launch("vaccinations"); press(name)
        XCTAssertTrue(reveal("Open or share document").exists); capture("ios-pdf-record-reopened")
        press("Open or share document")
        XCTAssertTrue(app.otherElements["ActivityListView"].waitForExistence(timeout: 8), app.debugDescription)
        XCTAssertTrue(app.cells["Copy"].exists || app.cells["Save to Files"].exists, app.debugDescription)
        capture("ios-pdf-native-handoff")
        let close = app.buttons["Close"].firstMatch
        if close.exists { close.tap() }
        else {
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.4)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.95)), withVelocity: .slow, thenHoldForDuration: 0.3)
        }
        XCTAssertTrue(reveal("Open or share document").isEnabled)
        app.terminate()
    }
    func testVaccinationImageReplacesPdfThroughNativeFiles() {
        continueAfterFailure = false
        prepareOwnedFiles()
        launch("vaccinations"); press("Native document QA 20261021")
        press("Change document"); chooseNativeFile("soft-paws-vaccination-image-qa")
        capture("ios-image-document-draft"); press("Keep record")
        XCTAssertTrue(item("Dates worth keeping close.").waitForExistence(timeout: 12))
        launch("vaccinations"); press("Native document QA 20261021")
        XCTAssertTrue(reveal("Open or share document").exists); capture("ios-image-record-reopened")
        app.terminate()
    }
    // Host setup temporarily moves only this test record's owned private image.
    func testMissingVaccinationDocumentKeepsDetailsReadable() {
        continueAfterFailure = false
        launch("vaccinations"); press("Native document QA 20261021")
        XCTAssertTrue(reveal("The document file is missing. The vaccination details stay saved.").exists)
        XCTAssertFalse(item("Open or share document").isEnabled)
        capture("ios-missing-document-record")
        press("Remove document"); press("Keep record")
        XCTAssertTrue(item("Dates worth keeping close.").waitForExistence(timeout: 12))
        launch("vaccinations"); press("Native document QA 20261021")
        XCTAssertFalse(item("Open or share document").exists)
        capture("ios-document-reference-removed")
        app.terminate()
    }
}

final class SoftPawsPlanningJourneys: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
    private let fixturePreference = "-barklog_preference_v1_board_review_softpawsday_v1_"
    private func launch(_ screen: String, _ theme: String = "Light") {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", screen,
            fixturePreference + "theme", theme, fixturePreference + "reduce_motion", "true"]
        app.launch()
        let headings = ["calendar": "The care you planned.", "task-form": "Make room for a little care.",
            "task-detail": "Your plan", "med-form": "Keep the prescribed details.", "vaccine-form": "A vaccination, recorded."]
        if let heading = headings[screen] { XCTAssertTrue(item(heading).waitForExistence(timeout: 25)) }
        Thread.sleep(forTimeInterval: 0.5)
    }
    private func item(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")).firstMatch
    }
    private func reveal(_ label: String) -> XCUIElement {
        for _ in 0..<18 {
            let value = item(label)
            let confirmation = item("Remove this task?").exists || item("Mark this occurrence incomplete?").exists || item("Keep this draft?").exists
            let footers = confirmation ? [] : ["Keep task", "Plan a task", "Mark complete", "Mark incomplete", "Remove task", "Keep plan", "Keep record"].map { app.buttons[$0] }.filter { $0.exists && $0.isHittable && $0.frame.minY > 200 }
            let bottom = footers.map { $0.frame.minY - 14 }.min() ?? app.frame.maxY - 22
            if value.exists && value.isHittable && value.frame.minY > 30 && (footers.contains(where: { $0.label == label }) || value.frame.maxY < bottom) {
                Thread.sleep(forTimeInterval: 0.4); return item(label)
            }
            let x = app.frame.width - 9
            let back = app.buttons["Back"]
            let headerAbove = ["Dates", "Today", "Choose agenda date"].contains(label) && back.exists && back.frame.maxY < 40
            let upwards = label == "Back" || headerAbove || (value.exists && value.frame.maxY < 40)
            let start = upwards ? CGFloat(150) : max(220, bottom - 25)
            let end = upwards ? min(bottom - 24, CGFloat(420)) : max(90, start - 240)
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: start)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: end)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        capture("ios-planning-missing"); XCTFail("Missing control \(label): \(app.debugDescription)"); return item(label)
    }
    private func press(_ label: String) {
        let value = reveal(label)
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        Thread.sleep(forTimeInterval: 0.6)
    }
    private func fill(_ label: String, _ text: String) {
        let value = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let input = single.exists ? single : app.textViews.matching(predicate).firstMatch
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3)).tap()
        if !app.keyboards.firstMatch.waitForExistence(timeout: 3) { input.tap() }
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 4))
        if let old = input.value as? String, old != "Empty", !old.isEmpty {
            input.press(forDuration: 1.1)
            let all = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Select All")).firstMatch
            XCTAssertTrue(all.waitForExistence(timeout: 4), "Select the full saved value before replacing it")
            all.tap(); input.typeText(XCUIKeyboardKey.delete.rawValue)
            let empty = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@ OR value == %@", "", "Empty"), object: input)
            XCTAssertEqual(XCTWaiter.wait(for: [empty], timeout: 3), .completed)
        }
        input.typeText(text)
        let entered = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@", text), object: input)
        XCTAssertEqual(XCTWaiter.wait(for: [entered], timeout: 3), .completed)
        let done = app.keyboards.buttons["Done"]
        if done.exists { done.tap() }
        else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
        Thread.sleep(forTimeInterval: 1)
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func value(_ label: String) -> String {
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let field = single.exists ? single : app.textViews.matching(predicate).firstMatch
        XCTAssertTrue(field.exists, app.debugDescription)
        return field.value as? String ?? ""
    }
    private func chooseOctober21() {
        let calendar = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@ OR label CONTAINS %@ OR label CONTAINS %@", "21", "October 21", "21 October")).firstMatch
        XCTAssertTrue(calendar.waitForExistence(timeout: 5), app.debugDescription)
        calendar.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    }
    private func nativeDone(_ label: String) {
        let button = app.buttons[label]
        XCTAssertTrue(button.waitForExistence(timeout: 5), app.debugDescription)
        button.tap(); Thread.sleep(forTimeInterval: 0.7)
    }

    func testNativeTaskPickersCancelCommitAndKeepDraft() throws {
        continueAfterFailure = false
        let name = "Native picker QA \(Int(Date().timeIntervalSince1970))"
        launch("task-form")
        fill("Task", name); fill("Date · YYYY-MM-DD", "2026-10-20"); fill("Time · HH:mm", "18:00")
        press("Choose date for Date · YYYY-MM-DD")
        XCTAssertTrue(app.buttons["Cancel"].waitForExistence(timeout: 5), app.debugDescription)
        capture("ios-native-date-picker")
        print("NATIVE_CALENDAR_LABELS", app.buttons.allElementsBoundByIndex.map { $0.label })
        chooseOctober21(); nativeDone("Cancel")
        XCTAssertEqual(value("Date · YYYY-MM-DD"), "2026-10-20")
        press("Choose date for Date · YYYY-MM-DD"); chooseOctober21(); nativeDone("Done")
        XCTAssertEqual(value("Date · YYYY-MM-DD"), "2026-10-21")
        press("Choose time for Time · HH:mm")
        XCTAssertTrue(app.pickerWheels.firstMatch.waitForExistence(timeout: 5), app.debugDescription)
        capture("ios-native-time-picker")
        print("NATIVE_TIME_WHEELS", app.pickerWheels.allElementsBoundByIndex.map { $0.value as? String ?? "" })
        app.pickerWheels.element(boundBy: 1).adjust(toPickerWheelValue: "15")
        nativeDone("Cancel"); XCTAssertEqual(value("Time · HH:mm"), "18:00")
        press("Choose time for Time · HH:mm")
        XCTAssertTrue(app.pickerWheels.firstMatch.waitForExistence(timeout: 5))
        app.pickerWheels.element(boundBy: 1).adjust(toPickerWheelValue: "15")
        nativeDone("Done"); XCTAssertEqual(value("Time · HH:mm"), "18:15")
        press("Back"); press("Keep draft"); launch("task-form")
        XCTAssertEqual(value("Date · YYYY-MM-DD"), "2026-10-21")
        XCTAssertEqual(value("Time · HH:mm"), "18:15")
        capture("ios-task-retained-picker-values")
        press("Keep task"); XCTAssertTrue(item("Your plan").waitForExistence(timeout: 15), app.debugDescription)
        capture("ios-picker-task-committed")
    }

    private func agendaDate(_ date: String) {
        if !item("Enter a date").exists && !item("Agenda date · YYYY-MM-DD").exists { press("Dates") }
        if !item("Agenda date · YYYY-MM-DD").exists { press("Enter a date") }
        fill("Agenda date · YYYY-MM-DD", date); press("Show this date")
        if item("Hide date entry").exists { press("Dates") }
    }

    private func requestChosenReminder() {
        for _ in 0..<16 {
            let bottom = app.buttons["Mark incomplete"].exists ? app.buttons["Mark incomplete"].frame.minY - 14 : app.frame.maxY - 24
            for title in ["Enable notifications", "Refresh chosen reminder"] {
                let action = item(title)
                if action.exists && action.isHittable && action.frame.minY > 35 && action.frame.maxY < bottom { press(title); return }
            }
            let x = app.frame.width - 9
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: bottom - 25)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: max(90, bottom - 265))),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        XCTFail("No visible reminder action: \(app.debugDescription)")
    }

    func testTaskCompletionUndoEditAndRemovalKeepOtherOccurrences() throws {
        continueAfterFailure = false
        let stamp = Int(Date().timeIntervalSince1970)
        let name = "Native care task QA \(stamp)"
        let revised = "Revised native task QA \(stamp)"
        print("PLANNING_TASK_NAME", name)
        launch("calendar"); press("Plan a task")
        fill("Task", name); fill("Date · YYYY-MM-DD", "2026-10-21"); fill("Time · HH:mm", "18:00")
        press("Every day"); press("Keep task")
        XCTAssertTrue(item("Your plan").waitForExistence(timeout: 15), app.debugDescription)
        press("Mark complete")
        XCTAssertTrue(item("The care you planned.").waitForExistence(timeout: 15))
        press("View task for " + name); press("Mark incomplete"); press("Keep completion")
        XCTAssertTrue(item("Recorded as complete").exists)
        press("Mark incomplete"); press("Undo completion")
        XCTAssertTrue(item("The care you planned.").waitForExistence(timeout: 15))
        press("View task for " + name)
        XCTAssertFalse(item("Recorded as complete").exists)
        press("Mark complete")
        agendaDate("2026-10-22"); press("View task for " + name); press("Mark complete")
        press("View task for " + name); press("Reschedule or edit")
        fill("Task", revised); fill("Time · HH:mm", "19:00")
        if !item("Your note · optional").exists { press("Category and notes · optional") }
        fill("Your note · optional", "A caregiver planning note")
        press("Remind me for this task"); press("Keep task")
        XCTAssertTrue(item("Your plan").waitForExistence(timeout: 15))
        let when = app.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", "22 October 2026")).firstMatch
        XCTAssertTrue(when.waitForExistence(timeout: 5), app.debugDescription)
        requestChosenReminder()
        let alert = app.alerts.firstMatch
        if alert.waitForExistence(timeout: 2) {
            let deny = alert.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@ AND label !=[c] %@", "Allow", "Allow")).firstMatch
            XCTAssertTrue(deny.exists, app.debugDescription); deny.tap()
        }
        capture("ios-task-reminder-after-commit")
        press("Turn reminder off")
        press("Remove task"); press("Keep task")
        press("Remove task"); capture("ios-remove-planned-task-confirmation"); press("Remove planned task")
        XCTAssertTrue(item("The care you planned.").waitForExistence(timeout: 15))
        XCTAssertFalse(item("View task for " + revised).exists)
        press("Plan a task")
        fill("Task", "Retained native task QA \(stamp)"); fill("Date · YYYY-MM-DD", "2026-10-20"); fill("Time · HH:mm", "18:00")
        press("Does not repeat"); press("Keep task")
        XCTAssertTrue(item("Your plan").waitForExistence(timeout: 15))
        capture("ios-retained-independent-task")
    }

    func testHealthDatePickerCancellationPreservesEnteredDates() throws {
        continueAfterFailure = false
        launch("med-form")
        _ = reveal("Choose date for Start date · YYYY-MM-DD")
        let start = value("Start date · YYYY-MM-DD")
        press("Choose date for Start date · YYYY-MM-DD"); capture("ios-medication-native-date-picker"); nativeDone("Cancel")
        XCTAssertEqual(value("Start date · YYYY-MM-DD"), start)
        launch("vaccine-form")
        let label = "Next date, if your vet provided one · optional"
        _ = reveal("Choose date for " + label)
        let next = value(label)
        print("OPTIONAL_NEXT_DATE_BEFORE_PICKER", next)
        press("Choose date for " + label); capture("ios-optional-vaccination-native-date-picker"); nativeDone("Cancel")
        XCTAssertEqual(value(label), next)
    }

    func testRestingCalendarScreensInBothThemes() throws {
        continueAfterFailure = false
        for theme in ["Light", "Dark"] {
            for screen in ["calendar", "task-form", "task-detail"] {
                if screen == "task-detail" {
                    launch("calendar", theme)
                    let retained = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "View task for Retained native task QA")).firstMatch
                    if retained.exists {
                        press(retained.label.components(separatedBy: ",").first ?? retained.label)
                        XCTAssertTrue(item("Your plan").waitForExistence(timeout: 15))
                    } else { launch(screen, theme) }
                } else { launch(screen, theme) }
                capture("ios-rest-" + theme.lowercased() + "-" + screen)
            }
        }
        launch("task-form", "Dark"); press("Choose date for Date · YYYY-MM-DD")
        capture("ios-dark-native-date-picker"); nativeDone("Cancel")
        press("Choose time for Time · HH:mm")
        capture("ios-dark-native-time-picker"); nativeDone("Cancel")
    }
}

final class SoftPawsSafetyJourneys: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
    private let fixturePreference = "-barklog_preference_v1_board_review_softpawsday_v1_"
    private func launch(_ screen: String, _ theme: String = "Light") {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", screen,
            fixturePreference + "theme", theme, fixturePreference + "reduce_motion", "true"]
        app.launch()
        let headings = ["safety": "Something feels different?", "symptoms": "What are you seeing?", "contacts": "Your people, close by.",
            "contact-form": "Keep a number close.", "region": "Start with your region.", "nearby-vets": "A vet near your place.",
            "location-denied": "Type a place instead.", "toxicity": "A possible exposure?", "safety-topics": "Read with Miso in mind."]
        if let heading = headings[screen] { XCTAssertTrue(item(heading).waitForExistence(timeout: 25)) }
        Thread.sleep(forTimeInterval: 0.5)
    }
    private func item(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")).firstMatch
    }
    private func reveal(_ label: String) -> XCUIElement {
        for _ in 0..<18 {
            let value = item(label)
            let confirmation = item("Clear this saved contact?").exists || item("Keep this draft?").exists
            let footers = confirmation ? [] : ["Save a contact", "Save contact", "Show saved contacts", "Back to saved contacts", "View Premium access", "Saved contacts · free", "Saved contacts"].map { app.buttons[$0] }.filter { $0.exists && $0.isHittable && $0.frame.minY > 200 }
            let bottom = footers.map { $0.frame.minY - 14 }.min() ?? app.frame.maxY - 22
            if value.exists && value.isHittable && value.frame.minY > 30 && (footers.contains(where: { $0.label == label }) || value.frame.maxY < bottom) {
                Thread.sleep(forTimeInterval: 0.4); return item(label)
            }
            let x = app.frame.width - 9
            let back = app.buttons["Back"]
            let headerAbove = ["Country or region", "City, area or postcode", "Plant, product or substance", "Vet or clinic name"].contains(label) && back.exists && back.frame.maxY < 40
            let upwards = label == "Back" || headerAbove || (value.exists && value.frame.maxY < 40)
            let start = upwards ? CGFloat(150) : max(220, bottom - 25)
            let end = upwards ? min(bottom - 24, CGFloat(420)) : max(90, start - 240)
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: start)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: end)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        capture("ios-safety-missing"); XCTFail("Missing control \(label): \(app.debugDescription)"); return item(label)
    }
    private func press(_ label: String) {
        let value = reveal(label)
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        Thread.sleep(forTimeInterval: 0.6)
    }
    private func fill(_ label: String, _ text: String) {
        let value = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let input = single.exists ? single : app.textViews.matching(predicate).firstMatch
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3)).tap()
        if !app.keyboards.firstMatch.waitForExistence(timeout: 3) { input.tap() }
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 4))
        if let old = input.value as? String, old != "Empty", !old.isEmpty {
            input.press(forDuration: 1.1)
            let all = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Select All")).firstMatch
            XCTAssertTrue(all.waitForExistence(timeout: 4), "Select the full saved value before replacing it")
            all.tap(); input.typeText(XCUIKeyboardKey.delete.rawValue)
            let empty = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@ OR value == %@", "", "Empty"), object: input)
            XCTAssertEqual(XCTWaiter.wait(for: [empty], timeout: 3), .completed)
        }
        input.typeText(text)
        let entered = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@", text), object: input)
        XCTAssertEqual(XCTWaiter.wait(for: [entered], timeout: 3), .completed)
        let done = app.keyboards.buttons["Done"]
        if done.exists { done.tap() }
        else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
        Thread.sleep(forTimeInterval: 1)
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func value(_ label: String) -> String {
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let field = single.exists ? single : app.textViews.matching(predicate).firstMatch
        XCTAssertTrue(field.exists, app.debugDescription)
        return field.value as? String ?? ""
    }
    func testContactDraftSaveRelaunchAndClearCancellation() throws {
        continueAfterFailure = false
        let stamp = Int(Date().timeIntervalSince1970)
        let name = "Native cat contact QA \(stamp)"
        let note = "Side entrance · caregiver contact note \(stamp)"
        launch("contact-form")
        fill("Vet or clinic name", name); fill("Phone number", "+15550100123"); fill("Address or note · optional", note)
        press("Back"); press("Keep draft")
        launch("contact-form")
        XCTAssertEqual(value("Vet or clinic name"), name); XCTAssertEqual(value("Address or note · optional"), note)
        press("Save contact")
        XCTAssertTrue(item("Your people, close by.").waitForExistence(timeout: 15))
        _ = reveal(name); capture("ios-contact-saved")
        launch("contacts"); _ = reveal(name)
        press("Edit regular veterinarian"); press("Clear this saved contact")
        capture("ios-contact-clear-confirmation"); press("Keep contact")
        XCTAssertEqual(value("Vet or clinic name"), name)
        capture("ios-contact-kept-after-clear-cancellation")
        press("Clear this saved contact"); press("Clear contact")
        XCTAssertTrue(item("Your people, close by.").waitForExistence(timeout: 12)); capture("ios-one-contact-cleared")
        press("Save a contact"); XCTAssertTrue(["", "Empty"].contains(value("Vet or clinic name")))
        fill("Vet or clinic name", name); fill("Phone number", "+15550100123"); fill("Address or note · optional", note); press("Save contact")
        XCTAssertTrue(item("Your people, close by.").waitForExistence(timeout: 12)); _ = reveal(name)
    }

    func testFreeCallSelectionsAndManualRegionAndPlace() throws {
        continueAfterFailure = false
        launch("symptoms")
        press("Litter habits changed"); press("Possible poisoning or exposure"); press("Show saved contacts")
        _ = reveal("For your call"); _ = reveal("Possible poisoning or exposure"); capture("ios-call-selections")
        launch("region"); fill("Country or region", "Pakistan"); press("Use this region")
        _ = reveal("No bundled number is verified for Pakistan. Use your saved veterinarian or add a verified local emergency clinic.")
        capture("ios-unsupported-region")
        fill("Country or region", "Canada"); press("Use this region"); _ = reveal("+1 917 722 5958")
        capture("ios-verified-country-contact")
        launch("nearby-vets")
        let place = "São Paulo | west: ~城区@5"
        fill("City, area or postcode", place); press("Type a place instead")
        XCTAssertTrue(item("Type a place instead.").waitForExistence(timeout: 10))
        XCTAssertEqual(value("City, area or postcode"), place); capture("ios-manual-place-preserved")
        press("Saved contacts"); XCTAssertTrue(item("Your people, close by.").waitForExistence(timeout: 10))
    }

    func testExposureDetailsStayAvailableWithoutAnAIRequest() throws {
        continueAfterFailure = false
        launch("toxicity")
        fill("Plant, product or substance", "A lily"); fill("What happened, and when?", "Caregiver's timing note")
        press("Saved contacts · free"); XCTAssertTrue(item("Your people, close by.").waitForExistence(timeout: 10)); press("Back")
        XCTAssertEqual(value("Plant, product or substance"), "A lily")
        XCTAssertEqual(value("What happened, and when?"), "Caregiver's timing note")
        capture("ios-exposure-details-retained")
    }

    func testLocationDenialKeepsTypedPlaceAndFreeContacts() throws {
        continueAfterFailure = false
        launch("nearby-vets")
        fill("City, area or postcode", "Typed place QA")
        press("Use my location")
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let deny = springboard.buttons.matching(NSPredicate(format: "label == %@ OR label == %@", "Don’t Allow", "Don't Allow")).firstMatch
        if deny.waitForExistence(timeout: 5) {
            let permission = XCTAttachment(screenshot: XCUIScreen.main.screenshot()); permission.name = "ios-native-location-permission"; permission.lifetime = .keepAlways; add(permission)
            deny.tap()
        }
        XCTAssertTrue(item("Type a place instead.").waitForExistence(timeout: 35), app.debugDescription)
        XCTAssertTrue(item("Location access was not granted.").exists, app.debugDescription)
        XCTAssertEqual(value("City, area or postcode"), "Typed place QA")
        capture("ios-native-location-denied-with-place")
        press("Saved contacts")
        XCTAssertTrue(item("Your people, close by.").waitForExistence(timeout: 12))
    }

    func testRestingSafetyScreensInBothThemes() throws {
        continueAfterFailure = false
        for theme in ["Light", "Dark"] {
            for screen in ["safety", "symptoms", "contacts", "contact-form", "region", "nearby-vets", "location-denied", "toxicity", "safety-topics"] {
                launch(screen, theme); capture("ios-" + theme.lowercased() + "-" + screen)
            }
        }
    }
}

final class SoftPawsReportsJourneys: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
    private let fixturePreference = "-barklog_preference_v1_board_review_softpawsday_v1_"
    private func launch(_ screen: String, _ theme: String = "Light") {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", screen,
            fixturePreference + "theme", theme, fixturePreference + "reduce_motion", "true"]
        app.launch()
        let headings = ["insights": "Their week, in view.", "weight-history": "Measured, not guessed.",
            "report": "Before the visit, the facts.", "export-options": "Take the facts with you.", "export-progress": "Ready when you are."]
        if let heading = headings[screen] { XCTAssertTrue(item(heading).waitForExistence(timeout: 25)) }
        Thread.sleep(forTimeInterval: 0.5)
    }
    private func item(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")).firstMatch
    }
    private func reveal(_ label: String) -> XCUIElement {
        for _ in 0..<18 {
            let value = item(label)
            let confirmation = item("Clear this saved contact?").exists || item("Keep this draft?").exists
            let footers = confirmation ? [] : ["Export options", "Share CSV", "Back to report", "Cancel export", "Add a measurement", "Keep this check-in", "Save changes", "View record", "Back to today"].map { app.buttons[$0] }.filter { $0.exists && $0.isHittable && $0.frame.minY > 200 }
            let bottom = footers.map { $0.frame.minY - 14 }.min() ?? app.frame.maxY - 22
            if value.exists && value.isHittable && value.frame.minY > 30 && (footers.contains(where: { $0.label == label }) || value.frame.maxY < bottom) {
                Thread.sleep(forTimeInterval: 0.4); return item(label)
            }
            let x = app.frame.width - 9
            let back = app.buttons["Back"]
            let headerAbove = ["Country or region", "City, area or postcode", "Plant, product or substance", "Vet or clinic name"].contains(label) && back.exists && back.frame.maxY < 40
            let upwards = label == "Back" || headerAbove || (value.exists && value.frame.maxY < 40)
            let start = upwards ? CGFloat(150) : max(220, bottom - 25)
            let end = upwards ? min(bottom - 24, CGFloat(420)) : max(90, start - 240)
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: start)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: end)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        capture("ios-reports-missing"); XCTFail("Missing control \(label): \(app.debugDescription)"); return item(label)
    }
    private func press(_ label: String) {
        let value = reveal(label)
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        Thread.sleep(forTimeInterval: 0.6)
    }
    private func fill(_ label: String, _ text: String) {
        let value = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let input = single.exists ? single : app.textViews.matching(predicate).firstMatch
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3)).tap()
        if !app.keyboards.firstMatch.waitForExistence(timeout: 3) { input.tap() }
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 4))
        if let old = input.value as? String, old != "Empty", !old.isEmpty {
            input.press(forDuration: 1.1)
            let all = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Select All")).firstMatch
            XCTAssertTrue(all.waitForExistence(timeout: 4), "Select the full saved value before replacing it")
            all.tap(); input.typeText(XCUIKeyboardKey.delete.rawValue)
            let empty = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@ OR value == %@", "", "Empty"), object: input)
            XCTAssertEqual(XCTWaiter.wait(for: [empty], timeout: 3), .completed)
        }
        input.typeText(text)
        let entered = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@", text), object: input)
        XCTAssertEqual(XCTWaiter.wait(for: [entered], timeout: 3), .completed)
        let done = app.keyboards.buttons["Done"]
        if done.exists { done.tap() }
        else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
        Thread.sleep(forTimeInterval: 1)
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func value(_ label: String) -> String {
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let field = single.exists ? single : app.textViews.matching(predicate).firstMatch
        XCTAssertTrue(field.exists, app.debugDescription)
        return field.value as? String ?? ""
    }
    func testRetainedVetQuestionsActualCsvAndPdfBoundary() throws {
        continueAfterFailure = false
        let questions = "Discuss appetite | ~ : @ QA \(Int(Date().timeIntervalSince1970))"
        launch("report")
        // Start this case through the real draft-discard action. Text selection's
        // system menu is a separate OS interaction and varies at larger text.
        let retained = value("Questions for your vet")
        if !retained.isEmpty && retained != "Empty" {
            press("Back"); press("Discard draft"); launch("report")
            XCTAssertTrue(value("Questions for your vet") == "Empty" || value("Questions for your vet").isEmpty)
        }
        fill("Questions for your vet", questions)
        press("Export options"); press("Raw CSV")
        XCTAssertTrue(item("Share CSV").waitForExistence(timeout: 15), app.debugDescription)
        capture("ios-csv-ready")
        press("Share CSV")
        XCTAssertTrue(app.cells["Copy"].waitForExistence(timeout: 8) || app.cells["Save to Files"].exists, app.debugDescription)
        capture("ios-native-csv-share")
        let close = app.buttons["Close"].firstMatch
        XCTAssertTrue(close.waitForExistence(timeout: 5)); close.tap()
        XCTAssertTrue(item("Sharing cancelled. Your file and report choices stay here.").waitForExistence(timeout: 8))
        capture("ios-csv-share-cancelled")
        press("Back to report")
        XCTAssertTrue(item("Before the visit, the facts.").waitForExistence(timeout: 10))
        launch("report")
        XCTAssertEqual(value("Questions for your vet"), questions)
        press("Export options"); press("PDF report")
        XCTAssertTrue(item("Your preview stays free").waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["Share PDF"].exists)
        capture("ios-pdf-gated")
    }
    func testMeasuredWeightSavesAndReopensItsSource() throws {
        continueAfterFailure = false
        launch("weight-history"); press("Add a measurement")
        fill("Measured weight", "4.2"); press("Keep this check-in")
        XCTAssertTrue(item("A small thing, kept.").waitForExistence(timeout: 12))
        press("View record"); capture("ios-measurement-source")
        launch("weight-history")
        XCTAssertTrue(item("4.2 kg").waitForExistence(timeout: 12)); capture("ios-measurement-reopened")
    }
    func testExportFailureCanRetryWithoutLosingTheReport() throws {
        continueAfterFailure = false
        launch("cat-export-failure")
        XCTAssertTrue(item("Couldn't prepare the file. Your records stay saved. Try again.").waitForExistence(timeout: 15))
        capture("ios-export-failed"); press("Try again")
        XCTAssertTrue(item("Share CSV").waitForExistence(timeout: 15)); capture("ios-export-retried")
    }
    func testSelectedInsightsWeekWinsOverRetainedReportScope() throws {
        continueAfterFailure = false
        launch("report")
        let questions = value("Questions for your vet")
        launch("insights"); press("Change dates & view counts"); press("Previous"); press("Prepare a care report")
        XCTAssertTrue(item("7–13 October 2026 · UTC").waitForExistence(timeout: 12))
        XCTAssertEqual(value("Questions for your vet"), questions)
        capture("ios-selected-report-week")
    }
    func testRestingReportScreensBothThemes() throws {
        continueAfterFailure = false
        for theme in ["Light", "Dark"] {
            for screen in ["insights", "weight-history", "report", "export-options", "export-progress"] {
                launch(screen, theme)
                if screen == "export-progress" { XCTAssertTrue(item("Share CSV").waitForExistence(timeout: 15)) }
                capture("ios-" + theme.lowercased() + "-" + screen)
            }
        }
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", "home",
            fixturePreference + "theme", "Light", fixturePreference + "reduce_motion", "false"]
        app.launch()
        XCTAssertTrue(app.buttons["Say hello to Miso"].waitForExistence(timeout: 25))
    }
}

final class SoftPawsExpensesJourneys: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
    private let fixturePreference = "-barklog_preference_v1_board_review_softpawsday_v1_"
    private func launch(_ screen: String, _ theme: String = "Light") {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", screen,
            fixturePreference + "theme", theme, fixturePreference + "reduce_motion", "true"]
        app.launch()
        let headings = ["cat-receipt-denied": "A cost, with context.", "expenses": "The costs of a little life.", "expense-form": "A cost, with context.", "expense-detail": "Expense details", "insights": "Their week, in view.", "weight-history": "Measured, not guessed.",
            "report": "Before the visit, the facts.", "export-options": "Take the facts with you.", "export-progress": "Ready when you are."]
        if let heading = headings[screen] { XCTAssertTrue(item(heading).waitForExistence(timeout: 25)) }
        Thread.sleep(forTimeInterval: 0.5)
    }
    private func item(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")).firstMatch
    }
    private func reveal(_ label: String) -> XCUIElement {
        for _ in 0..<18 {
            let value = item(label)
            let confirmation = item("Delete this expense?").exists || item("Keep this draft?").exists
            let footers = confirmation ? [] : ["Keep expense", "Add an expense", "Edit expense", "Back to expenses"].map { app.buttons[$0] }.filter { $0.exists && $0.isHittable && $0.frame.minY > 200 }
            let bottom = footers.map { $0.frame.minY - 14 }.min() ?? app.frame.maxY - 22
            if value.exists && value.isHittable && value.frame.minY > 30 && (footers.contains(where: { $0.label == label }) || value.frame.maxY < bottom) {
                Thread.sleep(forTimeInterval: 0.4); return item(label)
            }
            let x = app.frame.width - 9
            let back = app.buttons["Back"]
            let headerAbove = ["What was it for?", "Amount (PKR)", "Amount (USD)", "Attach receipt", "Change receipt"].contains(label) && back.exists && back.frame.maxY < 40
            let upwards = label == "Back" || headerAbove || (value.exists && value.frame.maxY < 40)
            let start = upwards ? CGFloat(150) : max(220, bottom - 25)
            let end = upwards ? min(bottom - 24, CGFloat(420)) : max(90, start - 240)
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: start)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: end)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        capture("ios-expenses-missing"); XCTFail("Missing control \(label): \(app.debugDescription)"); return item(label)
    }
    private func press(_ label: String) {
        let value = reveal(label)
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        Thread.sleep(forTimeInterval: 0.6)
    }
    private func fill(_ label: String, _ text: String) {
        let value = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let input = single.exists ? single : app.textViews.matching(predicate).firstMatch
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3)).tap()
        if !app.keyboards.firstMatch.waitForExistence(timeout: 3) { input.tap() }
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 4))
        if let old = input.value as? String, old != "Empty", !old.isEmpty {
            input.press(forDuration: 1.1)
            let all = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Select All")).firstMatch
            XCTAssertTrue(all.waitForExistence(timeout: 4), "Select the full saved value before replacing it")
            all.tap(); input.typeText(XCUIKeyboardKey.delete.rawValue)
            let empty = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@ OR value == %@", "", "Empty"), object: input)
            XCTAssertEqual(XCTWaiter.wait(for: [empty], timeout: 3), .completed)
        }
        input.typeText(text)
        let entered = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@", text), object: input)
        XCTAssertEqual(XCTWaiter.wait(for: [entered], timeout: 3), .completed)
        let done = app.keyboards.buttons["Done"]
        if done.exists { done.tap() }
        else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
        Thread.sleep(forTimeInterval: 1)
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func value(_ label: String) -> String {
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let field = single.exists ? single : app.textViews.matching(predicate).firstMatch
        XCTAssertTrue(field.exists, app.debugDescription)
        return field.value as? String ?? ""
    }
    private func ownedReceipt() {
        let fixture = XCUIApplication(bundleIdentifier: "com.draco.qa.softpaws.files")
        fixture.launch(); XCTAssertTrue(fixture.staticTexts["Sample files ready"].waitForExistence(timeout: 15)); fixture.terminate()
    }
    private func chooseReceipt() {
        func candidate() -> XCUIElement { app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "soft-paws-vaccination-qa")).firstMatch }
        if !candidate().waitForExistence(timeout: 5) {
            if app.buttons["Browse"].exists { app.buttons["Browse"].tap() }
            if !item("SoftPaws QA Files").waitForExistence(timeout: 3), item("On My iPhone").waitForExistence(timeout: 3) { item("On My iPhone").tap() }
            if item("SoftPaws QA Files").waitForExistence(timeout: 5) { item("SoftPaws QA Files").tap() }
        }
        XCTAssertTrue(candidate().waitForExistence(timeout: 12), app.debugDescription)
        capture("ios-native-receipt-file"); candidate().tap()
        XCTAssertTrue(reveal("Open or share receipt").exists)
    }
    func testAReceiptDraftSaveEditReopenAndDeleteCancellation() {
        continueAfterFailure = false
        ownedReceipt()
        let title = "Litter QA \(Int(Date().timeIntervalSince1970))"
        launch("expense-form")
        if !["", "Empty"].contains(value("What was it for?")) { press("Back"); press("Discard draft"); launch("expense-form") }
        fill("What was it for?", title); fill("Amount (PKR)", "15.3500"); press("Keep expense")
        let validation = item("Enter a positive amount with at most 2 decimal places.")
        XCTAssertTrue(validation.waitForExistence(timeout: 5) && validation.isHittable)
        XCTAssertLessThan(validation.frame.maxY, app.buttons["Keep expense"].frame.minY)
        capture("ios-expense-validation-error")
        fill("Amount (PKR)", "15.35"); press("Litter")
        press("Attach receipt")
        let cancel = app.buttons["Cancel"].firstMatch
        XCTAssertTrue(cancel.waitForExistence(timeout: 10)); capture("ios-native-receipt-picker"); cancel.tap()
        XCTAssertTrue(reveal("No attachment added. Your draft is still here.").exists)
        press("Attach receipt"); chooseReceipt()
        press("Currency, PKR"); press("USD")
        fill("Date · YYYY-MM-DD", "2026-10-14")
        press("Back"); press("Keep draft"); launch("expense-form")
        XCTAssertEqual(value("What was it for?"), title); capture("ios-retained-receipt-draft")
        press("Keep expense"); XCTAssertTrue(item("Expense details").waitForExistence(timeout: 15))
        XCTAssertTrue(reveal("PDF receipt on this device").exists); capture("ios-local-receipt-saved")
        press("Open or share receipt")
        XCTAssertTrue(app.cells["Copy"].waitForExistence(timeout: 8) || app.cells["Save to Files"].exists, app.debugDescription)
        capture("ios-native-receipt-share")
        let close = app.buttons["Close"].firstMatch; XCTAssertTrue(close.waitForExistence(timeout: 5)); close.tap()
        press("Edit expense"); fill("Your note · optional", "Edited receipt note"); press("Keep expense")
        XCTAssertTrue(reveal("Edited receipt note").exists)
        launch("expenses"); press(title); XCTAssertTrue(reveal("Edited receipt note").exists)
        press("Delete expense"); capture("ios-delete-expense-confirmation"); press("Keep expense")
        XCTAssertTrue(reveal("Expense details").exists)
        press("Back to expenses"); press("Prepare monthly expense report")
        XCTAssertTrue(item("Before the visit, the facts.").waitForExistence(timeout: 15)); capture("ios-expense-report-scope")
    }
    func testCReceiptAccessFailureRetainsTheDraft() {
        continueAfterFailure = false
        launch("cat-receipt-denied")
        if !["", "Empty"].contains(value("What was it for?")) { press("Back"); press("Discard draft"); launch("cat-receipt-denied") }
        fill("What was it for?", "Denied receipt QA"); fill("Amount (PKR)", "1.00")
        press("Attach receipt"); XCTAssertTrue(reveal("This file wasn't accessible. Your draft is still here.").exists)
        capture("ios-receipt-access-denied")
        press("Back"); press("Keep draft"); launch("expense-form")
        XCTAssertEqual(value("What was it for?"), "Denied receipt QA")
        press("Back"); press("Discard draft")
    }
    func testBCatExpenseScreensInBothThemes() {
        continueAfterFailure = false
        for theme in ["Light", "Dark"] {
            for screen in ["expenses", "expense-form", "expense-detail"] {
                launch(screen, theme); capture("ios-" + theme.lowercased() + "-" + screen)
                if screen == "expense-form" {
                    _ = reveal("Your note · optional")
                    let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", "Your note · optional", "Your note · optional, ")
                    let note = app.textViews.matching(predicate).firstMatch
                    XCTAssertTrue(note.exists, app.debugDescription)
                    for _ in 0..<6 {
                        let bottom = app.buttons["Keep expense"].frame.minY - 12
                        if note.isHittable && note.frame.height >= 90 && note.frame.maxY < bottom { break }
                        let x = app.frame.width - 9
                        app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: bottom - 20)).press(forDuration: 0.03,
                            thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: 110)),
                            withVelocity: .slow, thenHoldForDuration: 0.3)
                        Thread.sleep(forTimeInterval: 0.5)
                    }
                    XCTAssertTrue(note.isHittable && note.frame.height >= 90 && note.frame.maxY < app.buttons["Keep expense"].frame.minY - 8, "The whole note input must remain reachable above the fixed action")
                    capture("ios-" + theme.lowercased() + "-expense-form-more")
                }
            }
        }
    }
}

final class SoftPawsPhotoMemoryJourneys: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
    private let fixturePreference = "-barklog_preference_v1_board_review_softpawsday_v1_"
    private func launch(_ screen: String, _ theme: String = "Light") {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", screen,
            fixturePreference + "theme", theme, fixturePreference + "reduce_motion", "true"]
        app.launch()
        let headings = ["photo-picker": "One moment at a time.", "cat-photo-save-error": "One moment at a time.", "photo-journal": "Ordinary, lovely days.", "memory-book": "October, in small moments."]
        if let heading = headings[screen] { XCTAssertTrue(item(heading).waitForExistence(timeout: 25)) }
        Thread.sleep(forTimeInterval: 0.5)
    }
    private func item(_ label: String) -> XCUIElement {
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        for query in [app.buttons.matching(predicate), app.textFields.matching(predicate), app.textViews.matching(predicate)] {
            if query.firstMatch.exists { return query.firstMatch }
        }
        return app.descendants(matching: .any).matching(predicate).firstMatch
    }
    private func reveal(_ label: String) -> XCUIElement {
        for _ in 0..<64 {
            let value = item(label)
            let confirmation = item("Delete this photo reference?").exists || item("Keep this draft?").exists
            let footers = confirmation ? [] : ["Keep photo", "Keep caption", "Continue photo draft", "Choose a photo", "Back to photos", "Keep collection caption", "Edit collection caption", "PDF, print & sharing", "Choose highlights", "Prepare PDF", "Share PDF", "Print PDF", "Back to Memory Book", "Continue with free journal", "Add a photo"].map { app.buttons[$0] }.filter { $0.exists && $0.isHittable && $0.frame.minY > 200 }
            let bottom = footers.map { $0.frame.minY - 14 }.min() ?? app.frame.maxY - 22
            if value.exists && value.isHittable && (value.elementType != .button || value.frame.height >= 44) && value.frame.minY > 30 && (footers.contains(where: { $0.label == label }) || value.frame.maxY < bottom) {
                Thread.sleep(forTimeInterval: 0.4); return item(label)
            }
            let x = app.frame.width - 9
            let back = app.buttons["Back"]
            let headerAbove = ["Name this moment", "Your caption", "Choose replacement", "Collection caption"].contains(label) && back.exists && back.frame.maxY < 40
            let upwards = label == "Back" || headerAbove || (value.exists && value.frame.maxY < 40)
            let start = upwards ? CGFloat(150) : min(app.frame.height * 0.5, max(220, bottom - 25))
            let end = upwards ? min(bottom - 24, CGFloat(420)) : max(90, start - 240)
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: start)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: end)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        capture("ios-photos-missing"); XCTFail("Missing control \(label): \(app.debugDescription)"); return item(label)
    }
    private func press(_ label: String) {
        var value = reveal(label)
        for _ in 0..<5 {
            let frame = value.frame; Thread.sleep(forTimeInterval: 0.3); value = item(label)
            if abs(value.frame.midY - frame.midY) < 1 { break }
        }
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        Thread.sleep(forTimeInterval: 0.6)
    }
    private func fill(_ label: String, _ text: String) {
        let value = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let input = single.exists ? single : app.textViews.matching(predicate).firstMatch
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3)).tap()
        if !app.keyboards.firstMatch.waitForExistence(timeout: 3) { input.tap() }
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 4))
        if let old = input.value as? String, old != "Empty", !old.isEmpty {
            // Tap after the final line, then clear through the native keyboard.
            input.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.85)).tap()
            input.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: old.count + 2))
            let empty = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@ OR value == %@", "", "Empty"), object: input)
            XCTAssertEqual(XCTWaiter.wait(for: [empty], timeout: 3), .completed)
        }
        input.typeText(text)
        let entered = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@", text), object: input)
        XCTAssertEqual(XCTWaiter.wait(for: [entered], timeout: 3), .completed)
        let done = app.keyboards.buttons["Done"]
        if done.exists { done.tap() }
        else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
        Thread.sleep(forTimeInterval: 1)
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func value(_ label: String) -> String {
        _ = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@", label, label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let field = single.exists ? single : app.textViews.matching(predicate).firstMatch
        XCTAssertTrue(field.exists, app.debugDescription)
        return field.value as? String ?? ""
    }

    private func chooseImage() {
        let photo = app.images.matching(NSPredicate(format: "identifier == %@ AND label BEGINSWITH %@", "PXGGridLayout-Info", "Photo,")).firstMatch
        XCTAssertTrue(photo.waitForExistence(timeout: 10), app.debugDescription)
        capture("ios-native-photo-choice"); photo.tap()
        XCTAssertTrue(item("One moment, kept.").waitForExistence(timeout: 15), app.debugDescription)
    }
    private func openOwnCollection(_ title: String) { press("Open collection: " + title) }
    func testAPrivatePhotoDraftAndIndependentCollectionCaptions() {
        continueAfterFailure = false
        let title = "Window watch QA \(Int(Date().timeIntervalSince1970))"
        launch("next-manage-plan")
        if item("Debug Premium preview").waitForExistence(timeout: 3) { press("End Debug preview") }
        launch("cat-photo-save-error")
        if item("Continue photo draft").waitForExistence(timeout: 2) { press("Continue photo draft"); press("Back"); press("Discard draft"); launch("cat-photo-save-error"); XCTAssertFalse(item("Continue photo draft").exists) }
        press("Choose a photo")
        let cancel = app.buttons["Cancel"].firstMatch
        XCTAssertTrue(cancel.waitForExistence(timeout: 10)); capture("ios-native-photo-picker"); cancel.tap()
        XCTAssertTrue(item("Selection cancelled. Your draft is still here.").waitForExistence(timeout: 6))
        press("Choose a photo"); chooseImage()
        fill("Name this moment", title); fill("Your caption", "Photo words stay separate")
        press("Include in October’s Memory Book")
        press("Back"); press("Keep draft")
        launch("cat-photo-save-error"); press("Continue photo draft")
        XCTAssertEqual(value("Name this moment"), title); XCTAssertEqual(value("Your caption"), "Photo words stay separate")
        capture("ios-retained-photo-draft"); press("Keep photo")
        let failure = item("Couldn't save this change. Your draft is still here. Please try again.")
        XCTAssertTrue(failure.waitForExistence(timeout: 8)); XCTAssertEqual(value("Name this moment"), title)
        capture("ios-photo-save-failed"); press("Keep photo")
        XCTAssertTrue(item("Your caption").waitForExistence(timeout: 10))
        capture("ios-light-photo-detail")
        press("Back to photos"); press("Add a photo")
        XCTAssertFalse(item("Continue photo draft").exists)
        press("Choose a photo"); chooseImage(); XCTAssertTrue(["", "Empty"].contains(value("Name this moment")))
        fill("Name this moment", "Second " + title); fill("Your caption", "Independent second moment"); press("Keep photo")
        XCTAssertTrue(item("Your caption").waitForExistence(timeout: 10)); capture("ios-second-photo-same-session")
        press("Delete photo reference"); press("Delete reference")
        XCTAssertTrue(item("Ordinary, lovely days.").waitForExistence(timeout: 10))
        press(title)
        fill("Your caption", "Photo caption edited on phone"); press("Keep caption")
        launch("photo-journal"); press(title); XCTAssertEqual(value("Your caption"), "Photo caption edited on phone")
        launch("memory-book"); capture("ios-light-memory-book"); openOwnCollection(title)
        press("Edit collection caption"); fill("Collection caption", "Collection words remain independent"); press("Keep collection caption")
        XCTAssertTrue(item("Collection words remain independent").waitForExistence(timeout: 10)); capture("ios-collection-caption")
        press("PDF, print & sharing"); XCTAssertTrue(item("Your preview stays free").waitForExistence(timeout: 8)); capture("ios-memory-premium-boundary")
        launch("photo-journal"); press(title); XCTAssertEqual(value("Your caption"), "Photo caption edited on phone")
        press("Include in October’s Memory Book"); press("Keep caption")
        launch("memory-book"); XCTAssertTrue(reveal("Collection words remain independent").exists); capture("ios-caption-retained-without-sources")
        launch("photo-journal"); press(title); press("Include in October’s Memory Book"); press("Keep caption")
        press("Edit photo details or replace image"); XCTAssertEqual(value("Name this moment"), title)
        capture("ios-photo-full-editor"); press("Choose replacement")
        XCTAssertTrue(cancel.waitForExistence(timeout: 10)); cancel.tap()
        XCTAssertTrue(item("Selection cancelled. Your draft is still here.").waitForExistence(timeout: 6))
        press("Back"); press("Delete photo reference"); press("Keep photo")
        XCTAssertEqual(value("Your caption"), "Photo caption edited on phone")
    }
    func testBCatPhotoAndMemoryScreensInBothThemes() {
        continueAfterFailure = false
        for theme in ["Light", "Dark"] {
            for screen in ["photo-picker", "photo-detail", "memory-book"] {
                launch(screen, theme)
                if screen == "photo-detail" { XCTAssertTrue(item("Your caption").waitForExistence(timeout: 12)) }
                capture("ios-" + theme.lowercased() + "-" + screen)
                if screen == "photo-detail" {
                    let input = reveal("Your caption")
                    XCTAssertGreaterThan(input.frame.height, 85)
                    _ = reveal("Include in October’s Memory Book"); capture("ios-" + theme.lowercased() + "-photo-detail-more")
                }
            }
        }
        launch("memory-empty"); XCTAssertTrue(item("Your chosen highlights").waitForExistence(timeout: 12)); capture("ios-memory-empty")
    }
    func testCPhotoAccessDenialKeepsThePickerUsable() {
        continueAfterFailure = false
        launch("photo-permission-denied"); press("Choose a photo")
        XCTAssertTrue(item("This photo wasn't accessible. Your entries stay here.").waitForExistence(timeout: 6))
        capture("ios-photo-access-denied")
        press("Choose a photo"); let cancel = app.buttons["Cancel"].firstMatch
        XCTAssertTrue(cancel.waitForExistence(timeout: 10)); cancel.tap()
    }
    func testDPreparedMemoryPdfUsesExplicitNativeShareAndPrint() {
        continueAfterFailure = false
        launch("next-paywall"); press("Try Debug Premium preview")
        XCTAssertTrue(item("Let’s talk about your cat.").waitForExistence(timeout: 15))
        defer {
            launch("next-manage-plan")
            press("End Debug preview")
        }
        launch("memory-share"); press("Prepare PDF")
        XCTAssertTrue(item("Your PDF is ready").waitForExistence(timeout: 15)); capture("ios-memory-pdf-ready")
        press("Share PDF")
        XCTAssertTrue(app.cells["Copy"].waitForExistence(timeout: 8) || app.cells["Save to Files"].exists, app.debugDescription)
        capture("ios-native-memory-share")
        let close = app.buttons["Close"].firstMatch; XCTAssertTrue(close.waitForExistence(timeout: 5)); close.tap()
        press("Print PDF")
        let cancel = app.buttons["Cancel"].firstMatch; XCTAssertTrue(cancel.waitForExistence(timeout: 8), app.debugDescription)
        capture("ios-native-memory-print"); cancel.tap()
    }

    func testEPhotoPreviewOpensItsSavedDetails() {
        continueAfterFailure = false
        launch("photo-journal")
        let images = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Window watch QA")).allElementsBoundByIndex
            .filter { $0.frame.height > 120 && $0.frame.minY > 40 && $0.frame.maxY < 560 }
        XCTAssertFalse(images.isEmpty, app.debugDescription)
        let image = images[0]; let label = image.label
        capture("ios-photo-preview-action"); image.tap()
        XCTAssertTrue(item("Keep caption").waitForExistence(timeout: 10))
        XCTAssertTrue(item(label).exists)
        capture("ios-photo-preview-opened-detail")
    }

}

/// Run only while the host harness temporarily holds the selected owned QA image.
final class SoftPawsMissingPhotoJourney: XCTestCase {
    func testMissingFileKeepsCaptionAndReplacementAvailable() throws {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-day-v1", "-DesignReviewScreen", "photo-detail",
            "-barklog_preference_v1_board_review_softpawsday_v1_theme", "Light", "-barklog_preference_v1_board_review_softpawsday_v1_reduce_motion", "true"]
        app.launch()
        guard app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Photo unavailable")).firstMatch.waitForExistence(timeout: 20) else { throw XCTSkip("Requires the owned missing-file harness; no caregiver file is removed by this test.") }
        func capture(_ name: String) { let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a) }
        capture("ios-photo-missing-file")
        let input = app.textViews.matching(NSPredicate(format: "label == %@ OR label BEGINSWITH %@", "Your caption", "Your caption, ")).firstMatch
        for _ in 0..<12 {
            if input.exists && input.isHittable && input.frame.minY > 50 && input.frame.maxY < 525 { break }
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: 366, dy: 330)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: 366, dy: 140)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
        }
        XCTAssertTrue(input.exists && input.isHittable)
        XCTAssertGreaterThan(input.frame.height, 85)
        XCTAssertFalse(["", "Empty"].contains(input.value as? String ?? ""))
        capture("ios-photo-missing-caption-retained")
        let edit = app.buttons.matching(NSPredicate(format: "label == %@ OR label BEGINSWITH %@", "Edit photo details or replace image", "Edit photo details or replace image, ")).firstMatch
        for _ in 0..<8 {
            if edit.exists && edit.isHittable && edit.frame.maxY < 525 { break }
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: 366, dy: 330)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: 366, dy: 140)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
        }
        XCTAssertTrue(edit.exists && edit.isEnabled); capture("ios-photo-replacement-still-available")
    }
}

final class SoftPawsVideoJourneys: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.draco.apps.soft.paws")
    private let fixturePreference = "-barklog_preference_v1_board_review_softpawsvideo_v1_"
    private func launch(_ screen: String, _ theme: String = "Light", reduced: Bool = true) {
        app.terminate()
        app.launchArguments = ["-DesignReview", "-DesignReviewFixture", "soft-paws-video-v1", "-DesignReviewScreen", screen,
            fixturePreference + "theme", theme, fixturePreference + "reduce_motion", reduced ? "true" : "false"]
        app.launch()
        let headings = ["video-editor": "A few moments, together.", "cat-video-denied": "A few moments, together."]
        if let heading = headings[screen] { XCTAssertTrue(item(heading).waitForExistence(timeout: 25)) }
        Thread.sleep(forTimeInterval: 0.5)
    }
    private func item(_ label: String) -> XCUIElement {
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@ OR label == %@ OR label BEGINSWITH %@", label, label + ", ", "✓ " + label, "✓ " + label + ", ")
        for query in [app.buttons.matching(predicate), app.textFields.matching(predicate), app.textViews.matching(predicate)] {
            if query.firstMatch.exists { return query.firstMatch }
        }
        return app.descendants(matching: .any).matching(predicate).firstMatch
    }
    private func reveal(_ label: String) -> XCUIElement {
        for attempt in 0..<32 {
            let value = item(label)
            let confirmation = item("Choose your cat’s photos").exists || item("This edit hasn’t saved yet.").exists
            let labels = ["See Premium", "Back to my preview", "Export MP4 · Premium", "Back to edit", "Save or share MP4", "Continue with free journal"] + (app.buttons["Back to edit"].exists ? [] : ["Play preview"])
            let footers = confirmation ? [] : labels.map { app.buttons[$0] }.filter { $0.exists && $0.isHittable && $0.frame.minY > 200 }
            let bottom = footers.map { $0.frame.minY - 14 }.min() ?? app.frame.maxY - 22
            if value.exists && value.isHittable && (value.elementType != .button || value.frame.height >= 44) && value.frame.minY > 30 && (footers.contains(where: { $0.label == label }) || value.frame.maxY < bottom) {
                Thread.sleep(forTimeInterval: 0.4); return item(label)
            }
            let x = app.frame.width - 9
            let back = app.buttons["Back"]
            let headerAbove = ["Name this moment", "Your caption", "Choose replacement", "Collection caption"].contains(label) && back.exists && back.frame.maxY < 40
            let upwards = label == "Back" || headerAbove || (value.exists && value.frame.maxY < 40) || (!value.exists && attempt >= 16)
            let start = upwards ? CGFloat(150) : min(app.frame.height * 0.5, max(220, bottom - 25))
            let end = upwards ? min(bottom - 24, CGFloat(420)) : max(90, start - 240)
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: start)).press(forDuration: 0.03,
                thenDragTo: app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: x, dy: end)),
                withVelocity: .slow, thenHoldForDuration: 0.3)
            Thread.sleep(forTimeInterval: 0.4)
        }
        capture("ios-video-missing-control"); XCTFail("Missing control \(label): \(app.debugDescription)"); return item(label)
    }
    private func press(_ label: String) {
        var value = reveal(label)
        for _ in 0..<5 {
            let frame = value.frame; Thread.sleep(forTimeInterval: 0.3); value = item(label)
            if abs(value.frame.midY - frame.midY) < 1 { break }
        }
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        Thread.sleep(forTimeInterval: 0.6)
    }
    private func fill(_ label: String, _ text: String) {
        let value = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@ OR label == %@ OR label BEGINSWITH %@", label, label + ", ", "✓ " + label, "✓ " + label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let input = single.exists ? single : app.textViews.matching(predicate).firstMatch
        value.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3)).tap()
        if !app.keyboards.firstMatch.waitForExistence(timeout: 3) { input.tap() }
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 4))
        if let old = input.value as? String, old != "Empty", !old.isEmpty {
            // Tap after the final line, then clear through the native keyboard.
            input.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.85)).tap()
            input.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: old.count + 2))
            let empty = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@ OR value == %@", "", "Empty"), object: input)
            XCTAssertEqual(XCTWaiter.wait(for: [empty], timeout: 3), .completed)
        }
        input.typeText(text)
        let entered = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@", text), object: input)
        XCTAssertEqual(XCTWaiter.wait(for: [entered], timeout: 3), .completed)
        let done = app.keyboards.buttons["Done"]
        if done.exists { done.tap() }
        else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.98, dy: 0.12)).tap() }
        Thread.sleep(forTimeInterval: 1)
    }
    private func capture(_ name: String) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func value(_ label: String) -> String {
        _ = reveal(label)
        let predicate = NSPredicate(format: "label == %@ OR label BEGINSWITH %@ OR label == %@ OR label BEGINSWITH %@", label, label + ", ", "✓ " + label, "✓ " + label + ", ")
        let single = app.textFields.matching(predicate).firstMatch
        let field = single.exists ? single : app.textViews.matching(predicate).firstMatch
        XCTAssertTrue(field.exists, app.debugDescription)
        return field.value as? String ?? ""
    }


    func testACatFilmEditsPickerAndActualNativeExport() {
        continueAfterFailure = false
        launch("next-manage-plan")
        if item("Debug Premium preview").waitForExistence(timeout: 3) { press("End Debug preview") }
        defer { launch("next-manage-plan"); if item("Debug Premium preview").waitForExistence(timeout: 3) { press("End Debug preview") } }
        launch("video-editor")
        fill("Film title", "Miso’s window film QA")
        fill("Caption for this photo", "Watching birds from the window")
        press("Move later"); press("Move earlier")
        press("Square · 1:1")
        press("Preview photo 3"); press("Remove from film")
        press("Choose photos"); press("Afternoon nap QA"); press("Preview photo 1")
        press("Choose photos"); press("From my phone")
        let cancel = app.buttons["Cancel"].firstMatch
        XCTAssertTrue(cancel.waitForExistence(timeout: 10)); capture("ios-native-video-picker"); cancel.tap()
        launch("video-editor")
        XCTAssertEqual(value("Film title"), "Miso’s window film QA")
        XCTAssertEqual(value("Caption for this photo"), "Watching birds from the window")
        press("Play preview")
        XCTAssertTrue(item("Miso’s window film QA").waitForExistence(timeout: 10))
        press("Play preview"); Thread.sleep(forTimeInterval: 3.2)
        XCTAssertTrue(item("Photo 1 of 3").exists)
        press("Next photo"); XCTAssertTrue(item("Photo 2 of 3").exists)
        press("Previous photo"); XCTAssertTrue(item("Photo 1 of 3").exists)
        press("Back to edit")
        press("Export MP4 · Premium")
        XCTAssertTrue(item("Keep their moments moving.").waitForExistence(timeout: 10)); capture("ios-video-premium-boundary")
        press("Back to my preview")
        launch("next-paywall"); press("Try Debug Premium preview")
        launch("video-editor"); press("Export MP4 · Premium")
        XCTAssertTrue(item("Your film is ready.").waitForExistence(timeout: 90)); capture("ios-video-ready")
        press("Save or share MP4")
        let close = app.buttons["Close"].firstMatch
        XCTAssertTrue(close.waitForExistence(timeout: 10)); capture("ios-native-video-share"); close.tap()
        launch("video-editor"); XCTAssertEqual(value("Film title"), "Miso’s window film QA")
    }
    func testBCatVideoScreensInBothThemes() {
        continueAfterFailure = false
        for theme in ["Light", "Dark"] {
            launch("video-editor", theme)
            capture("ios-" + theme.lowercased() + "-video-editor")
            _ = reveal("Caption for this photo")
            let caption = app.textViews.matching(NSPredicate(format: "label BEGINSWITH %@", "Caption for this photo")).firstMatch
            XCTAssertTrue(caption.exists); XCTAssertGreaterThan(caption.frame.height, 85)
            capture("ios-" + theme.lowercased() + "-video-editor-more")
            press("Play preview"); XCTAssertTrue(item("Back to edit").exists)
            capture("ios-" + theme.lowercased() + "-video-preview")
        }
    }
    func testCVideoAccessDenialKeepsDraft() {
        continueAfterFailure = false
        launch("cat-video-denied")
        let title = value("Film title")
        press("Choose photos"); press("From my phone")
        XCTAssertTrue(item("Photo access wasn't available. Choose a photo again when you're ready.").waitForExistence(timeout: 10))
        capture("ios-video-access-denied")
        XCTAssertEqual(value("Film title"), title)
    }
    func testDPreviewPlaysAndPauses() {
        continueAfterFailure = false
        launch("video-preview", reduced: false)
        press("Play preview")
        XCTAssertTrue(app.buttons["Pause preview"].waitForExistence(timeout: 3))
        capture("ios-video-preview-playing")
        press("Pause preview")
        XCTAssertTrue(app.buttons["Play preview"].waitForExistence(timeout: 3))
        capture("ios-video-preview-paused")
        press("Play preview"); XCTAssertTrue(app.buttons["Pause preview"].waitForExistence(timeout: 3))
        XCUIDevice.shared.press(.home)
        app.activate(); XCTAssertTrue(app.buttons["Play preview"].waitForExistence(timeout: 5))
    }


}
