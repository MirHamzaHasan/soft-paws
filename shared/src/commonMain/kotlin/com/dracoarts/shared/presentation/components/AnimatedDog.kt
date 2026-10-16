package com.dracoarts.shared.presentation.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.semantics.*
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.presentation.companion.*
import kotlinx.coroutines.delay
import kotlin.random.Random

val LocalMascotForeground=staticCompositionLocalOf {true}
private val dogPaths by lazy { GeneratedDogVector.parts.flatMap { part -> when {
    part.path.startsWith("M77 124") -> listOf(DogVectorPart("M77 124c-4 10-5 29-4 39-10 1-15 6-12 12 2 4 19 5 25 1 4-3 2-31 4-46","dog-fur",0f,1f,listOf("mascot-paw-left")),DogVectorPart("M108 126c3 13 2 25 2 37-8 1-12 7-9 12 3 4 20 5 25 0 3-4-3-38-7-48","dog-fur",0f,1f,listOf("mascot-paw-right")))
    part.path.startsWith("M64 173") -> listOf(DogVectorPart("M64 173h18","dog-ear",2f,.55f,listOf("mascot-paw-left")),DogVectorPart("M105 173h18","dog-ear",2f,.55f,listOf("mascot-paw-right")))
    else -> listOf(part)
} }.map {it to PathParser().parsePathString(it.path).toPath()} }
private data class MascotRequest(val action: MascotAction,val serial: Int,val direction: Float=1f)

/** One pose clock owns every part; a save/tap interrupts from its visible pose. */
@Composable
fun AnimatedDog(modifier: Modifier=Modifier,reactionId: String?=null,onReacted: (String)->Unit={},idle: Boolean=true,afterLanding: Boolean=false,cropped: Boolean=false,greetingLabel: String?=null) {
    val motion=LocalBarkMotion.current;val restoring=LocalBoardRestoring.current;val colors=LocalBoardColors.current
    val foreground=LocalMascotForeground.current;val window=LocalWindowInfo.current.containerSize
    var visible by remember {mutableStateOf(true)};var request by remember {mutableStateOf(MascotRequest(MascotAction.Rest,0))}
    var from by remember {mutableStateOf(MascotPose())};val clock=remember {Animatable(10000f)};val entry=remember {Animatable(1f)}
    val consumed by rememberUpdatedState(onReacted);val bag=remember {MascotShuffle()}
    val running=foreground&&visible&&!motion.reduced
    var playingSerial by remember {mutableIntStateOf(-1)}
    val pose by remember(running) {derivedStateOf {if(!running)MascotPose() else if(playingSerial!=request.serial)from else mascotPose(request.action,clock.value,from,request.direction)}}
    fun play(action: MascotAction) {from=pose;request=MascotRequest(action,request.serial+1,if(Random.nextBoolean())1f else -1f)}
    LaunchedEffect(motion.reduced,motion.replay,restoring,foreground) {
        if(motion.reduced||restoring||!foreground)entry.snapTo(1f) else {entry.snapTo(0f);delay(motion.milliseconds(140).toLong());entry.animateTo(1f,tween(motion.milliseconds(620),easing=CubicBezierEasing(.16f,1f,.3f,1f)))}
    }
    LaunchedEffect(request.serial,running,motion.speed) {
        if(!running){clock.snapTo(10000f);return@LaunchedEffect}
        clock.snapTo(0f);playingSerial=request.serial;clock.animateTo((request.action.duration+150).toFloat(),tween(motion.milliseconds(request.action.duration+150),easing=LinearEasing))
    }
    LaunchedEffect(reactionId,running) {
        val id=reactionId
        if(id==null) {if(request.action==MascotAction.Celebrate&&clock.value<request.action.duration)play(MascotAction.Rest);return@LaunchedEffect}
        if(motion.reduced){consumed(id);return@LaunchedEffect};if(!running)return@LaunchedEffect
        if(!afterLanding)delay(motion.milliseconds(if(entry.value<1f)820 else 640).toLong())
        play(MascotAction.Celebrate);delay(motion.milliseconds(MascotAction.Celebrate.duration+150).toLong());consumed(id)
    }
    LaunchedEffect(idle,running,motion.replay,request.serial) {
        if(!idle||!running)return@LaunchedEffect
        if(request.serial==0&&reactionId==null&&!restoring){delay(motion.milliseconds(760).toLong());play(MascotAction.Wave);return@LaunchedEffect}
        delay(motion.milliseconds(request.action.duration+150+4400+Random.nextInt(3001)).toLong())
        if(reactionId==null)play(bag.next())
    }
    val interaction=if(greetingLabel!=null)Modifier.semantics {contentDescription=greetingLabel;role=Role.Button}.clickable(onClickLabel=greetingLabel){if(running&&reactionId==null)play(MascotAction.Wave)} else Modifier.clearAndSetSemantics {}
    Canvas(modifier.then(interaction).onGloballyPositioned {coordinates ->val rect=coordinates.boundsInWindow();visible=rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<window.height&&rect.right>0&&rect.left<window.width}) {
        val p=pose;val viewWidth=if(cropped)144f else 180f;val viewHeight=if(cropped)180f else 190f;val unit=minOf(size.width/viewWidth,size.height/viewHeight)
        withTransform({translate((size.width-viewWidth*unit)/2-(if(cropped)24 else 0)*unit+10*unit*(1-entry.value),(size.height-viewHeight*unit)/2-(if(cropped)4 else 0)*unit+(6*(1-entry.value)+p.bodyY)*unit);scale(unit,unit,Offset.Zero);scale(p.bodyWidth,1/p.bodyWidth,Offset(90f,177f))}) {
            dogPaths.forEach {(part,path) ->withTransform({part.groups.forEach {group ->when(group) {
                "dog-character-head" -> {translate(p.headX,p.headY);rotate(p.head,Offset(94f,99f))}
                "dog-character-tail" ->rotate(p.tail,Offset(132f,146f))
                "dog-character-ear is-left" ->rotate(p.leftEar,Offset(61f,33f))
                "dog-character-ear is-right" ->rotate(p.rightEar,Offset(124f,30f))
                "mascot-paw-right" ->rotate(p.paw,Offset(115f,129f))
            }};if(part.path.startsWith("M73.8,51.0")){translate(p.gaze,0f);scale(1f,p.eye,Offset(77f,51f))};if(part.path.startsWith("M106.8,51.0")){translate(p.gaze,0f);scale(1f,p.eye,Offset(110f,51f))}}) {
                val color=colors.getValue(part.token);if(part.stroke>0)drawPath(path,color,alpha=entry.value*part.opacity,style=Stroke(part.stroke,cap=StrokeCap.Round)) else drawPath(path,color,alpha=entry.value*part.opacity)
            }}
        }
    }
}
