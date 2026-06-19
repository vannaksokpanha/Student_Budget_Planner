create database if not exists balance_db;
use balance_db;

-- 1. Create Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- 2. Create Budgets Table (1:1 with users)
CREATE TABLE budgets (
    budget_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    monthly_income DECIMAL(10, 2) DEFAULT 0.00,
    daily_allowance DECIMAL(10, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Create Groups Table
CREATE TABLE budget_group (
    group_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    group_budget DECIMAL(10, 2) DEFAULT 0.00,
    token VARCHAR(20) UNIQUE NOT NULL
);

-- 4. Create Memberships Table (M:M bridge)
CREATE TABLE memberships (
    membership_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    member_role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES budget_group(group_id) ON DELETE CASCADE
);

-- 5. Create Expenses Table (Supports personal and group)
CREATE TABLE expenses (
    expense_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    group_id INT NULL,
    category VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 1,
    expense_description TEXT,
    expense_date DATE NOT NULL,
    expense_type VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES budget_group(group_id) ON DELETE SET NULL,
    CONSTRAINT check_expense_type CHECK (expense_type IN ('Fixed', 'Daily Spending', 'Group Expense'))
);

-- 6. Create Saving_Goals Table
CREATE TABLE saving_goals (
    goal_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0.00,
    target_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);