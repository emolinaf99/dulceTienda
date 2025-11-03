import sequelize from './config/database.js';

async function addPasswordResetColumns() {
  try {
    console.log('Adding reset_password_token and reset_password_expires columns to users table...');

    await sequelize.query(`
      ALTER TABLE users
      ADD COLUMN reset_password_token VARCHAR(255) NULL,
      ADD COLUMN reset_password_expires DATETIME NULL;
    `);

    console.log('✅ Columns added successfully!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Columns already exist, skipping...');
      process.exit(0);
    } else {
      console.error('Error adding columns:', error.message);
      process.exit(1);
    }
  }
}

addPasswordResetColumns();
