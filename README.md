# Personal Finance Visualizer

A simple web application to track your personal finances, visualize expenses, and manage budgets.

## Features

### Stage 1: Basic Transaction Tracking (Current Stage)
- Add, edit, and delete transactions
- View transaction history
- Visualize monthly expenses with a bar chart

### Stage 2: Categories (Coming Soon)
- Categorize transactions
- Visualize expenses by category
- Track spending patterns

### Stage 3: Budgeting (Coming Soon)
- Set monthly budgets by category
- Compare actual spending vs. budget
- Get insights on spending habits

## Tech Stack

- **Framework**: Next.js
- **UI Components**: React with shadcn/ui
- **Charts**: Recharts
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd personal-finance-visualizer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Copy the `.env.local.example` file to `.env.local`
   - Update the MongoDB connection string

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Dashboard**: View your financial summary and recent transactions
2. **Transactions**: Add, edit, and manage your transactions
3. **Budgets**: Set and track your monthly budgets (coming in Stage 3)

## License

This project is open source and available under the [MIT License](LICENSE).
