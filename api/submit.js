export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    const authRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.APP_ID,
        app_secret: process.env.APP_SECRET
      })
    });
    const authData = await authRes.json();
    const accessToken = authData.tenant_access_token;

    const fields = req.body;
    const recordRes = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.APP_TOKEN}/tables/${process.env.TABLE_ID}/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ fields })
      }
    );
    const recordData = await recordRes.json();

    return res.status(200).json({ success: true, result: recordData });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
