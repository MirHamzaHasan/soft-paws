"""Original 60 fps character motion; values use Rive's editor units.

Positions are offsets from the imported neutral rig. Scale values are percentages,
rotation is degrees. Every clip keys the same channels and rests before its exit,
so the controller can blend any interrupted action from its current pose.
"""

FPS = 60
CURVES = {
    'soft': (0.76, 0, 0.24, 1),
    'touch': (0.23, 1, 0.32, 1),
    'arrive': (0.16, 1, 0.3, 1),
}
CHANNELS = {
    'Dog': ('x', 'y', 'r', 'sx', 'sy'),
    'Torso': ('sx', 'sy'),
    'Head': ('x', 'y', 'r', 'sx', 'sy'),
    'LeftEar': ('r',), 'RightEar': ('r',),
    'LeftPaw': ('r', 'y'), 'RightPaw': ('r', 'y'),
    'LeftEye': ('sy',), 'RightEye': ('sy',),
    'LeftGaze': ('x', 'y'), 'RightGaze': ('x', 'y'),
    'LeftBrow': ('y', 'r'), 'RightBrow': ('y', 'r'),
    'Muzzle': ('y', 'sx', 'sy'), 'Smile': ('sy', 'opacity'),
    'Tongue': ('y',), 'Tag': ('r',), 'Tail': ('r',), 'RightPads': ('opacity',),
}
PIVOTS = {
    'Dog': (320, 564), 'Torso': (320, 548), 'Head': (320, 356),
    'LeftEar': (230, 163), 'RightEar': (411, 164),
    'LeftPaw': (270, 428), 'RightPaw': (373, 429),
    'Collar': (320, 374), 'Tag': (324, 379), 'Muzzle': (320, 291),
    'LeftEye': (272, 227), 'RightEye': (368, 227),
    'LeftGaze': (272, 227), 'RightGaze': (368, 227),
    'Smile': (320, 316), 'Tongue': (320, 337),
    'LeftBrow': (270, 187), 'RightBrow': (370, 187),
}
KEYS = dict(x=13, y=14, r=15, sx=16, sy=17, opacity=18)
TRIGGERS = {'Hello':'hello', 'Curious':'curious', 'Saved':'saved',
            'Sleepy':'sleepy', 'Sniff':'sniff', 'Ear perk':'ears'}
DURATIONS = {'Idle':6, 'Hello':2.4, 'Curious':2.8, 'Saved':2.2,
             'Sleepy':3.4, 'Sniff':2.4, 'Ear perk':2.4}


