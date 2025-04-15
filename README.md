# Personal Finance Visualizer

A modern web application for managing and visualizing personal finances, built with Next.js and MongoDB.

## Features

- **Transaction Management**
  - Add, edit, and delete transactions
  - Categorize transactions
  - Support for recurring transactions
  - Export transactions to CSV
  - Advanced filtering and search

- **Budget Management**
  - Create and manage budgets by category
  - Track spending against budgets
  - Visual budget comparison charts
  - Monthly budget overview

- **Visual Analytics**
  - Monthly expense charts
  - Budget vs actual spending visualization
  - Category-wise spending analysis

- **Modern UI**
  - Built with shadcn/ui components
  - Responsive design
  - Dark mode support
  - Interactive charts and graphs

## Tech Stack

- **Frontend**
  - Next.js 14
  - React 19
  - shadcn/ui
  - Tailwind CSS
  - Recharts

- **Backend**
  - Next.js API Routes
  - MongoDB
  - Mongoose

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/personal-finance-visualizer.git
   cd personal-finance-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── budgets/         # Budget management pages
│   ├── transactions/    # Transaction management pages
│   └── layout.js        # Root layout
├── components/
│   ├── ui/             # shadcn/ui components
│   └── shared/         # Shared components
├── models/             # MongoDB models
├── utils/             # Utility functions
└── lib/               # Library functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
