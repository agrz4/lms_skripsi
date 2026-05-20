require('dotenv').config();
const prisma = require('../src/config/db');
const { getMe } = require('../src/controllers/authController');
const { getMateriAssigned, getMonitoringStats, getDetailMhs } = require('../src/controllers/monitoringController');
const { getKoreksiList, submitNilai, getFileDetail } = require('../src/controllers/koreksiController');
const { getStatsPGHandler } = require('../src/controllers/aiController');

async function test() {
  console.log('--- STARTING VERIFICATION TESTS ---');

  // Helper mock res
  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.jsonData = data;
      return res;
    };
    return res;
  };

  // Find seeded users
  const dosen = await prisma.user.findUnique({ where: { email: 'dosen@lms.com' } });
  const asisten = await prisma.user.findUnique({ where: { email: 'asisten@lms.com' } });
  const mhs = await prisma.user.findUnique({ where: { email: 'mhs@lms.com' } });

  if (!dosen || !asisten || !mhs) {
    console.error('Seeded users not found! Make sure prisma is seeded.');
    process.exit(1);
  }

  // 1. Verify getMe for DOSEN
  console.log('Testing authController.getMe for DOSEN...');
  const reqMe = { user: { id: dosen.id, role: dosen.role } };
  const resMe = mockRes();
  await getMe(reqMe, resMe);
  console.log('getMe Result:', JSON.stringify(resMe.jsonData, null, 2));
  if (resMe.jsonData && resMe.jsonData.gelar === 'Dosen Pengampu' && resMe.jsonData.avatar) {
    console.log('✔ getMe test passed!');
  } else {
    console.error('❌ getMe test failed!');
  }

  // 2. Verify getMonitoringStats
  console.log('\nTesting monitoringController.getMonitoringStats...');
  const reqStats = { user: { id: dosen.id, role: dosen.role } };
  const resStats = mockRes();
  await getMonitoringStats(reqStats, resStats);
  console.log('getMonitoringStats Result:', JSON.stringify(resStats.jsonData, null, 2));
  if (resStats.jsonData && resStats.jsonData.success) {
    console.log('✔ getMonitoringStats test passed!');
  } else {
    console.error('❌ getMonitoringStats test failed!');
  }

  // 3. Verify getKoreksiList for ASISTEN
  console.log('\nTesting koreksiController.getKoreksiList...');
  const reqKoreksi = { user: { id: asisten.id, role: asisten.role } };
  const resKoreksi = mockRes();
  await getKoreksiList(reqKoreksi, resKoreksi);
  console.log('getKoreksiList Result:', JSON.stringify(resKoreksi.jsonData, null, 2));
  if (resKoreksi.jsonData && resKoreksi.jsonData.success) {
    console.log('✔ getKoreksiList test passed!');
  } else {
    console.error('❌ getKoreksiList test failed!');
  }

  // 4. Verify getStatsPGHandler
  console.log('\nTesting aiController.getStatsPGHandler...');
  const reqAiStats = { user: { id: asisten.id, role: asisten.role } };
  const resAiStats = mockRes();
  await getStatsPGHandler(reqAiStats, resAiStats);
  console.log('getStatsPGHandler Result:', JSON.stringify(resAiStats.jsonData, null, 2));
  if (resAiStats.jsonData && resAiStats.jsonData.success && resAiStats.jsonData.data.submissions) {
    console.log('✔ getStatsPGHandler test passed!');
  } else {
    console.error('❌ getStatsPGHandler test failed!');
  }

  console.log('\n--- VERIFICATION COMPLETED ---');
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
