#!/usr/bin/env python3
"""Rebuild this Rive study through the desktop editor's official local MCP.

Open an empty, named Rive file, then use --seed. For the existing study use
--update-motion. No credentials, CLI installation or third-party server needed.
Only the dedicated study file may be changed. Never opens another Rive file.
"""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import urllib.request

from motion import CHANNELS, DURATIONS, FPS, KEYS, PIVOTS, TRIGGERS, clips, keyframes

ROOT = Path(__file__).resolve().parent
ARTBOARD = 'BarkLog Dog · Character Study'
CONTROLLER = 'Dog Controller'


class Rive:
    def __init__(self):
        self.headers = {'Content-Type':'application/json','Accept':'application/json, text/event-stream'}
        self.seq = 0
        self.rpc('initialize', {'protocolVersion':'2025-11-25','capabilities':{},'clientInfo':{'name':'BarkLog original mascot study','version':'1.0'}})
        self.rpc('notifications/initialized', notification=True)

    def rpc(self, method, params=None, notification=False):
        self.seq += 1
        payload = {'jsonrpc':'2.0','method':method}
        if not notification: payload['id'] = self.seq
        if params is not None: payload['params'] = params
        request = urllib.request.Request('http://127.0.0.1:9791/mcp',json.dumps(payload).encode(),self.headers)
        with urllib.request.urlopen(request,timeout=45) as response:
            if response.headers.get('Mcp-Session-Id'):
                self.headers['Mcp-Session-Id'] = response.headers['Mcp-Session-Id']
            raw = response.read()
        result = json.loads(raw) if raw else {}
        if 'error' in result: raise RuntimeError(result['error'])
        return result.get('result',{})

    def call(self, name, arguments=None):
        response = self.rpc('tools/call',{'name':name,'arguments':arguments or {}})
        text = next((c['text'] for c in response.get('content',[]) if c['type']=='text'),'')
        if response.get('isError') or text.startswith('Error:'): raise RuntimeError(text)
        result = json.loads(text)
        if result.get('success') is False: raise RuntimeError(result)
        return result

    def command(self, tool, command, data=None):
        arguments={'command':command}
        if data is not None:arguments['data']={command:data}
        return self.call(tool,arguments)

    def values(self, changes):
        result=self.call('set_property_values',{'propertyValues':changes})
        if result.get('errors'):raise RuntimeError(result)
        return result

    def export(self, destination):
        directory=str(destination.parent)
        options={'format':destination.suffix.lstrip('.'),'destination':directory}
        if options['format']=='rev':options['embed_assets']=True
        try:
            result=self.call('export_file',options)
        except RuntimeError as error:
            # Documented transport fallback; does not change the app sandbox.
            if 'Operation not permitted' not in str(error):raise
            result=self.call('export_file',{**options,'inline_base64':True})
        if 'data' in result:
            destination.write_bytes(base64.b64decode(result['data']))
        elif 'path' in result:
            written=Path(result['path'])
            if written!=destination:destination.write_bytes(written.read_bytes())
        else:raise RuntimeError('No runtime bytes or export path returned.')


def ensure_cancel_trigger(rive, machine_id):
    """Undo/cancellation blends to Idle rather than finishing a stale celebration."""
    vm=next(v for v in rive.command('viewmodel_editor','listViewModels')['viewModels'] if v['name']=='Dog')
    if not any(p['name']=='rest' for p in vm['viewModelProperties']):
        rive.command('viewmodel_editor','addProperties',{'viewModels':[{'viewModelId':vm['id'],'viewModelProperties':[{'name':'rest','propertyType':'trigger'}]}]})
        vm=next(v for v in rive.command('viewmodel_editor','listViewModels')['viewModels'] if v['name']=='Dog')
    trigger=next(p['id'] for p in vm['viewModelProperties'] if p['name']=='rest')
    layer=rive.command('animation_editor','queryStateMachine',{'stateMachineId':machine_id})['layers'][0]
    idle=next(s['id'] for s in layer['states'] if s.get('animationName')=='Idle')
    if not any(t['fromStateId']==layer['anyStateId'] and t['toStateId']==idle for t in layer['transitions']):
        rive.command('animation_editor','createTransitions',{'states':[{'id':layer['anyStateId'],'transitions':[{'to':idle}]}]})
    layer=rive.command('animation_editor','queryStateMachine',{'stateMachineId':machine_id})['layers'][0]
    transition=next(t for t in layer['transitions'] if t['fromStateId']==layer['anyStateId'] and t['toStateId']==idle)
    rive.values({transition['id']:{'158':180,'152':32}})
    if not transition['conditions']:
        rive.command('animation_editor','createConditions',{'transitions':[{'id':transition['id'],'conditions':[{'leftComparator':{'viewModelPropertyId':trigger}}]}]})


