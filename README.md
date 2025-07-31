# LifePilot

A comprehensive full-stack AI assistant application that helps users manage their daily life through intelligent automation and insights.

## 🚀 Features

- **Smart Dashboard**: Personalized insights and recommendations
- **AI Agents**: LangChain-powered intelligent assistants
- **Real-time Analytics**: Track and analyze life patterns
- **Multi-modal Interface**: Chat, voice, and visual interactions
- **Cloud Integration**: Scalable Azure-based infrastructure

## 🏗️ Architecture

- **Frontend**: React 18 + Tailwind CSS + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **AI Layer**: LangChain agents with custom tools
- **Database**: Azure Cosmos DB / PostgreSQL
- **Infrastructure**: Terraform + Azure + Jenkins CI/CD
- **Deployment**: Docker containers with GitHub Actions

## 📦 Project Structure

├── frontend/ # React application
├── backend/ # Express API server
├── ai-agents/ # LangChain AI logic
├── infrastructure/ # Terraform & deployment configs
├── docs/ # Documentation
└── mock-data/ # Sample data for development

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Terraform
- Azure CLI

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/kelvinchau34/lifepilot.git
   cd lifepilot

   ```

2. **Install dependencies**

   ```bash
   npm run install:all

   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration

   ```

4. **Start development servers**

   ```bash
   npm run dev

   ```

5. **Access the application**

Frontend: http://localhost:3000
Backend API: http://localhost:8000
AI Agents: http://localhost:8001
