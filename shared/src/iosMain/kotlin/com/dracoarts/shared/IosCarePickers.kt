@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
package com.dracoarts.shared

import com.dracoarts.shared.services.DeviceResult
import kotlinx.cinterop.ObjCAction
import kotlinx.coroutines.*
import platform.Foundation.*
import platform.UIKit.*

internal class IosCarePickers(private val presenter: () -> UIViewController?) {
    private var pending: CompletableDeferred<DeviceResult<String>>? = null

    suspend fun choose(value: String, title: String, time: Boolean): DeviceResult<String> = withContext(Dispatchers.Main) {
        val host = presenter() ?: return@withContext DeviceResult.Failed("Couldn't open this picker. You can still enter the value.")
        val result = CompletableDeferred<DeviceResult<String>>()
        var sheet: UINavigationController? = null
        try {
            val normalized = if (time) kotlinx.datetime.LocalTime.parse(value).let { "${it.hour.toString().padStart(2, '0')}:${it.minute.toString().padStart(2, '0')}" }
                else kotlinx.datetime.LocalDate.parse(value).toString()
            val page = CarePickerController(normalized, title, time) { result.complete(it) }
            val navigation = UINavigationController(page)
            sheet = navigation
            navigation.modalPresentationStyle = UIModalPresentationPageSheet
            pending = result
            host.presentViewController(navigation, true, null)
            navigation.presentationController?.delegate = page
            result.await()
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { DeviceResult.Failed("Couldn't open this picker. Your entered value is unchanged.") }
        finally { pending = null; sheet?.dismissViewControllerAnimated(false, null) }
    }

    fun close() { pending?.cancel() }
}

/** Uses a Gregorian calendar value, rather than changing days in the device time zone. */
private class CarePickerController(
    private val initial: String, private val heading: String, private val time: Boolean,
    private val finish: (DeviceResult<String>) -> Unit,
) : UIViewController(null, null), UIAdaptivePresentationControllerDelegateProtocol {
    private val picker = UIDatePicker()
    private val formatter = NSDateFormatter().apply {
        locale = NSLocale("en_US_POSIX")
        calendar = NSCalendar(NSCalendarIdentifierGregorian)
        timeZone = NSTimeZone.timeZoneForSecondsFromGMT(0)
        dateFormat = if (time) "HH:mm" else "yyyy-MM-dd"
        lenient = false
    }
    private val startingDate = checkNotNull(formatter.dateFromString(initial))

    override fun viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor.systemBackgroundColor
        navigationItem.title = heading
        navigationItem.leftBarButtonItem = UIBarButtonItem("Cancel", UIBarButtonItemStyle.UIBarButtonItemStylePlain, this, NSSelectorFromString("cancelSelection"))
        navigationItem.rightBarButtonItem = UIBarButtonItem("Done", UIBarButtonItemStyle.UIBarButtonItemStyleDone, this, NSSelectorFromString("keepSelection"))
        picker.datePickerMode = if (time) UIDatePickerMode.UIDatePickerModeTime else UIDatePickerMode.UIDatePickerModeDate
        picker.preferredDatePickerStyle = if (time) UIDatePickerStyle.UIDatePickerStyleWheels else UIDatePickerStyle.UIDatePickerStyleInline
        picker.calendar = formatter.calendar
        picker.timeZone = formatter.timeZone
        picker.date = startingDate
        picker.accessibilityLabel = heading
        val scroll = UIScrollView()
        scroll.translatesAutoresizingMaskIntoConstraints = false
        picker.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scroll); scroll.addSubview(picker)
        NSLayoutConstraint.activateConstraints(listOf(
            scroll.leadingAnchor.constraintEqualToAnchor(view.safeAreaLayoutGuide.leadingAnchor),
            scroll.trailingAnchor.constraintEqualToAnchor(view.safeAreaLayoutGuide.trailingAnchor),
            scroll.topAnchor.constraintEqualToAnchor(view.safeAreaLayoutGuide.topAnchor),
            scroll.bottomAnchor.constraintEqualToAnchor(view.safeAreaLayoutGuide.bottomAnchor),
            scroll.contentLayoutGuide.widthAnchor.constraintEqualToAnchor(scroll.frameLayoutGuide.widthAnchor),
            picker.leadingAnchor.constraintEqualToAnchor(scroll.contentLayoutGuide.leadingAnchor, 16.0),
            picker.trailingAnchor.constraintEqualToAnchor(scroll.contentLayoutGuide.trailingAnchor, -16.0),
            picker.topAnchor.constraintEqualToAnchor(scroll.contentLayoutGuide.topAnchor, 16.0),
            picker.bottomAnchor.constraintEqualToAnchor(scroll.contentLayoutGuide.bottomAnchor, -16.0),
        ))
    }

    @ObjCAction fun cancelSelection() { finish(DeviceResult.Cancelled) }
    @ObjCAction fun keepSelection() { finish(DeviceResult.Success(formatter.stringFromDate(picker.date))) }
    override fun presentationControllerDidDismiss(presentationController: UIPresentationController) { finish(DeviceResult.Cancelled) }
}
