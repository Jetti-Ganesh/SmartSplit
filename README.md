# SmartSplit - Expense Sharing Application

![SmartSplit Logo](https://img.shields.io/badge/SmartSplit-v1.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Team Members](#team-members)
- [Contributing](#contributing)

---

## 🎯 Overview

**SmartSplit** is an intelligent web-based expense-sharing application designed to simplify and streamline the management of shared expenses among friends, roommates, colleagues, and travel groups. It eliminates the awkwardness and confusion of tracking who owes whom by providing a fair, transparent, and automated system for splitting costs.

Whether you're managing household expenses, planning a trip with friends, or coordinating group activities, SmartSplit makes it easy to:
- Track shared expenses
- Automatically split costs among group members
- Calculate who owes whom
- Settle debts efficiently
- View spending analytics

---

## ✨ Features

### 1. **Group Management**
- Create and manage multiple expense groups
- Add/remove group members easily
- Set different groups for household, travel, projects, etc.
- View all group details and member lists

### 2. **Expense Tracking**
- Add expenses to groups with detailed information
- Split expenses equally or customize amounts
- Categorize expenses for better organization
- Track expense history with timestamps

### 3. **Smart Balance Calculation**
- Real-time balance updates
- Instantly see who owes whom
- Visual representation of debts (You Owe / You Are Owed)
- Net balance calculation

### 4. **Settlement System**
- Record payments between group members
- Automatic balance updates after settlement
- Optimize settlement paths to minimize transactions
- Settlement history tracking

### 5. **Activity Feed**
- Comprehensive activity log for all group actions
- Track all expenses, payments, and settlements
- Detailed timestamps and user information
- View individual and group activity

### 6. **User Authentication & Security**
- Secure user registration and login
- Email/phone verification (OTP support)
- JWT token-based authentication
- Password encryption with bcryptjs
- Optional two-factor authentication

### 7. **User Profile Management**
- Manage personal information
- Update profile picture
- Add mobile number verification
- View account statistics (total volume, fairness score, etc.)

### 8. **Analytics & Dashboard**
- Visual dashboard with balance overview
- Spending trends and patterns
- Group-wise expense breakdown
- Member statistics and fairness metrics

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **CSS3** - Styling
- **Chart.js** - Data visualization
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - Authentication tokens
- **bcryptjs** - Password encryption
- **Nodemailer** - Email notifications
- **Twilio** - SMS/OTP services

### External Services
- **Google OAuth** - Social authentication
- **Nodemailer** - Email notifications
- **Twilio** - SMS and OTP delivery
- **Chart.js** - Analytics visualization

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Jetti-Ganesh/SmartSplit.git
cd SmartSplit/Server
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartsplit
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
NODEMAILER_EMAIL=your_email
NODEMAILER_PASSWORD=your_app_password
```

5. **Start the backend server**
```bash
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup

1. **Navigate to Client directory**
```bash
cd ../Client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

5. **Start the development server**
```bash
npm start
# Application runs on http://localhost:3000
```

---

## 📁 Project Structure

```
SmartSplit/
├── Client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Groups.jsx
│   │   │   ├── SettleUp.jsx
│   │   │   ├── Activity.jsx
│   │   │   └── Profile.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── groupService.js
│   │   │   └── expenseService.js
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── groupSlice.js
│   │   │   │   └── expenseSlice.js
│   │   │   └── store.js
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── README.md
│
├── Server/
│   ├── models/
│   │   ├── user.model.js
│   │   ├── group.model.js
│   │   ├── expense.model.js
│   │   └── settlement.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── group.routes.js
│   │   ├── expense.routes.js
│   │   ├── settlement.routes.js
│   │   └── user.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── groupController.js
│   │   ├── expenseController.js
│   │   ├── settlementController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🚀 Usage

### 1. **User Registration & Login**
```
1. Click "Sign Up" on landing page
2. Enter name, email, phone, and password
3. Verify OTP sent to your email/phone
4. Login with credentials
```

### 2. **Create a Group**
```
1. Navigate to "Groups" section
2. Click "Create New Group"
3. Enter group name (e.g., "Roommates", "Trip 2024")
4. Add members by email/phone
5. Start adding expenses
```

### 3. **Add an Expense**
```
1. Open a group
2. Click "Add Expense"
3. Enter amount, description, and category
4. Select who paid
5. Choose split method (Equal/Custom)
6. Add participants and their shares
7. Submit
```

### 4. **View Balances**
```
1. Go to Dashboard to see overview
2. Check "You Owe" and "You Are Owed" amounts
3. Click on specific groups for detailed breakdown
4. View person-wise balances
```

### 5. **Settle Debts**
```
1. Navigate to "Settle Up"
2. View outstanding debts
3. Record a payment
4. Confirm settlement
5. System auto-updates all balances
```

### 6. **View Activity**
```
1. Click "Activity" tab
2. See all transactions in chronological order
3. Filter by date range or group
4. View detailed transaction information
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register       - User registration
POST   /api/auth/login          - User login
POST   /api/auth/logout         - User logout
POST   /api/auth/verify-otp     - Verify OTP
POST   /api/auth/refresh-token  - Refresh JWT token
```

### Groups
```
GET    /api/groups              - Get all user groups
POST   /api/groups              - Create new group
GET    /api/groups/:id          - Get group details
PUT    /api/groups/:id          - Update group
DELETE /api/groups/:id          - Delete group
POST   /api/groups/:id/members  - Add member to group
DELETE /api/groups/:id/members/:memberId - Remove member
```

### Expenses
```
GET    /api/expenses            - Get all expenses
POST   /api/expenses            - Add new expense
GET    /api/expenses/:id        - Get expense details
PUT    /api/expenses/:id        - Update expense
DELETE /api/expenses/:id        - Delete expense
GET    /api/groups/:id/expenses - Get group expenses
```

### Settlements
```
GET    /api/settlements         - Get all settlements
POST   /api/settlements         - Record settlement
GET    /api/settlements/:id     - Get settlement details
GET    /api/balances            - Get user balances
GET    /api/groups/:id/balances - Get group balances
```

### User
```
GET    /api/user/profile        - Get user profile
PUT    /api/user/profile        - Update profile
POST   /api/user/avatar         - Upload avatar
GET    /api/user/activity       - Get user activity feed
```

---

## 💾 Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  password: String (hashed),
  profilePicture: String,
  avatar: String,
  fairnessScore: Number,
  totalVolume: Number,
  isVerified: Boolean,
  verificationToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Group Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdBy: ObjectId (User),
  members: [ObjectId] (User IDs),
  expenses: [ObjectId] (Expense IDs),
  settlements: [ObjectId] (Settlement IDs),
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Model
```javascript
{
  _id: ObjectId,
  groupId: ObjectId,
  description: String,
  amount: Number,
  category: String,
  paidBy: ObjectId (User),
  splits: [
    {
      userId: ObjectId,
      amount: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Settlement Model
```javascript
{
  _id: ObjectId,
  groupId: ObjectId,
  fromUser: ObjectId,
  toUser: ObjectId,
  amount: Number,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📸 Screenshots

### Dashboard
The main dashboard displays:
- Welcome message with user name
- Balance overview (You Owe / You Are Owed / Net Balance)
- Quick action buttons (Add Expense / Settle Up)
- Recent groups with member count
- Activity feed with latest transactions

### Groups
- List of all user groups
- Quick group statistics
- Add/Join group functionality
- Member count display
- Group creation modal

### Settle Up
- Outstanding debts display
- Settlement history
- Optimize debt settlement suggestions
- Record new settlements
- Fairness metrics

### Activity
- Chronological activity feed
- Filter by date and group
- Spending trends visualization
- Transaction details
- User and group specific views

### Profile
- User account details
- Profile picture upload
- Mobile number verification
- Account statistics
- Security settings

---

## 🚧 Future Enhancements

### Phase 2 Features
- [ ] **Mobile App** - React Native/Flutter application
- [ ] **Real-time Notifications** - WebSocket integration for live updates
- [ ] **Advanced Analytics** - Monthly/yearly spending reports
- [ ] **Recurring Expenses** - Automatic expense creation
- [ ] **Bill Splitting** - Smart bill split suggestions
- [ ] **Export Features** - PDF/Excel report generation
- [ ] **Multi-currency Support** - Handle different currencies
- [ ] **Expense Categories** - Better categorization and filtering
- [ ] **Receipt Upload** - Image recognition for expense details
- [ ] **Dark Mode** - Theme customization
- [ ] **Group Chat** - In-app messaging for group discussions
- [ ] **Payment Integration** - Direct payment processing (Stripe, PayPal)
- [ ] **Wishlist Splitting** - Split purchase costs for group items
- [ ] **Budget Tracking** - Set and monitor group budgets

### Optimization Goals
- [ ] Caching strategy implementation
- [ ] Database query optimization
- [ ] Frontend performance improvements
- [ ] Progressive Web App (PWA) conversion
- [ ] CDN integration for assets
- [ ] Load testing and optimization

---

## 👥 Team Members

| Name | Roll Number | Role |
|------|------------|------|
| J. Ganesh Babu | 23018-CM-037 | Full Stack Developer |
| A. Jagan | 23018-CM-026 | Backend Developer |
| R. Sathyananda | 23018-CM-058 | Frontend Developer |

**Project Guide:** K. Harisankar, M. Tech, Lecturer in Computer Engineering

**Institution:** Sri Venkateswara Government Polytechnic, Tirupati, Andhra Pradesh

---

## 🤝 Contributing

We welcome contributions! To contribute to SmartSplit:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly
- Keep commits atomic and meaningful

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **GitHub Repository:** [SmartSplit](https://github.com/Jetti-Ganesh/SmartSplit)
- **Live Demo:** [SmartSplit Demo](https://smartsplit-demo.example.com)
- **Documentation:** [Full Documentation](./docs)

---

## 📧 Contact & Support

For questions, suggestions, or bug reports:
- **Email:** smartsplit.support@example.com
- **GitHub Issues:** [Report Issues](https://github.com/Jetti-Ganesh/SmartSplit/issues)
- **Discussion Forum:** [Community Discussion](https://github.com/Jetti-Ganesh/SmartSplit/discussions)

---

## 🙏 Acknowledgments

- Sri Venkateswara Government Polytechnic, Tirupati
- State Board of Technical Education and Training, Andhra Pradesh
- Our guide K. Harisankar and all faculty members
- Open source community for amazing libraries and tools

---

## 📊 Project Statistics

- **Lines of Code:** 5000+
- **Files:** 50+
- **Components:** 15+
- **API Endpoints:** 20+
- **Database Collections:** 4
- **Development Time:** 6 months

---

## ⭐ Show Your Support

If you find SmartSplit helpful, please give it a ⭐ on GitHub!

---

**Last Updated:** June 2026  
**Version:** 1.0.0  
**Status:** Active Development
