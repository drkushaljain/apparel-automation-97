// ... keep existing code

import postgresService from './postgresService';

// Add PostgreSQL support
let usePostgres = false;

export const initializeDatabase = async (
  initialProducts: Product[] = [],
  initialCustomers: Customer[] = [],
  initialOrders: Order[] = [],
  initialUsers: User[] = []
) => {
  // Try to connect to PostgreSQL if environment variables are set
  if (typeof process !== 'undefined' && process.env && process.env.DB_HOST) {
    try {
      await postgresService.initPostgresConnection();
      usePostgres = true;
      console.log('Using PostgreSQL database');
      
      // Check if we need to seed the database
      const products = await getProducts();
      if (products.length === 0) {
        console.log('Seeding PostgreSQL database with initial data');
        
        // Seed products
        for (const product of initialProducts) {
          await postgresService.createProduct(product);
        }
        
        // Seed other data similarly
        // ...
      }
      
      return;
    } catch (error) {
      console.error('Failed to initialize PostgreSQL, falling back to localStorage', error);
      usePostgres = false;
    }
  }
  
  // Fall back to localStorage if PostgreSQL is not available
  console.log('Using localStorage for data storage');
  
  // ... keep existing localStorage initialization code
};

// Update all database operations to use PostgreSQL when available

export const getProducts = async (): Promise<Product[]> => {
  if (usePostgres) {
    return postgresService.getProducts();
  }
  
  // ... keep existing localStorage implementation
};

// ... update other database operations similarly

export const updateProductStock = async (
  productId: string, 
  newStock: number,
  reason: string,
  userId: string,
  userName: string
): Promise<boolean> => {
  if (usePostgres) {
    const product = await postgresService.getProductById(productId);
    if (!product) return false;
    
    const previousStock = product.stock;
    product.stock = newStock;
    
    const updated = await postgresService.updateProduct(product);
    if (!updated) return false;
    
    // Record stock history
    await postgresService.addStockHistory({
      productId,
      productName: product.name,
      previousStock,
      newStock,
      changeAmount: newStock - previousStock,
      userId,
      userName,
      timestamp: new Date(),
      reason
    });
    
    return true;
  }
  
  // ... keep existing localStorage implementation
};

// ... keep remaining code
