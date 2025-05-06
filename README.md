
# CareerGPT

CareerGPT is an AI-powered career assistant that helps users navigate their job search journey with personalized guidance, resume analysis, job matching, and mock interview practice.

![CareerGPT Demo](https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=600)

## 🚀 Features

- **Resume Analysis**: Upload your resume and get AI-powered insights on how to improve it for better job matches.
- **Job Matching**: Receive personalized job suggestions based on your skills, experience, and career goals.
- **Mock Interviews**: Practice with AI-simulated interviews tailored to your target roles and get instant feedback.
- **Personalized Dashboard**: Track your career progress and get tailored recommendations based on your profile.
- **User Authentication**: Secure login and signup to access personalized features and save your data.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: TanStack React Query
- **Routing**: React Router
- **Backend**: Supabase (Authentication, Database, Storage)
- **Data Visualization**: Recharts

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Supabase account (for backend services)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/careergpt.git
   cd careergpt
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 🔍 Project Structure

```
careergpt/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Auth/        # Authentication related components
│   │   ├── Interview/   # Interview practice components
│   │   ├── Layout/      # Page layout components
│   │   ├── Resume/      # Resume management components
│   │   └── ui/          # shadcn/ui components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Third-party integrations
│   ├── lib/             # Utility functions
│   └── pages/           # Application pages
├── supabase/            # Supabase configuration
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## 🔐 Authentication

CareerGPT uses Supabase Authentication for secure user management. Users can sign up with email/password or use third-party OAuth providers like Google, GitHub, etc.

## 📊 Database Schema

The application uses the following main tables in Supabase:
- `users` - User profiles and preferences
- `resumes` - Uploaded resumes and analysis results
- `interviews` - Mock interview sessions and feedback
- `jobs` - Job matching results and saved jobs

## 🚀 Deployment

The application can be deployed using any static site hosting service that supports React applications:

1. Build the production-ready bundle:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy the `dist` directory to your hosting service of choice.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [Lucide Icons](https://lucide.dev/)
