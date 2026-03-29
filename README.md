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
  <a href="#-license">License</a>
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
