#!/usr/bin/env python3
"""Author/export only the new, owned care-notebook Rive file. Never touch Home's mascot."""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import urllib.request
from motion import FPS,KEYS,PIVOTS,CHANNELS,DURATIONS,TRIGGERS,clips,keyframes

ROOT=Path(__file__).resolve().parent
FILE_ID=2667617
ARTBOARD='BarkLog Care Notebook'
CONTROLLER='Care Companion'

class Rive:
    def __init__(self):
        self.seq=0;self.headers={'Content-Type':'application/json','Accept':'application/json, text/event-stream'}
        self.rpc('initialize',{'protocolVersion':'2025-11-25','capabilities':{},'clientInfo':{'name':'BarkLog original care notebook','version':'1.0'}})
        self.rpc('notifications/initialized',notification=True)
    def rpc(self,method,params=None,notification=False):
        self.seq+=1;payload={'jsonrpc':'2.0','method':method}
        if not notification:payload['id']=self.seq
        if params is not None:payload['params']=params
        req=urllib.request.Request('http://127.0.0.1:9791/mcp',json.dumps(payload).encode(),self.headers)
        with urllib.request.urlopen(req,timeout=45) as response:
            if response.headers.get('Mcp-Session-Id'):self.headers['Mcp-Session-Id']=response.headers['Mcp-Session-Id']
            raw=response.read()
        result=json.loads(raw) if raw else {}
        if 'error' in result:raise RuntimeError(result['error'])
        return result.get('result',{})
    def call(self,name,arguments=None):
        result=self.rpc('tools/call',{'name':name,'arguments':arguments or {}})
        value=next((c['text'] for c in result.get('content',[]) if c['type']=='text'),'')
        if result.get('isError') or value.startswith('Error:'):raise RuntimeError(value)
        data=json.loads(value)
        if data.get('success') is False:raise RuntimeError(data)
        return data
    def command(self,tool,command,data=None):
        args={'command':command}
        if data is not None:args['data']={command:data}
        return self.call(tool,args)
    def values(self,data):
        result=self.call('set_property_values',{'propertyValues':data})
        if result.get('errors'):raise RuntimeError(result)
        return result
    def export(self,path):
        args={'format':path.suffix[1:],'destination':str(path.parent)}
        if path.suffix=='.rev':args['embed_assets']=True
        try:result=self.call('export_file',args)
        except RuntimeError as error:
            # The official tool's documented retry only after a real sandbox refusal.
            if 'Operation not permitted' not in str(error):raise
            result=self.call('export_file',{**args,'inline_base64':True})
        if 'data' in result:path.write_bytes(base64.b64decode(result['data']))
        elif 'path' in result:
            written=Path(result['path'])
            if written!=path:path.write_bytes(written.read_bytes())
        else:raise RuntimeError('No genuine export bytes/path returned')

