"""Original Soft Paws tabby. Calm breathing, ear attention and bounded greetings."""
FPS=60
KEYS=dict(x=13,y=14,r=15,sx=16,sy=17,opacity=18)
PIVOTS={'Companion':(241,465),'Tail':(332,399),'Torso':(241,447),'Head':(241,328),'LeftEar':(165,177),'RightEar':(320,177),'LeftEye':(184,226),'RightEye':(300,226),'Muzzle':(241,279),'Collar':(241,346),'Tag':(241,352),'LeftPaw':(186,417),'RightPaw':(313,417)}
CHANNELS={'Companion':('y','sx','sy'),'Tail':('r',),'Torso':('sx','sy'),'Head':('y','r'),'LeftEar':('r',),'RightEar':('r',),'LeftEye':('sy',),'RightEye':('sy',),'Muzzle':('y',),'Tag':('r',),'LeftPaw':('r',),'RightPaw':('r','y')}
DURATIONS={'Idle':7,'Hello':2.4,'Curious':2.8,'Saved':2.2}
TRIGGERS={'Hello':'hello','Curious':'curious','Saved':'saved'}
CURVES={'soft':(.76,0,.24,1),'touch':(.23,1,.32,1),'arrive':(.16,1,.3,1)}
def clips():
    result={}
    def start(name):
        tracks={};end=round(DURATIONS[name]*FPS);result[name]={'duration':DURATIONS[name],'tracks':tracks}
        def track(part,prop,points,curve='soft'):
            base=100 if prop in ('sx','sy','opacity') else 0
            values={0:base,end:base};values.update(dict(points));tracks[part+'.'+prop]={'curve':curve,'keys':sorted(values.items())}
        return track
    def blink(t,at,slow=1):
        for p in ('LeftEye','RightEye'):t(p,'sy',[(at,100),(at+6*slow,9),(at+10*slow,9),(at+18*slow,100)],'touch')
    t=start('Idle');t('Torso','sy',[(100,101.2),(210,100),(310,101.2)]);t('Torso','sx',[(100,99.4),(210,100),(310,99.4)]);t('Head','y',[(100,-1.5),(210,0),(310,-1.5)]);t('Tail','r',[(110,-3),(210,0),(320,3)]);blink(t,170)
    t=start('Hello');t('Head','r',[(30,-8),(70,-8),(120,0)]);t('LeftEar','r',[(28,-7),(55,2),(100,0)]);t('RightPaw','r',[(26,-18),(49,-28),(72,-14),(115,0)]);t('RightPaw','y',[(28,-8),(72,-8),(115,0)]);t('Tail','r',[(25,-9),(52,5),(82,-6),(120,0)]);blink(t,90)
    t=start('Curious');t('Head','r',[(35,10),(95,10),(145,0)]);t('RightEar','r',[(30,-12),(92,-12),(145,0)]);t('LeftEar','r',[(37,5),(95,5),(148,0)]);t('Tail','r',[(60,-6),(110,4),(145,0)]);blink(t,112)
    t=start('Saved');t('Head','y',[(28,5),(58,-3),(100,0)]);t('Tag','r',[(30,10),(55,-7),(85,3),(110,0)]);t('Tail','r',[(28,-8),(51,7),(76,-5),(110,0)]);blink(t,28,2)
    for name,data in result.items():
        end=round(data['duration']*FPS)
        for part,props in CHANNELS.items():
            for prop in props:
                key=part+'.'+prop
                if key not in data['tracks']:
                    value=100 if prop in ('sx','sy','opacity') else 0;data['tracks'][key]={'curve':'soft','keys':[(0,value),(end,value)]}
    return result
def keyframes(clip,rig):
    result=[]
    for channel,track in clip['tracks'].items():
        part,prop=channel.split('.');key=KEYS[prop];base=rig[part]['values'][str(key)]
        for frame,value in track['keys']:
            absolute=base*value/100 if prop in ('sx','sy','opacity') else base+value
            x1,y1,x2,y2=CURVES[track['curve']]
            result.append({'objectId':rig[part]['id'],'propertyKey':key,'frame':frame,'value':round(absolute,6),'interpolationType':'cubic','cubicParams':dict(x1=x1,y1=y1,x2=x2,y2=y2)})
    return result
