import unittest,tempfile,shutil,subprocess,sqlite3
from pathlib import Path
class InitTest(unittest.TestCase):
 def test_reinitialization_preserves_existing_records(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'db').mkdir();shutil.copy('bmclinic_db_engine.py',root);shutil.copy('db/schema.sql',root/'db/schema.sql')
   subprocess.run(['python3',str(root/'bmclinic_db_engine.py')],check=True,capture_output=True)
   db=sqlite3.connect(root/'db/bmclinic_seo_agent.sqlite');db.execute("INSERT INTO realtime_patient_events(page_slug,event_type) VALUES('existing','TEST')");db.commit();db.close()
   subprocess.run(['python3',str(root/'bmclinic_db_engine.py')],check=True,capture_output=True)
   db=sqlite3.connect(root/'db/bmclinic_seo_agent.sqlite');self.assertEqual(db.execute('SELECT COUNT(*) FROM realtime_patient_events').fetchone()[0],1);db.close()
if __name__=='__main__':unittest.main()