def normalize_rig(rive, objects, artboard_id):
    by_id={o['id']:o for o in objects}
    named={o['name']:o for o in objects if o['type']=='Node' and o['name'] in PIVOTS}
    if set(named)!=set(PIVOTS):raise RuntimeError('Expected named character parts are missing.')
    ids=[o['id'] for o in objects if o['type'] in ('Node','Shape')]
    values=rive.call('query_property_values',{'propertyKeys':{i:list(KEYS.values()) for i in ids}})['values']
    def absolute(i):
        if i==artboard_id:return (0,0)
        x,y=absolute(by_id[i]['parentId'])
        return x+values[i]['13'], y+values[i]['14']
    # The SVG importer centres groups on their bounds. Move origins to joints,
    # compensating direct children so their world positions never change.
    for name,(x,y) in PIVOTS.items():
        i=named[name]['id'];ax,ay=absolute(i);dx=x-ax;dy=y-ay
        changes={i:{'13':values[i]['13']+dx,'14':values[i]['14']+dy}}
        for child in objects:
            ci=child['id']
            if child['parentId']==i and ci in values:
                changes[ci]={'13':values[ci]['13']-dx,'14':values[ci]['14']-dy}
        rive.values(changes)
        for ci,props in changes.items():values[ci].update(props)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    choice=parser.add_mutually_exclusive_group(required=True)
    choice.add_argument('--seed',action='store_true',help='Build in an EMPTY named study file.')
    choice.add_argument('--update-motion',action='store_true',help='Replace this study’s named animation tracks.')
    args=parser.parse_args()
    rive=Rive();session=rive.call('session_info');name=session.get('activeFileName','')
    if not name or 'barklog' not in name.lower() or 'study' not in name.lower():
        raise RuntimeError('Open the dedicated, named BarkLog study file first.')
    if args.update_motion and (ROOT/'manifest.json').exists():
        expected=json.loads((ROOT/'manifest.json').read_text())['editorFile'].rstrip('/').split('/')[-1]
        if str(session.get('activeFileId'))!=expected:
            raise RuntimeError('Open the exact paid study linked in manifest.json; the other file was preserved.')
    artboards=rive.call('list_artboards').get('artboards',[])
    if args.seed:
        if artboards:raise RuntimeError('--seed requires an empty file. Existing artboards were preserved.')
        board=rive.command('open_file_editor','createArtboard',[{'name':ARTBOARD,'width':640,'height':640}])['artboards'][0]
        artboard_id=board['id']
        tree=rive.call('get_artboard_hierarchy',{'depth':2})['objects']
        fill_ids={o['id'] for o in tree if 'Fill' in o['types']}
        for color in tree:
            if 'SolidColor' in color['types'] and any(color['id'] in o.get('children',[]) and o['id'] in fill_ids for o in tree):
                rive.values({color['id']:{'37':'#00282828'}})
        encoded=base64.b64encode((ROOT/'dog.svg').read_bytes()).decode()
        asset=rive.call('upload_asset',{'file':'data:image/svg+xml;name=dog.svg;base64,'+encoded,'name':'BarkLog Spaniel · Original Vector'})['asset']
        rive.command('assets_tool','addSvgInstance',{'assetId':asset['id'],'parentId':artboard_id,'name':'BarkLog Spaniel','x':0,'y':0})
        normalize_rig(rive,rive.call('find_objects',{})['objects'],artboard_id)
        paw=next(o for o in rive.call('find_objects',{})['objects'] if o['name']=='RightPaw')
        encoded=base64.b64encode((ROOT/'paw-pads.svg').read_bytes()).decode()
        asset=rive.call('upload_asset',{'file':'data:image/svg+xml;name=paw-pads.svg;base64,'+encoded,'name':'Greeting paw pads'})['asset']
        pads=rive.command('assets_tool','addSvgInstance',{'assetId':asset['id'],'parentId':paw['id'],'name':'RightPads','x':-13,'y':95})
        # This editor version accepts addSvgInstance x/y but leaves them at zero;
        # write the local transform explicitly and verify in the exported player.
        rive.values({pads['nodeId']:{'13':-13,'14':95,'18':0}})
        rive.call('reorder_objects',{'operations':[{'objectId':pads['nodeId'],'order':'sendToFront'}]})
    else:
        matches=[a for a in artboards if a['name']==ARTBOARD]
        if len(matches)!=1:raise RuntimeError('Open the original study artboard; no other file was changed.')
        artboard_id=matches[0]['id']
        rive.command('open_file_editor','focusArtboard',{'artboardId':artboard_id})
    objects=rive.call('find_objects',{})['objects']
    parts={o['name']:o for o in objects if o['type']=='Node' and o['name'] in CHANNELS}
    if set(parts)!=set(CHANNELS):raise RuntimeError('Character rig is incomplete.')
    values=rive.call('query_property_values',{'propertyKeys':{o['id']:list(KEYS.values()) for o in parts.values()}})['values']
    rig={n:{'id':o['id'],'values':values[o['id']]} for n,o in parts.items()}
    animation_list=rive.command('animation_editor','listLinearAnimations')['linearAnimations']
    if args.seed:
        rive.command('animation_editor','renameAnimations',{'animations':[{'animationId':animation_list[0]['id'],'name':'Idle'}]})
    animations={a['name']:a['id'] for a in rive.command('animation_editor','listLinearAnimations')['linearAnimations']}
    missing=[{'name':n,'duration':d} for n,d in DURATIONS.items() if n not in animations]
    if missing:rive.command('animation_editor','createLinearAnimations',{'linearAnimations':missing})
    animations={a['name']:a['id'] for a in rive.command('animation_editor','listLinearAnimations')['linearAnimations']}
    for name,clip in clips().items():
        aid=animations[name]
        rive.values({aid:{'56':FPS,'57':round(clip['duration']*FPS),'59':1 if name=='Idle' else 0}})
        old=rive.command('animation_editor','queryKeyFrames',{'animationIds':[aid]})['keyframes'].get(aid,[])
        if old:rive.command('animation_editor','modifyKeyFrames',{'animationId':aid,'delete':[k['keyframeId'] for k in old]})
        frames=keyframes(clip,rig)
        result=rive.command('animation_editor','modifyKeyFrames',{'animationId':aid,'add':frames})
        assert len(result['added'])==len(frames)
        print(name, len(frames),'keyframes',flush=True)
    machines=rive.command('animation_editor','listStateMachines')['stateMachines']
    machine=next((m for m in machines if m['name']==CONTROLLER),next(m for m in machines if m['isDefault']))
    mid=machine['id']
    rive.command('animation_editor','renameAnimations',{'animations':[{'animationId':mid,'name':CONTROLLER}]})
    def controller():return rive.command('animation_editor','queryStateMachine',{'stateMachineId':mid})
    layer=controller()['layers'][0]
    missing=[{'name':n,'linearAnimationName':n,'x':400+(i%3)*240,'y':170+(i//3)*170} for i,n in enumerate(TRIGGERS) if not any(st.get('animationName')==n for st in layer['states'])]
    if missing:rive.command('animation_editor','createStates',{'layerId':layer['layerId'],'states':missing})
    layer=controller()['layers'][0];states={st.get('animationName'):st['id'] for st in layer['states'] if st['type']=='animation'}
    existing={(t['fromStateId'],t['toStateId']) for t in layer['transitions']}
    edges=[(layer['anyStateId'],states[n]) for n in TRIGGERS]+[(states[n],states['Idle']) for n in TRIGGERS]
    missing=[{'id':a,'transitions':[{'to':b}]} for a,b in edges if (a,b) not in existing]
    if missing:rive.command('animation_editor','createTransitions',{'states':missing})
    models=rive.command('viewmodel_editor','listViewModels')['viewModels']
    vm=next((v for v in models if v['name']=='Dog'),None)
    if vm is None:
        vm=rive.command('viewmodel_editor','createViewModels',{'viewModels':[{'name':'Dog','viewModelProperties':[{'name':n,'propertyType':'trigger'} for n in TRIGGERS.values()]}]})['viewModels'][0]
        rive.command('viewmodel_editor','createViewModelInstances',{'viewModelId':vm['id'],'instances':[{'name':'Default'}]})
    props={p['name']:p['id'] for p in vm['viewModelProperties']}
    rive.command('viewmodel_editor','bindViewModelToArtboard',{'artboardId':artboard_id,'viewModelId':vm['id']})
    layer=controller()['layers'][0];state_names={st['id']:st.get('animationName') for st in layer['states']};changes={};conditions=[]
    for transition in layer['transitions']:
        tid=transition['id'];a,b=transition['fromStateId'],transition['toStateId']
        if a==layer['anyStateId'] and state_names.get(b) in TRIGGERS:
            changes[tid]={'158':200,'152':32}
            if not transition['conditions']:conditions.append({'id':tid,'conditions':[{'leftComparator':{'viewModelPropertyId':props[TRIGGERS[state_names[b]]]}}]})
        elif b==states['Idle'] and state_names.get(a) in TRIGGERS:
            # Runtime flag definitions: EarlyExit=32, ExitTime=4. Exit in ms.
            changes[tid]={'158':180,'152':36,'160':round(DURATIONS[state_names[a]]*1000)}
    rive.values(changes)
    if conditions:rive.command('animation_editor','createConditions',{'transitions':conditions})
    # Hosts supply one accessible greeting action. Decorative instances must not
    # retain a second, unlabeled head-click listener inside the exported file.
    listeners=[l['id'] for l in controller().get('listeners',[]) if l.get('name')=='Pet the dog']
    if listeners:rive.call('delete_objects',{'objectIds':listeners})
    ensure_cancel_trigger(rive,mid)
    rive.export(ROOT/'spaniel.riv')
    rive.export(ROOT/'spaniel.rev')
    session=rive.call('session_info')
    metadata={'editorFile':next(t['url'] for t in session['openTabs'] if t['isActive']),
              'artboard':ARTBOARD,'stateMachine':CONTROLLER,'viewModel':'Dog','triggers':TRIGGERS,
              'cancelTrigger':'rest','fps':FPS,'clips':DURATIONS,'sourceSha256':hashlib.sha256((ROOT/'dog.svg').read_bytes()).hexdigest(),
              'runtimeSha256':hashlib.sha256((ROOT/'spaniel.riv').read_bytes()).hexdigest(),
              'editableSha256':hashlib.sha256((ROOT/'spaniel.rev').read_bytes()).hexdigest(),
              'pawSourceSha256':hashlib.sha256((ROOT/'paw-pads.svg').read_bytes()).hexdigest(),
              'motionSourceSha256':hashlib.sha256((ROOT/'motion.py').read_bytes()).hexdigest()}
    (ROOT/'manifest.json').write_text(json.dumps(metadata,indent=2)+'\n')
    print('Exported',ROOT/'spaniel.riv',flush=True)


if __name__=='__main__':main()
