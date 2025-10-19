import prisma from '../config/database.js';

/**
 * Add checkpoint to product
 * POST /api/checkpoints
 */
export const addCheckpoint = async (req, res) => {
  try {
    const {
      productId,
      location,
      latitude,
      longitude,
      status,
      temperature,
      humidity,
      notes,
      blockchainHash,
    } = req.body;

    // Validate required fields
    if (!productId || !location || !status) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, location, and status are required',
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Create checkpoint
    const checkpoint = await prisma.checkpoint.create({
      data: {
        productId,
        location,
        latitude,
        longitude,
        status,
        temperature,
        humidity,
        notes,
        handledBy: req.user.id,
        blockchainHash,
      },
      include: {
        handler: {
          select: {
            id: true,
            name: true,
            company: true,
            role: true,
          },
        },
      },
    });

    // Update product's current location and status
    await prisma.product.update({
      where: { id: productId },
      data: {
        currentLocation: location,
        currentStatus: status,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Checkpoint added successfully',
      data: { checkpoint },
    });
  } catch (error) {
    console.error('Add checkpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add checkpoint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all checkpoints for a product
 * GET /api/checkpoints/product/:productId
 */
export const getCheckpointsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const checkpoints = await prisma.checkpoint.findMany({
      where: { productId },
      include: {
        handler: {
          select: {
            id: true,
            name: true,
            company: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        checkpoints,
        count: checkpoints.length,
      },
    });
  } catch (error) {
    console.error('Get checkpoints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch checkpoints',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get checkpoint by ID
 * GET /api/checkpoints/:id
 */
export const getCheckpointById = async (req, res) => {
  try {
    const { id } = req.params;

    const checkpoint = await prisma.checkpoint.findUnique({
      where: { id },
      include: {
        handler: {
          select: {
            id: true,
            name: true,
            company: true,
            role: true,
          },
        },
        product: {
          select: {
            id: true,
            productId: true,
            name: true,
            category: true,
          },
        },
      },
    });

    if (!checkpoint) {
      return res.status(404).json({
        success: false,
        message: 'Checkpoint not found',
      });
    }

    res.json({
      success: true,
      data: { checkpoint },
    });
  } catch (error) {
    console.error('Get checkpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch checkpoint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update checkpoint
 * PUT /api/checkpoints/:id
 */
export const updateCheckpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      location,
      latitude,
      longitude,
      status,
      temperature,
      humidity,
      notes,
      blockchainHash,
    } = req.body;

    // Check if checkpoint exists
    const existingCheckpoint = await prisma.checkpoint.findUnique({
      where: { id },
    });

    if (!existingCheckpoint) {
      return res.status(404).json({
        success: false,
        message: 'Checkpoint not found',
      });
    }

    // Check authorization (only handler or admin can update)
    if (
      existingCheckpoint.handledBy !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this checkpoint',
      });
    }

    // Build update data
    const updateData = {};
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (status !== undefined) updateData.status = status;
    if (temperature !== undefined) updateData.temperature = temperature;
    if (humidity !== undefined) updateData.humidity = humidity;
    if (notes !== undefined) updateData.notes = notes;
    if (blockchainHash !== undefined) updateData.blockchainHash = blockchainHash;

    // Update checkpoint
    const checkpoint = await prisma.checkpoint.update({
      where: { id },
      data: updateData,
      include: {
        handler: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    // If status or location changed, update product
    if (status !== undefined || location !== undefined) {
      await prisma.product.update({
        where: { id: existingCheckpoint.productId },
        data: {
          ...(status && { currentStatus: status }),
          ...(location && { currentLocation: location }),
        },
      });
    }

    res.json({
      success: true,
      message: 'Checkpoint updated successfully',
      data: { checkpoint },
    });
  } catch (error) {
    console.error('Update checkpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update checkpoint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete checkpoint
 * DELETE /api/checkpoints/:id
 */
export const deleteCheckpoint = async (req, res) => {
  try {
    const { id } = req.params;

    const checkpoint = await prisma.checkpoint.findUnique({
      where: { id },
    });

    if (!checkpoint) {
      return res.status(404).json({
        success: false,
        message: 'Checkpoint not found',
      });
    }

    // Check authorization
    if (checkpoint.handledBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this checkpoint',
      });
    }

    await prisma.checkpoint.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Checkpoint deleted successfully',
    });
  } catch (error) {
    console.error('Delete checkpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete checkpoint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get temperature alerts for a product
 * GET /api/checkpoints/product/:productId/alerts
 */
export const getTemperatureAlerts = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get product with temperature ranges
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!product.minTemperature && !product.maxTemperature) {
      return res.json({
        success: true,
        data: {
          alerts: [],
          count: 0,
          message: 'No temperature range defined for this product',
        },
      });
    }

    // Find checkpoints with temperature violations
    const checkpoints = await prisma.checkpoint.findMany({
      where: {
        productId,
        temperature: {
          not: null,
        },
      },
      include: {
        handler: {
          select: {
            name: true,
            company: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Filter checkpoints with temperature violations
    const alerts = checkpoints.filter((checkpoint) => {
      const temp = checkpoint.temperature;
      if (
        product.minTemperature &&
        temp < product.minTemperature
      ) {
        checkpoint.alertType = 'TOO_COLD';
        checkpoint.threshold = product.minTemperature;
        return true;
      }
      if (
        product.maxTemperature &&
        temp > product.maxTemperature
      ) {
        checkpoint.alertType = 'TOO_HOT';
        checkpoint.threshold = product.maxTemperature;
        return true;
      }
      return false;
    });

    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
        temperatureRange: {
          min: product.minTemperature,
          max: product.maxTemperature,
        },
      },
    });
  } catch (error) {
    console.error('Get temperature alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temperature alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
