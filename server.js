// server.js

// --- 步骤 1: 引入必要的模块 ---
import express from 'express'; // 引入 express 框架
import jwt from 'jsonwebtoken';
import axios from 'axios';
import crypto from 'crypto';

// --- 您的 Coze 凭证 (无需改动) ---
const COZE_APP_ID = "1137064092717";
const COZE_KEY_ID = "NFcRQQF8ZKS6DO6CvqwxDWvmFiNGlHF1D8uXdLCZTXs";
const COZE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCO7qaS4AjmgmDs
brqHGV/OAy1+ySeguCBcgKRr9YKbQc51+Oli27SUo5yA+4KL/t4M+v62DZnR0SNY
kOo681EYF1nu8io4BiUR+OP5qSVd/8Tm2hjmfXBNEYw/dfQaFo9gvxoyChe4d2jZ
tMCC7RjgIyR2hMCHRWwokCx1PfUUJUfPIXwzR13VYWrag/PYwJ8WUYlV38LHHSKU
3LqLgg+KQkOkByrJ3SGOri1xgCy7j3caXQinlE+5NT3/zk+RaoLznrYxduAK19wt
QSfXVau+wjCXukgH5D01qi/XuHsnSMknQgzZdQFJ7FH/WDgB5YfKF3Mst8UGON6i
bseLiZHdAgMBAAECggEAAJHVVB+63I0hRo/1nY6gu4XdUcE94sp/ebiBiNsEcQrE
5q93rqjItXbzEe7ur3dalAHdr553DuEFTqSoalSIVDVzneiVLOTJYDyPtaUFvLQr
3FR6/1Nf3Ghffx+nOc6XnH+AFgb4RTuLAKMgL7IzBGGsRlSmt8mzcdq+DDf5zBTA
bnP0eH5uy3t/h8lVNGiWk/Ewt8G5mpiybEvU33At2ti0UP6jR4yBwddJj6qFpQdN
RUXTvHBDa27x2AGBntnicrKTdZtV9+H4DUlSuaHLaSWgzsY/NY6tfkQ6Wg1hdyHT
uzcfX/TfRlVCfYDQWveFe7yKI3qLl9jiccdoiQBCQQKBgQDEDoqw1VEoRWxlEIhQ
be3k9Cd24aggK1vavaEmfa2Txf4xOf6XD/koYbCdNuI0/a1dfOfeo4pGKXBcg1Rn
kv3NOehw93fUuaCpB5U3HQnalEijqeGABa4r6392Fxuo6v4mUPEfTOwxKuMIksfi
kNqVaYgjHSDFQDbhGT5THJ1T6QKBgQC6ogYC/Qb61wVHkXe6BE//ARGC0wxajPRs
HF+tE3ayCeRzitA/QVpDtr9sZzpIKF+mk8HMc2DRA3RwCj8TKNuPIJkbGXY/cKPb
qy9C50NYrAE9V9bWUFZca18Lade1HTrkdjbd/Go0FeM8hfGykbPdiuCWN7D/x+RN
QM6HokkZ1QKBgQDBNXd2JvKQ1kGpI27CnGLp07akkGNIOJKP8XrDXO1XCLKlPnrn
0eT/563OcQzhnfFghTxYCyC0XhgOA5qFa7VUrzGjSi08ZSawDPn+004nqyQerca9
jFuFitIUxVcL03Fcvz2wU/UbyyDsDQKRA6FxwdTW1w1J0At+tuRukxNKQKBgE22
U5yA8ZwXVppzZxAs5YaAUmNQL++wi8JMmkY+OYlu9xJpdccxFj3l5ZVk8m7DaPi6
w9K3JFREBQL2MUdwFuRlJXuUQZmu9HvurvJDy9YrYSTC47E/qIY5K01cWDaRIkmp
M7WBelOP3ZwBBiBd7TBNuLC0Jd6LxHOqjZUKrTe1AoGAS6d9D6GuZ9/fVLnLJHbA
CcneHA+YcYXK6I7VG70T9O99KEvwR2wW8zQxPpA4YY/BlSQ/03M4Pf3OtRK3o1o4
0gDEeXsZSvUIItRbiJE96qs7fmgjUJT+dhUcZRl4lTL/B/vzzHObzevYRgef7QyV
hssA5bLC1SgTTXSkci3MC44=
-----END PRIVATE KEY-----`;

// --- 步骤 2: 创建 Express 应用 ---
const app = express();

// --- 步骤 3: 配置服务器 ---
// 让 express 托管 public 文件夹，这样 index.html 就能被访问
app.use(express.static('public')); 
// 让 express 能够解析请求中的 JSON 数据
app.use(express.json());

// --- 步骤 4: 创建 API 路由 ---
// 将您原来的后端逻辑，整个放入这个路由处理函数中
app.post('/api/get-coze-token', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "请求错误, 缺少 userId" });
        }

        const payload = { iss: COZE_APP_ID, aud: 'api.coze.cn', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, jti: crypto.randomUUID(), session_name: userId };
        const headers = { kid: COZE_KEY_ID, alg: 'RS256' };
        
        const rawJwtToken = jwt.sign(payload, COZE_PRIVATE_KEY, { header: headers });
        const url = "https://api.coze.cn/api/permission/oauth2/token";
        const requestHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rawJwtToken}` };
        const requestData = { "duration_seconds": 3600, "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer" };
        
        const apiResponse = await axios.post(url, requestData, { headers: requestHeaders });
        const { access_token: accessToken } = apiResponse.data;
        
        if (!accessToken) {
            throw new Error("获取 access_token 失败");
        }

        return res.status(200).json({ token: accessToken });

    } catch (error) {
        console.error("处理请求时发生致命错误:", error.response ? error.response.data : error.message);
        return res.status(500).json({ error: "服务器内部错误", details: error.message });
    }
});

// --- 步骤 5: 启动服务器 ---
// LeanCloud 会通过环境变量 process.env.LEANCLOUD_APP_PORT 注入端口
const PORT = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});