def clips():
    result = {}
    def clip(name):
        tracks = {}
        result[name] = {'duration':DURATIONS[name], 'tracks':tracks}
        end = round(DURATIONS[name]*FPS)
        def track(part, prop, points, curve='soft'):
            base = 100 if prop in ('sx','sy','opacity') else 0
            values = {0:base, end:base}
            values.update(dict(points))
            tracks[part+'.'+prop] = {'curve':curve,'keys':sorted(values.items())}
        return track
    def volume(track, points, curve='soft'):
        track('Dog','sy',points,curve)
        track('Dog','sx',[(f,10000/v) for f,v in points],curve)
    def blink(track, frame, close=5):
        for part,delay in [('LeftEye',0),('RightEye',1)]:
            track(part,'sy',[(frame+delay,100),(frame+5+delay,close),
                              (frame+8+delay,close),(frame+15+delay,100)],'touch')

    t=clip('Idle')
    volume(t,[(0,100),(90,101.0),(180,100),(270,101.0),(360,100)])
    t('Head','r',[(0,0),(100,-.8),(180,0),(270,.7),(360,0)])
    t('Head','y',[(0,0),(90,-1.2),(180,0),(270,-1.2),(360,0)])
    for part,delay,sign in [('LeftEar',0,1),('RightEar',3,-1)]:
        t(part,'r',[(0,0),(100+delay,sign*.9),(180+delay,0),(280+delay,-sign*.7),(350,0)])
    # Two deliberately separated blinks; no constant tail oscillation.
    for part,delay in [('LeftEye',0),('RightEye',1)]:
        t(part,'sy',[(0,100),(108+delay,100),(113+delay,5),(116+delay,5),(123+delay,100),
                     (282+delay,100),(287+delay,5),(290+delay,5),(297+delay,100)],'touch')
    t('Tail','r',[(0,0),(192,0),(204,-8),(219,7),(234,-6),(247,2),(265,0)])
    t('Tongue','y',[(0,0),(90,1),(180,0),(270,1),(360,0)])
    t('Tag','r',[(0,0),(110,1),(190,0),(290,-1),(350,0)])

    t=clip('Hello')
    volume(t,[(0,100),(8,97.5),(21,101.6),(37,99.6),(55,100),(132,100)],'touch')
    t('Dog','y',[(0,0),(9,1),(22,-4),(44,0),(132,0)],'touch')
    t('Head','r',[(0,0),(20,-6),(42,-4),(80,-2),(119,0)])
    t('RightPaw','r',[(0,0),(7,3),(23,-103),(35,-120),(48,-98),(60,-118),(73,-101),(102,0),(132,0)],'touch')
    t('RightPaw','y',[(0,0),(25,-8),(75,-8),(104,0)])
    t('RightPads','opacity',[(0,0),(12,0),(23,100),(78,100),(100,0),(144,0)],'touch')
    t('LeftEar','r',[(0,0),(24,-8),(44,5),(70,-2),(110,0)],'touch')
    t('RightEar','r',[(0,0),(24,9),(44,-6),(70,2),(110,0)],'touch')
    t('Tail','r',[(0,0),(18,-14),(31,14),(44,-13),(57,13),(70,-11),(83,7),(108,0)],'touch')
    for p in ('LeftBrow','RightBrow'):t(p,'y',[(0,0),(18,-4),(74,-4),(112,0)])
    t('Smile','sy',[(0,100),(20,112),(78,112),(118,100)])
    t('Tongue','y',[(0,0),(23,3),(42,1),(65,3),(95,0)])
    t('Tag','r',[(0,0),(18,8),(36,-6),(57,3),(91,0)],'touch')
    blink(t,100)

    t=clip('Curious')
    t('Head','r',[(0,0),(34,-13),(83,-13),(132,2),(156,0)])
    t('Head','y',[(0,0),(36,2),(85,2),(145,0)])
    t('Dog','x',[(0,0),(36,-3),(88,-3),(150,0)])
    t('LeftEar','r',[(0,0),(42,-10),(90,-10),(140,2),(158,0)])
    t('RightEar','r',[(0,0),(42,12),(90,12),(140,-2),(158,0)])
    for p in ('LeftGaze','RightGaze'):
        t(p,'x',[(0,0),(25,5),(90,5),(145,0)])
        t(p,'y',[(0,0),(25,-2),(90,-2),(145,0)])
    t('RightBrow','y',[(0,0),(24,-7),(91,-7),(146,0)])
    t('LeftBrow','r',[(0,0),(24,-5),(91,-5),(146,0)])
    t('Smile','opacity',[(0,100),(25,0),(104,0),(150,100)])
    t('Tail','r',[(0,0),(90,0),(108,-7),(123,4),(145,0)])

    t=clip('Saved')
    volume(t,[(0,100),(8,96),(20,103),(34,97),(45,101),(60,100),(120,100)],'touch')
    t('Dog','y',[(0,0),(8,1),(20,-19),(34,0),(45,-3),(60,0),(120,0)],'touch')
    t('Head','r',[(0,0),(20,-4),(35,2),(61,0)])
    t('LeftEar','r',[(0,0),(23,-14),(40,9),(57,-3),(80,0)],'touch')
    t('RightEar','r',[(0,0),(23,16),(40,-10),(57,3),(80,0)],'touch')
    for p,sign in [('LeftPaw',1),('RightPaw',-1)]:t(p,'r',[(0,0),(19,sign*5),(38,-sign*2),(63,0)],'touch')
    t('Tail','r',[(0,0),(15,-16),(28,15),(41,-15),(54,13),(67,-10),(80,5),(100,0)],'touch')
    t('Tag','r',[(0,0),(23,12),(39,-9),(57,4),(80,0)],'touch')
    for p in ('LeftEye','RightEye'):t(p,'sy',[(0,100),(23,100),(29,12),(39,12),(52,100)],'touch')
    t('Smile','sy',[(0,100),(20,120),(60,120),(98,100)])
    t('Tongue','y',[(0,0),(25,4),(46,2),(64,4),(95,0)])

    t=clip('Sleepy')
    volume(t,[(0,100),(68,101.4),(136,100),(192,100)])
    t('Head','r',[(0,0),(64,7),(126,7),(182,0)])
    t('Head','y',[(0,0),(64,4),(126,4),(182,0)])
    for p in ('LeftEye','RightEye'):t(p,'sy',[(0,100),(55,30),(83,30),(98,5),(135,5),(171,100),(192,100)])
    t('Smile','opacity',[(0,100),(35,0),(144,0),(184,100)])
    t('LeftEar','r',[(0,0),(70,3),(132,3),(189,0)])
    t('RightEar','r',[(0,0),(70,-4),(132,-4),(189,0)])

    t=clip('Sniff')
    t('Head','y',[(0,0),(28,7),(88,7),(130,0)])
    t('Head','sx',[(0,100),(28,102),(88,102),(130,100)])
    t('Head','sy',[(0,100),(28,99),(88,99),(130,100)])
    for p in ('LeftGaze','RightGaze'):t(p,'y',[(0,0),(24,4),(92,4),(130,0)])
    t('Muzzle','y',[(0,0),(28,0),(36,-3),(44,1),(54,-3),(62,1),(72,-2),(84,0),(130,0)],'touch')
    t('Muzzle','sx',[(0,100),(36,102),(44,100),(54,102),(62,100),(72,101),(84,100)],'touch')
    t('Smile','opacity',[(0,100),(24,0),(98,0),(131,100)])
    t('Tail','r',[(0,0),(47,-8),(64,6),(83,-3),(110,0)])

    t=clip('Ear perk')
    t('LeftEar','r',[(0,0),(21,-14),(42,-7),(71,-11),(110,0)])
    t('RightEar','r',[(0,0),(25,17),(45,10),(74,14),(114,0)])
    t('Head','y',[(0,0),(22,-3),(76,-3),(119,0)])
    for p in ('LeftBrow','RightBrow'):t(p,'y',[(0,0),(20,-5),(78,-5),(122,0)])
    for p in ('LeftGaze','RightGaze'):t(p,'x',[(0,0),(26,-5),(64,-5),(84,3),(120,0)])
    t('Tag','r',[(0,0),(38,3),(75,-2),(113,0)])
    blink(t,116)
    return result


def keyframes(clip, rig):
    """Resolve named tracks to ids and neutral coordinates in editor units.

    The installed MCP converts inspector percentages/degrees to runtime units.
    These units are verified against actual exported-player frames.
    """
    end = round(clip['duration']*FPS)
    frames = []
    for part,properties in CHANNELS.items():
        for prop in properties:
            key = KEYS[prop]
            neutral = rig[part]['values'][str(key)]
            default = 0 if part=='RightPads' else (100 if prop in ('sx','sy','opacity') else 0)
            track = clip['tracks'].get(part+'.'+prop, {'curve':'soft','keys':[(0,default),(end,default)]})
            x1,y1,x2,y2 = CURVES[track['curve']]
            for frame,value in track['keys']:
                if prop in ('x','y','r'): value += neutral
                frames.append({'objectId':rig[part]['id'],'propertyKey':key,'frame':frame,'value':round(value,6),
                               'interpolationType':'cubic','cubicParams':dict(x1=x1,y1=y1,x2=x2,y2=y2)})
    return frames
