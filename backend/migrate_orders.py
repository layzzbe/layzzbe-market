import pymysql
conn = pymysql.connect(host='localhost', user='root', password='', database='layzzbe_market', charset='utf8mb4')
c = conn.cursor()

migrations = [
    ('product_category', 'ALTER TABLE orders ADD COLUMN product_category VARCHAR(100) DEFAULT NULL'),
    ('status', 'ALTER TABLE orders ADD COLUMN status VARCHAR(30) DEFAULT NULL'),
]

for col, sql in migrations:
    try:
        c.execute(sql)
        print(col + ': qoshildi')
    except Exception as e:
        print(col + ': ' + str(e))

conn.commit()
c.execute('SHOW COLUMNS FROM orders')
print('ORDERS cols:', [r[0] for r in c.fetchall()])
conn.close()
print('DONE')
