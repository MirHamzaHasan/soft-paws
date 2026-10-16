import XCTest

/// Compose's sticky editor action sits above the keyboard and outside the scroll body.
private func journalScrollBottom(_ app: XCUIApplication) -> CGFloat {
    let saves = ["Save poop", "Save pee", "Save meal", "Save walk", "Save symptom", "Save mood", "Save behavior", "Save grooming", "Save weight", "Save changes"]
    let save = app.buttons.matching(NSPredicate(format: "label IN %@", saves)).firstMatch
    return app.buttons["Close"].exists && save.exists && save.isHittable ? save.frame.minY - 36 : app.frame.maxY
}

final class JournalJourneys: XCTestCase {
    private var app: XCUIApplication!
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.dracoarts.barklog")
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
        app = XCUIApplication(bundleIdentifier: "com.dracoarts.barklog")
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
        app = XCUIApplication(bundleIdentifier: "com.dracoarts.barklog")
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
    let app = XCUIApplication(bundleIdentifier: "com.dracoarts.barklog")
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
        app = XCUIApplication(bundleIdentifier: "com.dracoarts.barklog")
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
        app = XCUIApplication(bundleIdentifier: "com.dracoarts.barklog")
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
