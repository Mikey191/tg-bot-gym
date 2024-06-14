CREATE TABLE groups (
 id SERIAL PRIMARY KEY,
 name VARCHAR(255) NOT NULL UNIQUE
)
CREATE TABLE exercises (
 id SERIAL PRIMARY KEY,
 name VARCHAR(255) NOT NULL,
 namegroup VARCHAR(255) NOT NULL,
 FOREIGN KEY (namegroup) REFERENCES groups (name)
)
CREATE TABLE users (
 id SERIAL PRIMARY KEY,
 telegram_id VARCHAR(255) NOT NULL UNIQUE
)
CREATE TABLE result_table (
 id SERIAL PRIMARY KEY,
 telegram_id VARCHAR(255) NOT NULL,
 date DATE,
 group_name VARCHAR(255) NOT NULL,
 exercises_name VARCHAR(255) NOT NULL,
 count INTEGER,
 weight FLOAT,
 FOREIGN KEY (telegram_id) REFERENCES users (telegram_id),
 FOREIGN KEY (group_name) REFERENCES groups (name)
)