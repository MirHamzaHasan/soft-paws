"""Original notebook puppy motion, authored into a real Rive controller at 60 fps."""
FPS=60
KEYS=dict(x=13,y=14,r=15,sx=16,sy=17,opacity=18)
PIVOTS={'Companion':(244,507),'Tail':(346,421),'Torso':(244,472),
        'Head':(242,326),'LeftEar':(164,191),'RightEar':(321,188),
        'LeftEye':(194,227),'RightEye':(292,227),'Muzzle':(242,281),
        'Collar':(242,340),'Tag':(244,345),'Notebook':(244,505),
        'LeftPage':(244,399),'RightPage':(244,399),'Bookmark':(317,387),
        'LeftPaw':(158,363),'RightPaw':(319,364)}
CHANNELS={'Companion':('y','sx','sy'),'Tail':('r',),'Torso':('sx','sy'),
          'Head':('x','y','r'),'LeftEar':('r',),'RightEar':('r',),
          'LeftEye':('sy',),'RightEye':('sy',),'Muzzle':('y',),
          'Tag':('r',),'Notebook':('r','y'),'RightPage':('sx','r'),
          'Bookmark':('y','r'),'LeftPaw':('r','y'),'RightPaw':('r','y','x')}
DURATIONS={'Idle':6,'Hello':2.4,'Curious':2.8}
TRIGGERS={'Hello':'hello','Curious':'curious'}
CURVES={'soft':(.76,0,.24,1),'touch':(.23,1,.32,1),'arrive':(.16,1,.3,1)}

def clips():
    result={}
    def clip(name):
        tracks={};end=round(DURATIONS[name]*FPS)
        result[name]={'duration':DURATIONS[name],'tracks':tracks}
        def track(part,prop,points,curve='soft'):
            base=100 if prop in ('sx','sy','opacity') else 0
            values={0:base,end:base};values.update(dict(points))
            tracks[part+'.'+prop]={'curve':curve,'keys':sorted(values.items())}
        return track
    def blink(t,start):
        for part,delay in [('LeftEye',0),('RightEye',1)]:
            t(part,'sy',[(start+delay,100),(start+5+delay,8),(start+8+delay,8),(start+15+delay,100)],'touch')
    t=clip('Idle')
    t('Torso','sy',[(0,100),(95,101.1),(180,100),(275,101.1),(360,100)])
    t('Torso','sx',[(0,100),(95,99.4),(180,100),(275,99.4),(360,100)])
    t('Head','y',[(0,0),(95,-1.1),(180,0),(275,-1.1),(360,0)])
    blink(t,145)
    t=clip('Hello')
    t('Head','r',[(0,0),(30,-7),(66,-7),(112,0)])
    t('Head','y',[(0,0),(30,-3),(68,-3),(116,0)])
    t('LeftEar','r',[(0,0),(31,-6),(47,2),(75,-2),(115,0)])
    t('RightEar','r',[(0,0),(34,8),(53,-3),(80,2),(118,0)])
    t('Tail','r',[(0,0),(22,-10),(39,9),(56,-9),(73,7),(90,-3),(116,0)])
    t('RightPaw','r',[(0,0),(30,-10),(68,-10),(108,0)])
    t('RightPaw','y',[(0,0),(30,-6),(68,-6),(108,0)])
    t('Notebook','r',[(0,0),(34,-1.3),(74,-1.3),(118,0)])
    t('RightPage','sx',[(0,100),(34,73),(64,100),(112,100)],'arrive')
    t('Bookmark','r',[(0,0),(39,-8),(61,4),(92,0)])
    t('Tag','r',[(0,0),(30,7),(51,-4),(80,2),(112,0)])
    blink(t,95)
    t=clip('Curious')
    t('Head','r',[(0,0),(30,8),(91,8),(143,0)])
    t('Head','y',[(0,0),(30,5),(90,5),(144,0)])
    t('LeftEar','r',[(0,0),(34,5),(94,5),(144,0)])
    t('RightEar','r',[(0,0),(37,-5),(95,-5),(147,0)])
    t('RightPaw','r',[(0,0),(26,-15),(49,-25),(78,-10),(126,0)])
    t('RightPaw','x',[(0,0),(30,-8),(58,-19),(95,-7),(132,0)])
    t('RightPaw','y',[(0,0),(30,-11),(58,-17),(95,-6),(132,0)])
    t('RightPage','sx',[(0,100),(25,100),(55,15),(84,100),(142,100)],'arrive')
    t('RightPage','r',[(0,0),(55,-7),(84,0),(142,0)],'arrive')
    t('Bookmark','r',[(0,0),(45,-10),(66,6),(88,-3),(116,0)])
    t('Bookmark','y',[(0,0),(50,-7),(85,0),(142,0)])
    t('Tail','r',[(0,0),(74,-8),(92,7),(110,-5),(140,0)])
    t('Notebook','y',[(0,0),(42,-1),(90,-1),(142,0)])
    blink(t,124)
    # Every clip writes every channel, so interruption blends from one live pose.
    for name,data in result.items():
        end=round(data['duration']*FPS)
        for part,props in CHANNELS.items():
            for prop in props:
                key=part+'.'+prop
                if key not in data['tracks']:
                    value=100 if prop in ('sx','sy','opacity') else 0
                    data['tracks'][key]={'curve':'soft','keys':[(0,value),(end,value)]}
    return result

def keyframes(clip,rig):
    result=[]
    for channel,track in clip['tracks'].items():
        part,prop=channel.split('.');key=KEYS[prop]
        base=rig[part]['values'][str(key)]
        for frame,value in track['keys']:
            absolute=base*value/100 if prop in ('sx','sy','opacity') else base+value
            x1,y1,x2,y2=CURVES[track['curve']]
            result.append({'objectId':rig[part]['id'],'propertyKey':key,'frame':frame,'value':round(absolute,6),
                           'interpolationType':'cubic','cubicParams':dict(x1=x1,y1=y1,x2=x2,y2=y2)})
    return result
