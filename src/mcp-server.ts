/* ===============================
   MCP SAFE BOOTSTRAP
================================ */

// Redirect ALL stdout to stderr to prevent breaking the MCP protocol
// const originalLog = console.log;
// console.log = (...args: any[]) => {
//   console.error(...args);
// };

// MUST be first — silences dotenv output
process.env.DOTENV_CONFIG_QUIET = 'true';

import path from 'path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from 'pg';
import dotenv from 'dotenv';

/* ===============================
ENV SETUP (SAFE)
================================ */

// Use __dirname to ensure we are relative to the script location,
// regardless of where node was launched from.
const envPath = path.resolve(
  __dirname,
  '..',
  'env',
  `.env.${process.env.NODE_ENV || 'development'}`,
);

// Load env manually first
dotenv.config({ path: envPath });

// console.error('ENV FILE PATH:', envPath);
// console.error('DB_PASSWORD loaded:', !!process.env.DB_PASSWORD);
/* ===============================
   ENV VALIDATION (CRITICAL)
================================ */

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_PASSWORD) {
  throw new Error('DB_PASSWORD is missing or undefined');
}

/* ===============================
   DB CONNECTION
================================ */

const dbClient = new Client({
  host: DB_HOST,
  port: Number(DB_PORT || 5432),
  user: DB_USERNAME,
  password: String(DB_PASSWORD), // force string
  database: DB_NAME,
});

/* ===============================
   MCP SERVER INIT
================================ */

const server = new Server(
  {
    name: 'ecommerce-backend-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

/* ===============================
   TOOL DEFINITIONS
================================ */

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [
    {
      name: 'health_check',
      description: 'Check if MCP ecommerce server is running',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_product_by_id',
      description: 'Get product details by product ID',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
        },
        required: ['productId'],
      },
    },
    {
      name: 'search_products',
      description: 'Search products by name',
      inputSchema: {
        type: 'object',
        properties: {
          keyword: { type: 'string' },
        },
        required: ['keyword'],
      },
    },
    {
      name: 'check_stock',
      description: 'Check stock for a product',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
        },
        required: ['productId'],
      },
    },
    {
      name: 'add_product',
      description: 'Create a new product with its first variant',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          brand: { type: 'string' },
          category_id: { type: 'string', description: 'UUID of the category' },
          user_id: {
            type: 'string',
            description: 'UUID of the admin/user creating the product',
          },
          price: { type: 'number' },
          stock_qty: { type: 'number' },
          sku: { type: 'string' },
          color: { type: 'string' },
          size: { type: 'string' },
        },
        required: [
          'name',
          'description',
          'category_id',
          'user_id',
          'price',
          'stock_qty',
          'sku',
        ],
      },
    },
    {
      name: 'list_products',
      description: 'List products in the store (max 50)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'list_categories',
      description: 'List all product categories',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

/* ===============================
   TOOL EXECUTION
================================ */

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case 'health_check':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { status: 'ok', service: 'ecommerce-mcp' },
                null,
                2,
              ),
            },
          ],
        };

      case 'get_product_by_id': {
        const { productId } = request.params.arguments as { productId: string };

        const result = await dbClient.query(
          `SELECT id, name, price, stock
           FROM products
           WHERE id = $1`,
          [productId],
        );

        if (!result.rows.length) {
          return {
            content: [{ type: 'text', text: 'Product not found' }],
            isError: true,
          };
        }

        return {
          content: [
            { type: 'text', text: JSON.stringify(result.rows[0], null, 2) },
          ],
        };
      }

      case 'search_products': {
        const { keyword } = request.params.arguments as { keyword: string };

        const result = await dbClient.query(
          `SELECT id, name, price
           FROM products
           WHERE name ILIKE $1
           LIMIT 10`,
          [`%${keyword}%`],
        );

        return {
          content: [
            { type: 'text', text: JSON.stringify(result.rows, null, 2) },
          ],
        };
      }

      case 'check_stock': {
        const { productId } = request.params.arguments as { productId: string };

        const result = await dbClient.query(
          `SELECT stock FROM products WHERE id = $1`,
          [productId],
        );

        if (!result.rows.length) {
          return {
            content: [{ type: 'text', text: 'Product not found' }],
            isError: true,
          };
        }

        const stock = result.rows[0].stock;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  productId,
                  stock,
                  status: stock > 0 ? 'in_stock' : 'out_of_stock',
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      /* ---------- ADD PRODUCT ---------- */
      case 'add_product': {
        const args = request.params.arguments as any;
        const {
          name,
          description,
          brand,
          category_id,
          user_id,
          price,
          stock_qty,
          sku,
          color,
          size,
        } = args;

        try {
          // 1. Insert Product
          const productResult = await dbClient.query(
            `INSERT INTO products (name, description, brand, category_id, user_id, availability, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             RETURNING id`,
            [
              name,
              description,
              brand || null,
              category_id,
              user_id,
              'INSTOCK',
              true,
            ],
          );

          const newProductId = productResult.rows[0].id;

          // 2. Insert Variant
          await dbClient.query(
            `INSERT INTO product_variants (product_id, price, stock_qty, sku, color, size, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [newProductId, price, stock_qty, sku, color || null, size || null],
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    message: 'Product created successfully',
                    productId: newProductId,
                    sku: sku,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          console.error('Database error in add_product:', error);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `Failed to add product: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'list_products': {
        const result = await dbClient.query(
          `SELECT id, name, description, brand, availability, is_active FROM products LIMIT 50`,
        );

        return {
          content: [
            { type: 'text', text: JSON.stringify(result.rows, null, 2) },
          ],
        };
      }

      case 'list_categories': {
        const result = await dbClient.query(
          `SELECT id, name, description FROM categories`,
        );

        return {
          content: [
            { type: 'text', text: JSON.stringify(result.rows, null, 2) },
          ],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: 'Unknown tool' }],
          isError: true,
        };
    }
  } catch (error) {
    // STDERR ONLY — MCP SAFE
    console.error('Tool execution error:', error);
    return {
      content: [{ type: 'text', text: 'Internal server error' }],
      isError: true,
    };
  }
});

/* ===============================
   SERVER START
================================ */

async function startServer() {
  try {
    await dbClient.connect();
    console.error('PostgreSQL connected');

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('MCP server listening via STDIO');
  } catch (err) {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
  }
}

startServer();
