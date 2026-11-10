"""Production HTTP smoke check with an isolated, disposable database."""
import os,subprocess,tempfile,time,urllib.request,urllib.error,json
base='http://127.0.0.1:3061'
with tempfile.TemporaryDirectory() as tmp:
 env={**os.environ,'ADMIN_PASSWORD':'local-test-password-only','SESSION_SECRET':'local-test-secret-for-verification-only-123456','DATABASE_PATH':tmp+'/test.sqlite','SITE_URL':base}
 with open(tmp+'/server.log','w+') as log:
  server=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3061'],env=env,stdout=log,stderr=log)
  opener=urllib.request.build_opener(urllib.request.ProxyHandler({}));cookie=''
  def req(path,payload=None,origin=base):
   headers={'Origin':origin,'Cookie':cookie}
   if payload is not None:headers['Content-Type']='application/json'
   request=urllib.request.Request(base+path,data=json.dumps(payload).encode() if payload is not None else None,headers=headers)
   try:
    r=opener.open(request,timeout=10);return r.status,r.read().decode(),r.headers
   except urllib.error.HTTPError as e:return e.code,e.read().decode(),e.headers
  try:
   for attempt in range(60):
    try:
     if req('/')[0]==200:break
    except (OSError,urllib.error.URLError):time.sleep(.2)
   else:raise RuntimeError('Production server did not start')
   for path in ['/','/proktologia','/flebologia','/chirurgia-ogolna','/medycyna-estetyczna','/kontakt','/rezerwacja','/admin','/robots.txt','/sitemap.xml']:
    status,_,_=req(path);assert status==200,(path,status)
   assert req('/api/content')[0]==401
   assert req('/api/session',{'password':'wrong'})[0]==401
   assert req('/api/session',{'password':env['ADMIN_PASSWORD']},'http://evil.test')[0]==403
   status,_,headers=req('/api/session',{'password':env['ADMIN_PASSWORD']});assert status==200
   cookie=headers['Set-Cookie'].split(';')[0]
   payload=dict(title='Test publikacji',department='proktologia',summary='Opis do testu',body='Treść testowa',status='draft',reviewer='',sources='',preparation='',aftercare='')
   status,body,_=req('/api/content',payload);assert status==200,body
   p=json.loads(body)['page'];assert req('/procedury/'+p['slug'])[0]==404
   payload.update(id=p['id'],status='published',reviewer='Lekarz testowy');assert req('/api/content',payload)[0]==200
   assert req('/procedury/'+p['slug'])[0]==200
   payload['status']='draft';assert req('/api/content',payload)[0]==200
   assert req('/procedury/'+p['slug'])[0]==404
   assert req('/api/telemetry',dict(id='http-test-event-1234',event='booking_opened',consent=True))[0]==201
   assert req('/api/telemetry',dict(id='http-test-event-1234',event='booking_opened',consent=True))[0]==201
   assert req('/api/telemetry',dict(id='http-test-event-5678',event='booking_confirmed',consent=True))[0]==400
   print('PASS: 10 routes, auth, CSRF, persistence, draft privacy, publication, withdrawal and telemetry')
  except Exception:
   log.flush();log.seek(0);print(log.read());raise
  finally:
   server.terminate();server.wait(timeout=10)
