# 🚀 CosmoDEX - Blockchain Indexing Platform
![IMAGE 2025-03-30 17:34:10](https://github.com/user-attachments/assets/c7662d83-814a-4e35-840f-16796da628d2)

A powerful platform for indexing Solana blockchain data using Helius API and storing it in your own PostgreSQL database.

## 📺 Product Walkthrough
[![CosmoDEX Walkthrough Video](https://img.youtube.com/vi/y5m2_vk0wHc/0.jpg)](https://youtu.be/y5m2_vk0wHc?si=W1YtZeiVMV84rFsF)

*Click the image above to watch our walkthrough video*

## 🔎 Overview

This platform allows developers to easily set up and manage Solana blockchain indexers using the Helius API and their own PostgreSQL database. The system provides a comprehensive set of features for configuring, monitoring, and managing blockchain data indexing in a user-friendly way through Helius API.

![IMAGE 2025-03-30 17:34:27](https://github.com/user-attachments/assets/571ec88c-2f10-48a9-9540-d1d5aa8924c7)

## 🖋️ Hosted Link: [Live link](https://indexer-fe.vercel.app/)
## 🖋️ API Docs: https://soumiks-organization.gitbook.io/galaxydb/

## ✨ Features

- **🔐 User Authentication**: Secure registration and login system
- **🗄️ Database Management**: Connect and manage your PostgreSQL databases
- **⚙️ Indexer Configuration**: Create custom indexers with specific filters and transformations
- **🔗 Helius Integration**: Seamless connection to Solana blockchain via Helius API
- **⚡ Real-time Indexing**: Process blockchain data as it happens
- **🔄 Customizable Transformations**: Define how data should be structured in your database
- **📊 Dashboard & Monitoring**: Track performance and troubleshoot issues

## 📋 Installation

### Prerequisites

- 📦 Node.js (v14 or higher)
- 🐘 PostgreSQL (v12 or higher)
- 🔑 Helius API key (sign up at [https://helius.xyz](https://helius.xyz))

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/blockchain-indexing-platform.git
cd blockchain-indexing-platform/backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your database and Helius API credentials.

4. Run migrations:

```bash
npm run migration:run
```

5. Start the server:

```bash
npm run start:dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your backend API URL.

4. Start the development server:

```bash
npm run dev
```

## 🚦 Quick Start Guide

1. **👤 Register an account** at `{your-domain}/auth/register`
2. **🔌 Add a database connection** with your PostgreSQL credentials
3. **🛠️ Create an indexer** with your desired filters and transformations
4. **▶️ Activate the indexer** to start receiving blockchain data
5. **📈 Monitor the dashboard** to see your indexed data in action

## 📚 API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Create a new user account |
| `/auth/login` | POST | Authenticate and receive a JWT token |
| `/auth/profile` | GET | Get the current user's profile |

### Database Connections

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/database` | GET | List all database connections |
| `/database` | POST | Create a new database connection |
| `/database/test` | POST | Test database connection credentials |
| `/database/{id}` | GET | Get a specific database connection |
| `/database/{id}` | PATCH | Update a database connection |
| `/database/{id}` | DELETE | Delete a database connection |

### Indexers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/indexer` | GET | List all indexers |
| `/indexer` | POST | Create a new indexer |
| `/indexer/{id}` | GET | Get a specific indexer |
| `/indexer/{id}` | PATCH | Update an indexer |
| `/indexer/{id}` | DELETE | Delete an indexer |
| `/indexer/{id}/activate` | POST | Activate an indexer |
| `/indexer/{id}/deactivate` | POST | Deactivate an indexer |
| `/indexer/stats` | GET | Get overall indexing statistics |
| `/indexer/{id}/metrics` | GET | Get metrics for a specific indexer |
| `/indexer/{id}/logs` | GET | Get logs for a specific indexer |

### Helius Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/helius/webhooks` | GET | List all Helius webhooks |
| `/helius/webhook` | POST | Create a new Helius webhook |
| `/helius/webhook/{id}` | GET | Get a specific webhook |
| `/helius/webhook/{id}` | PUT | Update a webhook |
| `/helius/webhook/{id}` | DELETE | Delete a webhook |
| `/helius/nft/metadata` | POST | Get enhanced NFT metadata |

### Webhook Reception

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook` | POST | Receive incoming webhook data from Helius |

## 💻 Example Usage

### Creating a Database Connection

```javascript
const response = await fetch('https://your-api.com/database', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Production Database',
    host: 'db.example.com',
    port: 5432,
    username: 'dbuser',
    password: 'dbpassword',
    database: 'blockchain_data'
  })
});

const data = await response.json();
console.log('Database connection created:', data);
```

### Creating an Indexer for NFT Transactions

```javascript
const response = await fetch('https://your-api.com/indexer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'NFT Transactions Indexer',
    description: 'Indexes all NFT transactions on Solana',
    databaseConnectionId: 'db-connection-uuid-1',
    schemaName: 'nft_data',
    filters: {
      programIds: [
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
      ],
      transactionTypes: ['NFT_SALE']
    },
    transformations: {
      includeMetadata: true,
      customFields: [
        {
          name: 'seller_address',
          path: 'events[0].source',
          type: 'string'
        },
        {
          name: 'buyer_address',
          path: 'events[0].destination',
          type: 'string'
        },
        {
          name: 'sale_amount',
          path: 'events[0].amount',
          type: 'numeric'
        }
      ]
    }
  })
});

const data = await response.json();
console.log('Indexer created:', data);
```

## 🏗️ Project Structure

```
blockchain-indexer/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── database/          # Database connection management
│   │   ├── helius/            # Helius API integration
│   │   ├── indexer/           # Core indexing logic
│   │   ├── webhook/           # Webhook processing
│   │   └── main.ts            # Application entry point
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Next.js page components
│   │   ├── services/          # API service integrations
│   │   └── ...
│   └── ...
└── ...
```

## 👨‍💻 Development

### Setting Up the Development Environment

1. Fork and clone the repository
2. Set up the backend and frontend as described in the installation section
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Run tests to ensure everything works correctly
6. Submit a pull request

### Running Tests

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Helius](https://helius.xyz) - For their powerful Solana blockchain API
- [NestJS](https://nestjs.com) - For the backend framework
- [Next.js](https://nextjs.org) - For the frontend framework
- All contributors who have helped shape this project

## 📬 Contact

For any questions or support, please open an issue or contact the maintainers at [Sweta Karar](mailto:kararsweta@gmail.com).
