<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/WeChat-07C160?style=for-the-badge&logo=wechat&logoColor=white" alt="WeChat"/>
</p>

<h1 align="center">🧧 Automated New Year Greeting Tool</h1>

<p align="center">
  <strong>AI-powered personalized New Year greetings — exported from WeChat, auto-generated & auto-sent.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#%EF%B8%8F-configuration">Configuration</a> •
  <a href="#-faq">FAQ</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-star-history">Stars</a> •
  <a href="#-license">License</a>
</p>

<p align="center">
  <a href="https://github.com/nadonghuang/Automated-New-Year-s-Greeting-Tool/stargazers">
    <img src="https://img.shields.io/github/stars/nadonghuang/Automated-New-Year-s-Greeting-Tool?style=flat-square&logo=github&color=yellow" alt="Stars"/>
  </a>
  <a href="https://github.com/nadonghuang/Automated-New-Year-s-Greeting-Tool/network/members">
    <img src="https://img.shields.io/github/forks/nadonghuang/Automated-New-Year-s-Greeting-Tool?style=flat-square&logo=github&color=blue" alt="Forks"/>
  </a>
  <a href="https://github.com/nadonghuang/Automated-New-Year-s-Greeting-Tool/commits">
    <img src="https://img.shields.io/github/last-commit/nadonghuang/Automated-New-Year-s-Greeting-Tool?style=flat-square&logo=git&color=green" alt="Last commit"/>
  </a>
  <a href="https://github.com/nadonghuang/Automated-New-Year-s-Greeting-Tool/issues">
    <img src="https://img.shields.io/github/issues/nadonghuang/Automated-New-Year-s-Greeting-Tool?style=flat-square&logo=github" alt="Issues"/>
  </a>
</p>

---

## ✨ Features

- 🤖 **AI-Powered Generation** — Uses LLM (via OpenRouter) to create unique, personalized greetings based on real chat history
- 📱 **WeChat Integration** — Scan QR code to log in, auto-read contact conversations
- 🎯 **Smart Personalization** — Generates greetings tailored to each contact's relationship and chat style
- 📤 **Auto-Send** — Automatically sends greetings to all contacts at once
- 📊 **Beautiful Dashboard** — Modern Next.js UI with real-time status tracking
- 🔐 **Secure** — Rate limiting, request body size limits, encrypted session management
- 🌐 **i18n Ready** — Generate greetings in multiple languages

## 🖼 Demo

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   1. Scan QR → WeChat Login                    │
│   2. Select contacts → Generate greetings       │
│   3. Review & customize → Send all at once! 🚀  │
│                                                 │
└─────────────────────────────────────────────────┘
```

> 💡 **Want a richer demo?** Drop a real screenshot / GIF into `docs/demo.gif` and reference it here — PRs welcome!

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- OpenRouter API Key ([get one here](https://openrouter.ai))

### Installation

```bash
# Clone the repo
git clone https://github.com/nadonghuang/Automated-New-Year-s-Greeting-Tool.git
cd Automated-New-Year-s-Greeting-Tool

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..

# Start everything
bash start.sh
```

That's it! Open [http://localhost:3000](http://localhost:3000) and follow the on-screen instructions.

### Environment Variables

```bash
# Backend (.env)
cp backend/.env.example backend/.env

# Required
OPENROUTER_API_KEY=sk-or-xxx    # Your OpenRouter API key

# Optional
RATE_LIMIT_CONFIG_PER_MINUTE=10
DEFAULT_MODEL=deepseek/deepseek-v3.2
```

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| **Backend** | FastAPI, Python, itchat-uos |
| **Frontend** | Next.js 16, React 19, Tailwind CSS |
| **AI** | OpenRouter (DeepSeek, GPT, Claude, etc.) |
| **UI Animations** | Framer Motion, Lucide Icons |
| **Notifications** | Sonner |

## ⚙️ Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `OPENROUTER_API_KEY` | — | Required. Your OpenRouter API key |
| `DEFAULT_MODEL` | `deepseek/deepseek-v3.2` | LLM model for greeting generation |
| `MAX_HISTORY_LENGTH` | `20` | Max chat history messages to consider |
| `RATE_LIMIT_CONFIG_PER_MINUTE` | `10` | API rate limit per minute |

## 📁 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI server
│   ├── generator.py         # AI greeting generator
│   ├── wechat_service.py    # WeChat integration
│   ├── config.py            # Configuration
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   └── package.json
├── start.sh                 # One-click launch script
└── README.md
```

## ❓ FAQ

<details>
<summary><b>🤔 微信会不会封号？</b></summary>

工具基于 [`itchat-uos`](https://github.com/why2lyj/itchat-uos) 实现，采用网页版协议，**理论上不会被封**，但任何非官方客户端都有一定风险。建议：
- 不要短时间内大量群发（每次 ≤ 50 人）
- 个人微信使用，避免使用新注册小号
- 春节前再启动，平时慎用
</details>

<details>
<summary><b>🤔 OpenRouter Key 怎么配？</b></summary>

去 [openrouter.ai](https://openrouter.ai) 注册 → 创建 API Key → 复制到 `backend/.env`：
```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```
该 Key 仅用于调用 LLM 生成文案，**不**用于微信通信。
</details>

<details>
<summary><b>🤔 能改成群发吗？</b></summary>

可以。修改 `backend/wechat_service.py` 的发送方法，将单个 send 改为遍历群列表即可。**注意**：群发更容易触发微信风控，谨慎使用。
</details>

<details>
<summary><b>🤔 离线能用吗？</b></summary>

微信扫码登录需要联网；LLM 文案生成需要联网。生成完文案后可手动复制发送，做到"半离线"。
</details>

<details>
<summary><b>🤔 支持哪些 LLM？</b></summary>

理论上 OpenRouter 支持的所有模型都可以，通过 `DEFAULT_MODEL` 切换：
- `deepseek/deepseek-v3.2`（默认，性价比高）
- `anthropic/claude-sonnet-4`
- `openai/gpt-4o`
- `google/gemini-2.5-pro`
</details>

<details>
<summary><b>🤔 生成的语言支持中文以外的吗？</b></summary>

支持，LLM 支持任意语言。修改 prompt 模板即可生成英文、日文、韩文、粤语等版本。
</details>

## 🗓 Roadmap

| Status | Item | Target |
|--------|------|--------|
| ✅ | WeChat 扫码登录 & 联系人读取 | 2026-01 |
| ✅ | AI 个性化祝福生成（中文） | 2026-01 |
| ✅ | Next.js Dashboard UI | 2026-02 |
| 🔄 | 🐉 **2027 蛇年版本** — 增强 prompt + 支持生肖主题 | 2026-12 |
| 📋 | 多 LLM 路由器（智能切换） | TBD |
| 📋 | 抖音/小红书版本适配 | TBD |
| 📋 | Docker 一键部署 | TBD |

> 🐛 有想法？[开个 issue](https://github.com/nadonghuang/Automated-New-Year-s-Greeting-Tool/issues) 一起聊聊。

## ⭐ Star History

<a href="https://star-history.com/#nadonghuang/Automated-New-Year-s-Greeting-Tool&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=nadonghuang/Automated-New-Year-s-Greeting-Tool&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=nadonghuang/Automated-New-Year-s-Greeting-Tool&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=nadonghuang/Automated-New-Year-s-Greeting-Tool&type=Date" />
  </picture>
</a>

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nadonghuang">nadonghuang</a>
  <br/>
  If you find this useful, please consider giving it a ⭐!
</p>
