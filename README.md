# 📚 Syllabus Genie

<p align="center">
  <strong>AI-Powered Syllabus Analyzer & Study Assistant</strong>
</p>

<p align="center">
  Upload your syllabus, get AI-extracted important topics, and ask questions to understand concepts better.
</p>

---

## 🎯 What is Syllabus Genie?

Syllabus Genie is an intelligent web application that helps students **understand and prioritize their study material**. Instead of manually parsing through lengthy syllabi, students can:

1. **Upload** their syllabus (PDF or text)
2. **Get AI-analyzed** important topics with priority levels (high/medium/low)
3. **Ask questions** about any concept through an interactive chat interface

The AI explains complex topics in simple, understandable terms, making learning more accessible.

---

## ✨ Features

| Feature                    | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| 📄 **PDF Upload**          | Upload syllabus PDFs with automatic text extraction           |
| ✏️ **Text Input**          | Paste or type syllabus content directly                       |
| 🤖 **AI Topic Extraction** | Identifies 5-8 most important topics with priority levels     |
| 💬 **Interactive Chat**    | Ask questions about your syllabus with streaming AI responses |
| 🔐 **User Authentication** | Secure sign-up/sign-in with email and password                |
| 💾 **Data Persistence**    | Syllabi and topics saved to your account                      |
| 🎨 **Modern UI**           | Beautiful, responsive design with warm gradients              |

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **React Query** - Server state management
- **React Router** - Client-side routing
- **PDF.js** - Client-side PDF text extraction

### Backend

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - User authentication
  - Edge Functions (Deno runtime)
  - Row Level Security (RLS)

### AI Integration

- **Google Gemini 2.5 Flash** - LLM for syllabus analysis and chat (via Lovable AI Gateway)

---

## 📁 Project Structure

```
syllabus-genie/
├── src/
│   ├── components/
│   │   ├── Auth.tsx           # Authentication UI (sign-in/sign-up)
│   │   ├── FileUpload.tsx     # PDF/TXT file upload with extraction
│   │   ├── ChatInterface.tsx  # AI chat with streaming responses
│   │   ├── TopicsList.tsx     # Display analyzed topics
│   │   └── ui/                # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx          # Main application page
│   │   └── NotFound.tsx       # 404 page
│   ├── integrations/
│   │   └── supabase/          # Supabase client configuration
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility functions
├── supabase/
│   ├── functions/
│   │   ├── analyze-syllabus/  # Extract topics from syllabus
│   │   └── syllabus-chat/     # Chat about syllabus content
│   └── migrations/            # Database schema migrations
├── public/                    # Static assets
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm/yarn/bun
- **Supabase** account (for backend services)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/krit-vardhan-mishra/syllabus-genie.git
   cd syllabus-genie
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**

   - Create a new Supabase project
   - Run the migrations from `supabase/migrations/` folder
   - Deploy edge functions from `supabase/functions/`
   - Add `LOVABLE_API_KEY` to your Supabase Edge Function secrets

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open in browser**

   Navigate to `http://localhost:5173`

---

## 🗄️ Database Schema

### Tables

**`syllabi`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner of the syllabus |
| title | TEXT | Syllabus title |
| content | TEXT | Full syllabus content |
| file_url | TEXT | Optional file URL |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**`topics`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| syllabus_id | UUID | Reference to syllabus |
| title | TEXT | Topic title |
| importance | TEXT | Priority: high/medium/low |
| description | TEXT | Topic description |
| created_at | TIMESTAMP | Creation timestamp |

---

## 🔒 Security

- **Row Level Security (RLS)** - Users can only access their own data
- **JWT Authentication** - Secure token-based auth via Supabase
- **Edge Functions** - Serverless functions with secure API key handling

---

## 📝 How It Works

### 1. User Flow

```
Sign In → Upload/Describe Syllabus → View Important Topics → Chat with AI
```

### 2. Syllabus Analysis

When a user submits a syllabus, the `analyze-syllabus` edge function:

1. Receives the syllabus content
2. Sends it to Gemini AI with a specialized prompt
3. Parses the AI response to extract structured topics
4. Saves both syllabus and topics to the database
5. Returns the analyzed data to the frontend

### 3. Interactive Chat

The `syllabus-chat` edge function:

1. Retrieves the user's syllabus content from the database
2. Streams Gemini AI responses in real-time
3. Provides context-aware answers using the syllabus as reference

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Krit Vardhan Mishra**

- GitHub: [@krit-vardhan-mishra](https://github.com/krit-vardhan-mishra)

---

<p align="center">Made with ❤️ for students everywhere</p>
