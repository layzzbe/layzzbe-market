import pymysql
conn = pymysql.connect(host='localhost', user='root', password='', database='layzzbe_market', charset='utf8mb4')
c = conn.cursor()

# users.balance
try:
    c.execute('ALTER TABLE users ADD COLUMN balance FLOAT DEFAULT 0.0')
    print('users.balance: qoshildi')
except Exception as e:
    print('users.balance:', e)

# transactions table
try:
    c.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(20) NOT NULL,
            amount FLOAT NOT NULL,
            currency VARCHAR(10) DEFAULT 'UZS',
            description VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ''')
    print('transactions: yaratildi')
except Exception as e:
    print('transactions:', e)

conn.commit()
c.execute('SHOW COLUMNS FROM users')
print('USERS:', [r[0] for r in c.fetchall()])
c.execute('SHOW COLUMNS FROM transactions')
print('TRANSACTIONS:', [r[0] for r in c.fetchall()])
conn.close()
print('DONE')
