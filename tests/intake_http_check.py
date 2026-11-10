"""Production patient workflow with synthetic data and disposable databases."""
import os,subprocess,tempfile,time,urllib.request,urllib.error,json,hmac,hashlib,base64,struct
base='http://127.0.0.1:3062'
with tempfile.TemporaryDirectory() as tmp:
 notice=tmp+'/notice.txt'
 open(notice,'w').write('Wyłącznie test techniczny informacji dla pacjenta. '*15)
 env={**os.environ,'ADMIN_PASSWORD':'test-password-long-enough','SESSION_SECRET':'test-session-secret-with-at-least-32-characters','DATABASE_PATH':tmp+'/content.sqlite','SITE_URL':base,'PATIENT_INTAKE_ENABLED':'true','PATIENT_DATA_KEY':'07'*32,'PATIENT_STAFF_TOTP_SECRET':'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ','PATIENT_STAFF_NAME':'Test operator','PATIENT_NOTICE_PATH':notice,'PATIENT_NOTICE_VERSION':'test-v1','PATIENT_DATABASE_PATH':tmp+'/intake.sqlite'}
 with open(tmp+'/server.log','w+') as log:
  server=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3062'],env=env,stdout=log,stderr=log)
  opener=urllib.request.build_opener(urllib.request.ProxyHandler({}));cookies={}
  def req(path,payload=None,method=None,origin=base):
   headers={'Origin':origin,'Cookie':'; '.join(k+'='+v for k,v in cookies.items())}
   if payload is not None:headers['Content-Type']='application/json'
   r=urllib.request.Request(base+path,data=json.dumps(payload).encode() if payload is not None else None,headers=headers,method=method)
   try:r=opener.open(r,timeout=10)
   except urllib.error.HTTPError as e:r=e
   for c in r.headers.get_all('Set-Cookie',[]):
    k,v=c.split(';')[0].split('=',1);cookies[k]=v
   body=r.read().decode()
   try:body=json.loads(body)
   except ValueError:pass
   return r.status,body,r.headers
  try:
   for _ in range(100):
    try:
     if req('/pacjent/demo')[0]==200:break
    except OSError:time.sleep(.1)
   assert req('/api/intake-admin/packets')[0]==401
   assert req('/api/session',{'password':'test-password-long-enough'})[0]==200
   assert req('/api/intake-admin/packets')[0]==401
   step=int(time.time())//30;digest=hmac.new(base64.b32decode(env['PATIENT_STAFF_TOTP_SECRET']),struct.pack('>Q',step),hashlib.sha1).digest();i=digest[-1]&15;code=str((int.from_bytes(digest[i:i+4],'big')&0x7fffffff)%1000000).zfill(6)
   s,b,_=req('/api/intake-admin/auth',{'code':code});assert s==200,b
   s,b,_=req('/api/intake-admin/packets',{'forms':['registration','health']});assert s==201,b
   invite=b['invitation'];pid=invite['id']
   assert req('/api/intake/open',{'token':invite['token'],'pin':invite['pin']},origin='https://evil.test')[0]==403
   s,b,_=req('/api/intake/open',{'token':invite['token'],'pin':invite['pin']});assert s==200,b
   assert req('/api/intake/open',{'token':invite['token'],'pin':invite['pin']})[0]==401
   s,b,h=req('/api/intake/session');assert s==200,b
   assert 'no-store' in h['Cache-Control'] and h['Referrer-Policy']=='no-referrer'
   revision=b['packet']['revision'];schema=b['packet']['schema'];answers={'patientName':'Synthetic Patient 743','identifier':'test identifier','healthReason':'Synthetic symptom'}
   answers.update({f['id']:'Nie' for form in schema if form['id']=='health' for f in form['fields'] if f.get('buttons') and f.get('required')})
   s,b,_=req('/api/intake/session',{'action':'draft','answers':answers,'revision':revision});assert s==200,b
   assert req('/api/intake/session',{'action':'draft','answers':answers,'revision':revision})[0]==400
   revision=b['revision']
   s,b,_=req('/api/intake/session',{'action':'submit','answers':answers,'revision':revision});assert s==200,b
   assert req('/api/intake/session',{'action':'draft','answers':answers,'revision':b['revision']})[0]==400
   s,b,_=req('/api/intake-admin/packets');assert s==200 and 'Synthetic Patient' not in json.dumps(b)
   s,b,_=req('/api/intake-admin/packets/'+pid);assert s==200 and b['packet']['answers']==answers,b
   assert req('/api/intake-admin/packets/'+pid,{'action':'review','identityChecked':True,'importConfirmed':True,'recordReference':'TEST-EDM-1'})[0]==200
   assert req('/api/intake-admin/packets/'+pid,{'action':'followUp'})[0]==400
   status,follow,_=req('/api/intake-admin/packets/'+pid,{'action':'followUp','identityChecked':True});assert status==200,follow
   fi=follow['invitation'];assert req('/api/intake/open',{'token':fi['token'],'pin':fi['pin']})[0]==200
   status,follow,_=req('/api/intake/session');assert follow['packet']['previous']['packetId']==pid
   assert req('/api/intake/session',{'action':'submit','answers':answers,'revision':0})[0]==400
   assert req('/api/intake/session',{'action':'submit','answers':answers,'revision':0,'reviewedPrevious':True})[0]==200
   assert req('/api/intake-admin/packets/'+fi['id'],{'action':'revoke'})[0]==200
   assert req('/api/intake/session')[0]==401
   assert req('/pacjent')[2]['Referrer-Policy']=='no-referrer'
   for procedure,expected in [('lhp',{'health','proctology','operative'}),('venous_surgery',{'health','operative'})]:
    status,packet,_=req('/api/intake-admin/packets',{'forms':['registration'],'procedure':procedure});assert status==201,packet
    access=packet['invitation'];assert req('/api/intake/open',{'token':access['token'],'pin':access['pin']})[0]==200
    status,packet,_=req('/api/intake/session');p=packet['packet'];assert expected.issubset(set(p['forms']))
    operative=next(f for f in p['schema'] if f['id']=='operative');assert 'zgon' in ' '.join(operative['information']['paragraphs'])
    assert req('/api/intake/session',{'action':'submit','answers':{'patientName':'Synthetic Patient','identifier':'test'},'revision':0})[0]==400
   print('PASS: production intake, MFA, CSRF, drafts, follow-up, immutable submissions, privacy and mandatory LHP/venous operative forms')
  except Exception:
   log.flush();log.seek(0);print(log.read());raise
  finally:server.terminate();server.wait(timeout=10)
 for name in os.listdir(tmp):
  if 'sqlite' in name:assert b'Synthetic Patient 743' not in open(tmp+'/'+name,'rb').read()
