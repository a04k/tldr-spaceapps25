# TL;DR Dashboard - NASA Space Apps Challenge 2025

> **Too Long; Didn't Read** - AI-powered research summarization and knowledge management for space biology research

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-AI-blue?style=for-the-badge&logo=openai)](https://openai.com/)
[![NASA Space Apps](https://img.shields.io/badge/NASA-Space%20Apps%202025-red?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)

## 👥 Team

**Team Name:** TL;DR 
**Challenge:** Build a Space Biology Knowledge Engine

| Name | Role | GitHub |
|------|------|--------|
| **Ahmed Khaled** | Fullstack & Integration Engineer | [@a04k](https://github.com/a04k) |
| **Alhussein Ahmed** | Research Specialist | |
| **Ahmed Elsharkawy** | AI & ML Engineer, API Writer | |
| **Mahmoud Elsharkawy MSc** | Research Expert, (future PhD) | |
| **Sandy Adel** | Presentation and Content Expert & Biotechnologist | |

## 🚀 Overview

TL;DR Dashboard is an intelligent research assistant designed to make space biology and scientific research more accessible. Built for the NASA Space Apps Challenge 2025, it transforms complex research papers into digestible summaries and provides interactive AI-powered conversations about scientific topics.

### 🎯 Problem Statement

Researchers and professionals often struggle with:
- **Information Overload**: Thousands of research papers published daily
- **Time Constraints**: Limited time to read and understand complex studies
- **Knowledge Gaps**: Difficulty connecting concepts across different papers
- **Accessibility**: Scientific jargon barriers for non-experts

### 💡 Our Solution

TL;DR Dashboard provides:
- **AI-Powered Summaries**: Instant paper summarization with key insights
- **Interactive Chat**: Context-aware conversations about research topics
- **Multi-User Personas**: Tailored responses for researchers, students, and business professionals
- **Knowledge Mapping**: Visual connections between research concepts
- **Voice Summaries**: Audio playback in multiple languages
- **Paper Database**: 608+ summarized papers with 2000+ in RAG system

## ✨ Features

### 🤖 AI Assistant
- **Smart Conversations**: Context-aware chat with research papers
- **User Personas**: Customized responses for different user types
- **Voice Summaries**: Text-to-speech in English, Arabic, and French
- **Video Generation**: AI-generated video summaries (demo)

### 📊 Dashboard
- **Research Database**: 608 summarized papers, 2000+ in RAG
- **Real-time Stats**: Track processing and usage metrics
- **Modern UI**: Clean, responsive design with dark/light themes
- **Interactive Widgets**: Time, weather, and system status displays

### 🔬 Research Tools
- **Paper Viewer**: Enhanced reading experience with AI insights
- **Knowledge Mapping**: Visual representation of concept relationships
- **Search & Discovery**: Find relevant papers quickly
- **Citation Management**: Track and organize research references

### 🌐 Multi-Language Support
- **Interface**: English (primary)
- **Voice Summaries**: English, Arabic, French
- **Content**: Supports international research papers

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon library

### Backend & AI
- **Convex** - Real-time database and backend
- **Google Cloud Run** - Scalable API hosting
- **TL;DR AI** - Custom research summarization
- **Google TTS** - Text-to-speech synthesis

### Deployment
- **Vercel** - Alternative deployment option
- **GitHub Actions** - CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- bun (recommended)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/a04k/tldr-spaceapps25.git
   cd tldr-spaceapps25
   ```

2. **Install dependencies**
   ```bash
   bun i
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   CONVEX_DEPLOYMENT=your_convex_deployment
   CONVEX_URL=your_convex_url
   AI_API_URL=your_api_endpoint
   ```

4. **Run the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tldr-dashboard/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── laboratory/        # Research lab interface
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ai-assistant/      # Chat interface
│   ├── dashboard/         # Dashboard widgets
│   ├── laboratory/        # Research tools
│   └── ui/               # Reusable UI components
├── convex/               # Database schema & functions
├── data/                 # Research papers (MDX)
├── lib/                  # Utility functions
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🎨 Key Components

### AI Assistant (`components/ai-assistant/`)
- **Full-screen Chat**: Immersive conversation interface
- **Context Awareness**: Understands current paper being viewed
- **User Personas**: Adapts responses based on user type
- **Voice & Video**: Multimedia response options

### Dashboard (`components/dashboard/`)
- **Overview**: Main dashboard with stats and widgets
- **Research Activity**: Track paper interactions
- **System Status**: Monitor application health

### Laboratory (`components/laboratory/`)
- **Paper Grid**: Browse research papers
- **Paper Viewer**: Enhanced reading experience
- **Search**: Find relevant research quickly

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `CONVEX_DEPLOYMENT` | Convex deployment ID | ✅ |
| `CONVEX_URL` | Convex database URL | ✅ |
| `AI_API_URL` | TL;DR AI API endpoint | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |


## 📊 Data & Content

### Research Papers
- **Format**: Scraped PDFs from NASA CSV to MDX files in `data/papers/`
- **Count**: 608 summarized papers
- **Topics**: Space biology, microgravity, astrobiology
- **Sources**: NASA, ESA, academic journals

### Database Schema
```typescript
// Conversations
conversations: {
  title: string
  createdAt: number
  updatedAt: number
}

// Messages
messages: {
  conversationId: Id<"conversations">
  role: "user" | "assistant"
  content: string
  timestamp: number
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.


## 🌟 Acknowledgments

- **NASA Space Apps Challenge** - For the inspiring challenge
- **Research Community** - For the valuable scientific papers
- **Open Source Libraries** - For the amazing tools and frameworks
- **Team Contributors** - For their dedication and hard work

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact **GitHub**: [@a04k](https://github.com/a04k)

---

<div align="center">
  <p><strong>Built with ❤️ for NASA Space Apps Challenge 2025</strong></p>
  <p>Making space research accessible to everyone</p>
</div>