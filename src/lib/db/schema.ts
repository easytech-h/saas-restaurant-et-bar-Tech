import { Knex } from 'knex';

export async function createTables(knex: Knex) {
  // Users
  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('email').unique().notNullable();
      table.string('name').notNullable();
      table.string('role').notNullable();
      table.timestamps(true, true);
    });
  }

  // Products
  if (!(await knex.schema.hasTable('products'))) {
    await knex.schema.createTable('products', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('category').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.decimal('cost', 10, 2).notNullable();
      table.integer('stock').notNullable();
      table.integer('min_stock').notNullable();
      table.timestamps(true, true);
    });
  }

  // Orders
  if (!(await knex.schema.hasTable('orders'))) {
    await knex.schema.createTable('orders', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('user_id').references('id').inTable('users');
      table.string('status').notNullable();
      table.decimal('total', 10, 2).notNullable();
      table.integer('table_number');
      table.timestamps(true, true);
    });
  }

  // Order Items
  if (!(await knex.schema.hasTable('order_items'))) {
    await knex.schema.createTable('order_items', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('order_id').references('id').inTable('orders');
      table.uuid('product_id').references('id').inTable('products');
      table.integer('quantity').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.string('status').notNullable();
      table.timestamps(true, true);
    });
  }

  // Inventory Transactions
  if (!(await knex.schema.hasTable('inventory_transactions'))) {
    await knex.schema.createTable('inventory_transactions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('product_id').references('id').inTable('products');
      table.integer('quantity').notNullable();
      table.string('type').notNullable(); // 'in' or 'out'
      table.string('reason').notNullable();
      table.timestamps(true, true);
    });
  }
}