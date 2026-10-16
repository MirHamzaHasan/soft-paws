package com.dracoarts.shared.presentation.companion

import kotlin.math.*
import kotlin.random.Random

/** Values are in the board vector's 180×190 coordinates, never layout sizes. */
data class MascotPose(val bodyWidth: Float = 1f,val bodyY: Float = 0f,val headX: Float = 0f,val headY: Float = 0f,val head: Float = 0f,val tail: Float = 0f,val leftEar: Float = 0f,val rightEar: Float = 0f,val paw: Float = 0f,val gaze: Float = 0f,val eye: Float = 1f)
enum class MascotAction(val duration: Int) { Curious(1150),Glance(1500),Ears(1150),Sniff(1300),Wave(1400),Stretch(1500),Celebrate(1060),Rest(360) }
class MascotShuffle(private val random: Random = Random.Default) {
    private var bag = mutableListOf<MascotAction>(); private var last: MascotAction? = null
    fun next(): MascotAction {if(bag.isEmpty()) {bag = MascotAction.entries.take(6).shuffled(random).toMutableList();if(bag.last() == last) {val a = bag[0];bag[0] = bag.last();bag[bag.lastIndex] = a}};return bag.removeAt(bag.lastIndex).also {last = it}}
}
/** Cubic-bezier(.76,0,.24,1), shared with the board's per-action timing. */
private fun inout(t: Float): Float {if(t<=0f)return 0f;if(t>=1f)return 1f;var lo=0f;var hi=1f;repeat(18) {val u=(lo+hi)/2;val x=3*(1-u)*(1-u)*u*.76f+3*(1-u)*u*u*.24f+u*u*u;if(x<t)lo=u else hi=u};val u=(lo+hi)/2;return 3*(1-u)*u*u+u*u*u}
fun mascotPose(action: MascotAction,milliseconds: Float,from: MascotPose = MascotPose(),direction: Float = 1f): MascotPose {
    fun frames(start: Float,vararg values: Float,ms: Int=action.duration,delay: Int=0): Float {
        val t=((milliseconds-delay)/ms).coerceIn(0f,1f);val p=inout(t)*(values.size);val i=floor(p).toInt().coerceAtMost(values.lastIndex);val a=if(i==0)start else values[i-1];val b=values[i];return a+(b-a)*(p-i).coerceIn(0f,1f)
    }
    fun settle(start: Float,neutral: Float=0f)=frames(start,neutral,ms=360)
    fun wag(amp: Float,ms: Int=920)=frames(from.tail,-amp,amp*.7f,-amp*.45f,amp*.2f,0f,ms=ms)
    val double = action in listOf(MascotAction.Ears,MascotAction.Stretch)
    val blink = if(action in listOf(MascotAction.Curious,MascotAction.Ears,MascotAction.Wave,MascotAction.Stretch,MascotAction.Celebrate)) {
        if(double) frames(from.eye,.1f,1f,.1f,1f,ms=440,delay=300) else frames(from.eye,.1f,1f,ms=220,delay=300)
    } else settle(from.eye,1f)
    val earAmp = when(action) {MascotAction.Curious,MascotAction.Stretch -> 7f;MascotAction.Ears -> 17f;MascotAction.Wave -> 6f;MascotAction.Celebrate -> 10f;else -> 0f}
    var pose=MascotPose(bodyWidth=settle(from.bodyWidth,1f),bodyY=settle(from.bodyY),headX=settle(from.headX),headY=settle(from.headY),head=settle(from.head),tail=settle(from.tail),leftEar=frames(from.leftEar,earAmp,-2f,0f,ms=800,delay=65),rightEar=frames(from.rightEar,-earAmp,2f,0f,ms=820,delay=105),paw=settle(from.paw),gaze=settle(from.gaze),eye=blink)
    pose=when(action) {
        MascotAction.Curious -> pose.copy(head=frames(from.head,-10f,-10f,3f,0f),headX=frames(from.headX,-1f,-1f,0f,0f),headY=frames(from.headY,-1f,-1f,0f,0f))
        MascotAction.Glance -> pose.copy(head=frames(from.head,direction*6,direction*6,0f),headX=frames(from.headX,direction*4,direction*4,0f),gaze=frames(from.gaze,direction*1.5f,direction*1.5f,0f),tail=wag(9f))
        MascotAction.Ears -> pose.copy(head=frames(from.head,3f,-2f,0f),headY=frames(from.headY,-2f,0f,0f))
        MascotAction.Sniff -> pose.copy(head=frames(from.head,-3f,-5f,-3f,-4f,0f),headX=frames(from.headX,0f,1f,-1f,1f,0f),headY=frames(from.headY,3f,5f,3f,5f,0f),tail=wag(10f,1100))
        MascotAction.Wave -> pose.copy(paw=frames(from.paw,-82f,-104f,-82f,-99f,0f,ms=1200),head=frames(from.head,-6f,-6f,2f,0f),tail=wag(22f,1150))
        MascotAction.Stretch -> pose.copy(bodyWidth=frames(from.bodyWidth,.97f,.97f,1f),bodyY=frames(from.bodyY,-2f,-2f,0f),head=frames(from.head,3f,3f,0f),headY=frames(from.headY,-2f,-2f,0f))
        MascotAction.Celebrate -> {
            // One sampled spring after the squash/hop. Width × height remains 1.
            val t=milliseconds;val w=when {t<90 -> from.bodyWidth+(1.045f-from.bodyWidth)*(t/90).coerceIn(0f,1f);t<220 -> 1.045f+(.985f-1.045f)*((t-90)/130);t<340 -> .985f+(1.026f-.985f)*((t-220)/120);else -> {val seconds=(t-340)/1000;val omega=2*PI/.32;val damping=.70;val decay=exp(-damping*omega*seconds);val phase=omega*sqrt(1-damping*damping);(1+.026*decay*(cos(phase*seconds)+damping/sqrt(1-damping*damping)*sin(phase*seconds))).toFloat()}}
            pose.copy(bodyWidth=if(t>=action.duration)1f else w,bodyY=frames(from.bodyY,2f,-7f,0f,ms=340),head=frames(from.head,-8f,2f,0f,ms=850),tail=wag(25f,1000))
        }
        MascotAction.Rest -> MascotPose(bodyWidth=settle(from.bodyWidth,1f),bodyY=settle(from.bodyY),headX=settle(from.headX),headY=settle(from.headY),head=settle(from.head),tail=settle(from.tail),leftEar=settle(from.leftEar),rightEar=settle(from.rightEar),paw=settle(from.paw),gaze=settle(from.gaze),eye=settle(from.eye,1f))
    }
    return if(milliseconds >= action.duration+150) MascotPose() else pose
}
