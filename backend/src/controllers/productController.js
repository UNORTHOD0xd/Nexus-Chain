import prisma from '../config/database.js';
import QRCode from 'qrcode';

/**
 * Register new product
 * POST /api/products
 */
export const registerProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      category,
      manufacturingDate,
      expiryDate,
      originLocation,
      minTemperature,
      maxTemperature,
      batchNumber,
    } = req.body;

    // Validate required fields
    if (!productId || !name || !category || !manufacturingDate || !originLocation) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, name, category, manufacturing date, and origin location are required',
      });
    }

    // Check if product ID already exists
    const existingProduct = await prisma.product.findUnique({
      where: { productId },
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this ID already exists',
      });
    }

    // Generate QR code
    const qrData = JSON.stringify({
      productId,
      name,
      manufacturer: req.user.name,
      timestamp: new Date().toISOString(),
    });
    const qrCode = await QRCode.toDataURL(qrData);

    // Create product
    const product = await prisma.product.create({
      data: {
        productId,
        name,
        description,
        category,
        manufacturingDate: new Date(manufacturingDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        originLocation,
        currentLocation: originLocation,
        minTemperature,
        maxTemperature,
        batchNumber,
        qrCode,
        manufacturerId: req.user.id,
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product registered successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Register product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all products (with filters)
 * GET /api/products
 */
export const getAllProducts = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      manufacturerId,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object
    const where = { isActive: true };

    if (status) {
      where.currentStatus = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { productId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (manufacturerId) {
      where.manufacturerId = manufacturerId;
    }

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        checkpoints: {
          select: {
            id: true,
            location: true,
            status: true,
            timestamp: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            checkpoints: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    // Add checkpoints count and latest checkpoint to each product
    const productsWithCheckpoints = products.map((product) => ({
      ...product,
      checkpointsCount: product._count.checkpoints,
      latestCheckpoint: product.checkpoints[0] || null,
      checkpoints: undefined,
      _count: undefined,
    }));

    res.json({
      success: true,
      data: {
        products: productsWithCheckpoints,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        checkpoints: {
          include: {
            handler: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
        _count: {
          select: {
            checkpoints: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: {
        product: {
          ...product,
          checkpointsCount: product._count.checkpoints,
          _count: undefined,
        },
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Verify product by product ID
 * GET /api/products/verify/:productId
 */
export const verifyProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { productId },
      include: {
        manufacturer: {
          select: {
            name: true,
            company: true,
          },
        },
        checkpoints: {
          select: {
            location: true,
            status: true,
            timestamp: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            checkpoints: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        verified: false,
      });
    }

    res.json({
      success: true,
      verified: true,
      data: {
        product: {
          id: product.id,
          productId: product.productId,
          name: product.name,
          category: product.category,
          manufacturer: product.manufacturer,
          manufacturingDate: product.manufacturingDate,
          currentStatus: product.currentStatus,
          currentLocation: product.currentLocation || product.originLocation,
          checkpointsCount: product._count.checkpoints,
          latestCheckpoint: product.checkpoints[0] || null,
        },
      },
    });
  } catch (error) {
    console.error('Verify product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      currentStatus,
      currentLocation,
      minTemperature,
      maxTemperature,
    } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check authorization (only manufacturer can update)
    if (existingProduct.manufacturerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (currentStatus !== undefined) updateData.currentStatus = currentStatus;
    if (currentLocation !== undefined) updateData.currentLocation = currentLocation;
    if (minTemperature !== undefined) updateData.minTemperature = minTemperature;
    if (maxTemperature !== undefined) updateData.maxTemperature = maxTemperature;

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update product blockchain hash
 * PUT /api/products/:id/blockchain
 */
export const updateBlockchainHash = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchainHash, blockchainId } = req.body;

    if (!blockchainHash) {
      return res.status(400).json({
        success: false,
        message: 'Blockchain hash is required',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check authorization
    if (product.manufacturerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        blockchainHash,
        blockchainId,
      },
    });

    res.json({
      success: true,
      message: 'Blockchain hash updated successfully',
      data: { product: updatedProduct },
    });
  } catch (error) {
    console.error('Update blockchain hash error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blockchain hash',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete product (soft delete)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check authorization
    if (product.manufacturerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