def normalize(rive,objects,artboard_id):
    by_id={o['id']:o for o in objects}
    nodes={o['name']:o for o in objects if o['type']=='Node' and o['name'] in PIVOTS}
    if set(nodes)!=set(PIVOTS):raise RuntimeError('The new SVG rig is incomplete: '+str(set(PIVOTS)-set(nodes)))
    ids=[o['id'] for o in objects if o['type'] in ('Node','Shape')]
    values=rive.call('query_property_values',{'propertyKeys':{i:list(KEYS.values()) for i in ids}})['values']
    def absolute(i):
        if i==artboard_id:return(0,0)
        x,y=absolute(by_id[i]['parentId']);return(x+values[i]['13'],y+values[i]['14'])
    for name,(x,y) in PIVOTS.items():
        i=nodes[name]['id'];ax,ay=absolute(i);dx,dy=x-ax,y-ay
        changes={i:{'13':values[i]['13']+dx,'14':values[i]['14']+dy}}
        for child in objects:
            ci=child['id']
            if child['parentId']==i and ci in values:changes[ci]={'13':values[ci]['13']-dx,'14':values[ci]['14']-dy}
        rive.values(changes)
        for ci,props in changes.items():values[ci].update(props)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--seed',action='store_true');group.add_argument('--update-motion',action='store_true');group.add_argument('--replace-art',action='store_true')
    args=parser.parse_args();rive=Rive();session=rive.call('session_info')
    if session.get('activeFileId')!=FILE_ID:raise RuntimeError('Open only the new care-notebook file '+str(FILE_ID))
    boards=rive.call('list_artboards')['artboards']
    if args.seed:
        if boards:raise RuntimeError('Seed requires an empty new file; no existing art was changed')
        board=rive.command('open_file_editor','createArtboard',[{'name':ARTBOARD,'width':480,'height':560}])['artboards'][0]
        aid=board['id'];tree=rive.call('get_artboard_hierarchy',{'depth':2})['objects']
        fills={o['id'] for o in tree if 'Fill' in o['types']}
        for color in tree:
            if 'SolidColor' in color['types'] and any(color['id'] in o.get('children',[]) and o['id'] in fills for o in tree):rive.values({color['id']:{'37':'#00282828'}})
    else:
        board=next(b for b in boards if b['name']==ARTBOARD);aid=board['id']
        rive.command('open_file_editor','focusArtboard',{'artboardId':aid})
    if args.seed or args.replace_art:
        if args.replace_art:
            roots=[o for o in rive.call('find_objects',{'name':'Care Notebook Artwork'})['objects'] if o['name']=='Care Notebook Artwork' and o['parentId']==aid]
            if len(roots)!=1:raise RuntimeError('Expected only this study’s original art root')
            rive.call('delete_objects',{'objectIds':[roots[0]['id']]})
        encoded=base64.b64encode((ROOT/'companion.svg').read_bytes()).decode()
        asset=rive.call('upload_asset',{'file':'data:image/svg+xml;name=care-notebook.svg;base64,'+encoded,'name':'Original BarkLog notebook puppy'})['asset']
        rive.command('assets_tool','addSvgInstance',{'assetId':asset['id'],'parentId':aid,'name':'Care Notebook Artwork','x':0,'y':0})
        normalize(rive,rive.call('find_objects',{})['objects'],aid)
    nodes={o['name']:o for o in rive.call('find_objects',{})['objects'] if o['type']=='Node' and o['name'] in CHANNELS}
    if set(nodes)!=set(CHANNELS):raise RuntimeError('Incomplete notebook animation rig')
    values=rive.call('query_property_values',{'propertyKeys':{o['id']:list(KEYS.values()) for o in nodes.values()}})['values']
    rig={name:{'id':o['id'],'values':values[o['id']]} for name,o in nodes.items()}
    animations=rive.command('animation_editor','listLinearAnimations')['linearAnimations']
    if args.seed:rive.command('animation_editor','renameAnimations',{'animations':[{'animationId':animations[0]['id'],'name':'Idle'}]})
    animations={a['name']:a['id'] for a in rive.command('animation_editor','listLinearAnimations')['linearAnimations']}
    missing=[{'name':n,'duration':d} for n,d in DURATIONS.items() if n not in animations]
    if missing:rive.command('animation_editor','createLinearAnimations',{'linearAnimations':missing})
    animations={a['name']:a['id'] for a in rive.command('animation_editor','listLinearAnimations')['linearAnimations']}
    for name,clip in clips().items():
        i=animations[name];rive.values({i:{'56':FPS,'57':round(clip['duration']*FPS),'59':1 if name=='Idle' else 0}})
        old=rive.command('animation_editor','queryKeyFrames',{'animationIds':[i]})['keyframes'].get(i,[])
        if old:rive.command('animation_editor','modifyKeyFrames',{'animationId':i,'delete':[k['keyframeId'] for k in old]})
        frames=keyframes(clip,rig);result=rive.command('animation_editor','modifyKeyFrames',{'animationId':i,'add':frames})
        if len(result['added'])!=len(frames):raise RuntimeError('Incomplete keyframes '+name)
        print(name,len(frames),'keyframes',flush=True)
    machines=rive.command('animation_editor','listStateMachines')['stateMachines']
    machine=next((m for m in machines if m['name']==CONTROLLER),next(m for m in machines if m['isDefault']));mid=machine['id']
    rive.command('animation_editor','renameAnimations',{'animations':[{'animationId':mid,'name':CONTROLLER}]})
    def controller():return rive.command('animation_editor','queryStateMachine',{'stateMachineId':mid})
    layer=controller()['layers'][0]
    missing=[{'name':n,'linearAnimationName':n,'x':400+i*240,'y':200} for i,n in enumerate(TRIGGERS) if not any(s.get('animationName')==n for s in layer['states'])]
    if missing:rive.command('animation_editor','createStates',{'layerId':layer['layerId'],'states':missing})
    layer=controller()['layers'][0];states={s.get('animationName'):s['id'] for s in layer['states'] if s['type']=='animation'}
    existing={(t['fromStateId'],t['toStateId']) for t in layer['transitions']}
    edges=[(layer['anyStateId'],states[n]) for n in TRIGGERS]+[(states[n],states['Idle']) for n in TRIGGERS]+[(layer['anyStateId'],states['Idle'])]
    missing=[{'id':a,'transitions':[{'to':b}]} for a,b in edges if(a,b) not in existing]
    if missing:rive.command('animation_editor','createTransitions',{'states':missing})
    models=rive.command('viewmodel_editor','listViewModels')['viewModels'];vm=next((m for m in models if m['name']=='Care'),None)
    if not vm:
        vm=rive.command('viewmodel_editor','createViewModels',{'viewModels':[{'name':'Care','viewModelProperties':[{'name':n,'propertyType':'trigger'} for n in [*TRIGGERS.values(),'rest']]}]})['viewModels'][0]
        rive.command('viewmodel_editor','createViewModelInstances',{'viewModelId':vm['id'],'instances':[{'name':'Default'}]})
    props={p['name']:p['id'] for p in vm['viewModelProperties']};rive.command('viewmodel_editor','bindViewModelToArtboard',{'artboardId':aid,'viewModelId':vm['id']})
    layer=controller()['layers'][0];names={s['id']:s.get('animationName') for s in layer['states']};changes={};conditions=[]
    for t in layer['transitions']:
        i,a,b=t['id'],t['fromStateId'],t['toStateId']
        if a==layer['anyStateId'] and names.get(b) in TRIGGERS:
            changes[i]={'158':180,'152':32}
            if not t['conditions']:conditions.append({'id':i,'conditions':[{'leftComparator':{'viewModelPropertyId':props[TRIGGERS[names[b]]]}}]})
        elif b==states['Idle'] and names.get(a) in TRIGGERS:changes[i]={'158':180,'152':36,'160':round(DURATIONS[names[a]]*1000)}
        elif a==layer['anyStateId'] and b==states['Idle']:
            changes[i]={'158':180,'152':32}
            if not t['conditions']:conditions.append({'id':i,'conditions':[{'leftComparator':{'viewModelPropertyId':props['rest']}}]})
    rive.values(changes)
    if conditions:rive.command('animation_editor','createConditions',{'transitions':conditions})
    rive.export(ROOT/'care-notebook.riv')
    editable_error=None
    try:rive.export(ROOT/'care-notebook.rev')
    except RuntimeError as error:editable_error=str(error);print('Editable export unavailable:',editable_error,flush=True)
    session=rive.call('session_info');sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
    manifest={'editorFile':next(t['url'] for t in session['openTabs'] if t['isActive']),'fileId':FILE_ID,'artboard':ARTBOARD,'stateMachine':CONTROLLER,'viewModel':'Care',
              'triggers':TRIGGERS,'cancelTrigger':'rest','fps':FPS,'clips':DURATIONS,'sourceSha256':sha('companion.svg'),'runtimeSha256':sha('care-notebook.riv'),
              'editableSha256':sha('care-notebook.rev') if(ROOT/'care-notebook.rev').exists() else None,'editableError':editable_error,'motionSourceSha256':sha('motion.py'),
              'scope':'New original artwork and Rive motion for plan/paywall review only. Existing spaniel and native app preserved.'}
    (ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Exported new runtime',manifest['runtimeSha256'],flush=True)

if __name__=='__main__':main()
