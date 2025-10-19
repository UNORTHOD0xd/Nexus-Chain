import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (optional - comment out for production)
  console.log('🗑️  Clearing existing data...');
  await prisma.checkpoint.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Data cleared\n');

  // Create demo users
  console.log('👥 Creating demo users...');

  const hashedPassword = await bcrypt.hash('demo1234', 10);

  const manufacturer = await prisma.user.create({
    data: {
      email: 'manufacturer@nexuschain.com',
      password: hashedPassword,
      name: 'Pfizer Manufacturing',
      role: 'MANUFACTURER',
      company: 'Pfizer Inc.',
      phone: '+1-555-0101',
      walletAddress: '0xF31A99A843bA137e19b4146c4FEa19B5A6f0c435',
      isActive: true,
    },
  });

  const logistics = await prisma.user.create({
    data: {
      email: 'logistics@nexuschain.com',
      password: hashedPassword,
      name: 'DHL Logistics',
      role: 'LOGISTICS',
      company: 'DHL Supply Chain',
      phone: '+1-555-0102',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      isActive: true,
    },
  });

  const retailer = await prisma.user.create({
    data: {
      email: 'retailer@nexuschain.com',
      password: hashedPassword,
      name: 'CVS Pharmacy',
      role: 'RETAILER',
      company: 'CVS Health',
      phone: '+1-555-0103',
      walletAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      isActive: true,
    },
  });

  const consumer = await prisma.user.create({
    data: {
      email: 'consumer@nexuschain.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'CONSUMER',
      phone: '+1-555-0104',
      walletAddress: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexuschain.com',
      password: hashedPassword,
      name: 'NexusChain Admin',
      role: 'ADMIN',
      company: 'NexusChain',
      phone: '+1-555-0100',
      walletAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      isActive: true,
    },
  });

  console.log(`✅ Created ${5} demo users\n`);

  // Create demo products
  console.log('📦 Creating demo products...');

  // Generate unique QR codes
  const qrCode1 = await QRCode.toDataURL(JSON.stringify({
    productId: 'PFZ-CV19-001',
    name: 'Pfizer COVID-19 Vaccine',
    manufacturer: 'Pfizer Manufacturing',
    timestamp: new Date('2025-01-15').toISOString(),
  }));

  const product1 = await prisma.product.create({
    data: {
      productId: 'PFZ-CV19-001',
      name: 'Pfizer COVID-19 Vaccine',
      description: 'mRNA-based vaccine for COVID-19 prevention. Requires ultra-cold storage at -70°C.',
      category: 'PHARMACEUTICALS',
      manufacturerId: manufacturer.id,
      manufacturingDate: new Date('2025-01-15'),
      expiryDate: new Date('2025-07-15'),
      batchNumber: 'BATCH-2025-001',
      originLocation: 'Pfizer Manufacturing Facility, Boston, MA',
      currentLocation: 'CVS Pharmacy, Kingston, Jamaica',
      currentStatus: 'DELIVERED',
      minTemperature: -80.0,
      maxTemperature: -60.0,
      blockchainHash: '0x123abc...', // Placeholder
      blockchainId: 0,
      qrCode: qrCode1,
      isActive: true,
    },
  });

  const qrCode2 = await QRCode.toDataURL(JSON.stringify({
    productId: 'PFZ-INS-002',
    name: 'Insulin Vials (Humalog)',
    manufacturer: 'Pfizer Manufacturing',
    timestamp: new Date('2025-02-01').toISOString(),
  }));

  const product2 = await prisma.product.create({
    data: {
      productId: 'PFZ-INS-002',
      name: 'Insulin Vials (Humalog)',
      description: 'Fast-acting insulin for diabetes management. Must be refrigerated between 2-8°C.',
      category: 'PHARMACEUTICALS',
      manufacturerId: manufacturer.id,
      manufacturingDate: new Date('2025-02-01'),
      expiryDate: new Date('2026-02-01'),
      batchNumber: 'BATCH-2025-002',
      originLocation: 'Pfizer Manufacturing Facility, Boston, MA',
      currentLocation: 'DHL Warehouse, Miami, FL',
      currentStatus: 'IN_TRANSIT',
      minTemperature: 2.0,
      maxTemperature: 8.0,
      blockchainHash: '0x456def...',
      blockchainId: 1,
      qrCode: qrCode2,
      isActive: true,
    },
  });

  const qrCode3 = await QRCode.toDataURL(JSON.stringify({
    productId: 'APPL-IPH-003',
    name: 'iPhone 15 Pro Max',
    manufacturer: 'Pfizer Manufacturing',
    timestamp: new Date('2025-03-10').toISOString(),
  }));

  const product3 = await prisma.product.create({
    data: {
      productId: 'APPL-IPH-003',
      name: 'iPhone 15 Pro Max',
      description: 'Latest flagship smartphone from Apple Inc. 256GB, Titanium Blue.',
      category: 'ELECTRONICS',
      manufacturerId: manufacturer.id,
      manufacturingDate: new Date('2025-03-10'),
      batchNumber: 'BATCH-2025-003',
      originLocation: 'Foxconn Factory, Shenzhen, China',
      currentLocation: 'Foxconn Factory, Shenzhen, China',
      currentStatus: 'REGISTERED',
      blockchainHash: '0x789ghi...',
      blockchainId: 2,
      qrCode: qrCode3,
      isActive: true,
    },
  });

  console.log(`✅ Created ${3} demo products\n`);

  // Create checkpoints for product 1 (Complete journey)
  console.log('📍 Creating checkpoints for COVID-19 Vaccine...');

  await prisma.checkpoint.create({
    data: {
      productId: product1.id,
      location: 'Pfizer Manufacturing Facility, Boston, MA',
      latitude: 42.3601,
      longitude: -71.0589,
      status: 'REGISTERED',
      temperature: -70.5,
      humidity: 45.0,
      notes: 'Product manufactured and quality checked',
      handledBy: manufacturer.id,
      blockchainHash: '0xabc123...',
      timestamp: new Date('2025-01-15T08:00:00Z'),
    },
  });

  await prisma.checkpoint.create({
    data: {
      productId: product1.id,
      location: 'DHL Logistics Hub, Boston, MA',
      latitude: 42.3656,
      longitude: -71.0096,
      status: 'IN_TRANSIT',
      temperature: -72.0,
      humidity: 42.0,
      notes: 'Picked up by DHL, in transit to Miami',
      handledBy: logistics.id,
      blockchainHash: '0xdef456...',
      timestamp: new Date('2025-01-16T10:30:00Z'),
    },
  });

  await prisma.checkpoint.create({
    data: {
      productId: product1.id,
      location: 'DHL Warehouse, Miami, FL',
      latitude: 25.7617,
      longitude: -80.1918,
      status: 'IN_TRANSIT',
      temperature: -68.0,
      humidity: 50.0,
      notes: 'Arrived at Miami hub, preparing for international shipment',
      handledBy: logistics.id,
      blockchainHash: '0xghi789...',
      timestamp: new Date('2025-01-17T14:00:00Z'),
    },
  });

  await prisma.checkpoint.create({
    data: {
      productId: product1.id,
      location: 'Norman Manley International Airport, Kingston, Jamaica',
      latitude: 17.9357,
      longitude: -76.7875,
      status: 'IN_TRANSIT',
      temperature: -71.5,
      humidity: 55.0,
      notes: 'Cleared customs, awaiting final delivery',
      handledBy: logistics.id,
      blockchainHash: '0xjkl012...',
      timestamp: new Date('2025-01-18T09:00:00Z'),
    },
  });

  await prisma.checkpoint.create({
    data: {
      productId: product1.id,
      location: 'CVS Pharmacy, Kingston, Jamaica',
      latitude: 18.0179,
      longitude: -76.8099,
      status: 'DELIVERED',
      temperature: -69.0,
      humidity: 48.0,
      notes: 'Successfully delivered to CVS Pharmacy, ready for distribution',
      handledBy: retailer.id,
      blockchainHash: '0xmno345...',
      timestamp: new Date('2025-01-18T16:30:00Z'),
    },
  });

  console.log(`✅ Created ${5} checkpoints for COVID-19 Vaccine\n`);

  // Create checkpoints for product 2 (In transit)
  console.log('📍 Creating checkpoints for Insulin...');

  await prisma.checkpoint.create({
    data: {
      productId: product2.id,
      location: 'Pfizer Manufacturing Facility, Boston, MA',
      latitude: 42.3601,
      longitude: -71.0589,
      status: 'REGISTERED',
      temperature: 4.5,
      humidity: 50.0,
      notes: 'Insulin batch manufactured and packaged',
      handledBy: manufacturer.id,
      blockchainHash: '0xpqr678...',
      timestamp: new Date('2025-02-01T07:00:00Z'),
    },
  });

  await prisma.checkpoint.create({
    data: {
      productId: product2.id,
      location: 'DHL Logistics Hub, Boston, MA',
      latitude: 42.3656,
      longitude: -71.0096,
      status: 'IN_TRANSIT',
      temperature: 5.0,
      humidity: 48.0,
      notes: 'In refrigerated truck to Miami',
      handledBy: logistics.id,
      blockchainHash: '0xstu901...',
      timestamp: new Date('2025-02-02T11:00:00Z'),
    },
  });

  await prisma.checkpoint.create({
    data: {
      productId: product2.id,
      location: 'DHL Warehouse, Miami, FL',
      latitude: 25.7617,
      longitude: -80.1918,
      status: 'IN_TRANSIT',
      temperature: 4.0,
      humidity: 52.0,
      notes: 'Currently in cold storage at Miami hub',
      handledBy: logistics.id,
      blockchainHash: '0xvwx234...',
      timestamp: new Date('2025-02-03T15:30:00Z'),
    },
  });

  console.log(`✅ Created ${3} checkpoints for Insulin\n`);

  // Create initial checkpoint for product 3
  console.log('📍 Creating checkpoint for iPhone...');

  await prisma.checkpoint.create({
    data: {
      productId: product3.id,
      location: 'Foxconn Factory, Shenzhen, China',
      latitude: 22.5431,
      longitude: 114.0579,
      status: 'REGISTERED',
      temperature: 22.0,
      humidity: 60.0,
      notes: 'iPhone assembled and quality tested',
      handledBy: manufacturer.id,
      blockchainHash: '0xyzabc567...',
      timestamp: new Date('2025-03-10T10:00:00Z'),
    },
  });

  console.log(`✅ Created ${1} checkpoint for iPhone\n`);

  // Summary
  console.log('📊 Seed Summary:');
  console.log('================');
  console.log(`👥 Users: ${5}`);
  console.log(`   - Manufacturers: 1`);
  console.log(`   - Logistics: 1`);
  console.log(`   - Retailers: 1`);
  console.log(`   - Consumers: 1`);
  console.log(`   - Admins: 1`);
  console.log(`\n📦 Products: ${3}`);
  console.log(`   - Delivered: 1 (COVID-19 Vaccine)`);
  console.log(`   - In Transit: 1 (Insulin)`);
  console.log(`   - Registered: 1 (iPhone)`);
  console.log(`\n📍 Checkpoints: ${9} total`);
  console.log('\n🔐 Demo Login Credentials:');
  console.log('===========================');
  console.log('Email: manufacturer@nexuschain.com | Password: demo1234 | Role: Manufacturer');
  console.log('Email: logistics@nexuschain.com    | Password: demo1234 | Role: Logistics');
  console.log('Email: retailer@nexuschain.com     | Password: demo1234 | Role: Retailer');
  console.log('Email: consumer@nexuschain.com     | Password: demo1234 | Role: Consumer');
  console.log('Email: admin@nexuschain.com        | Password: demo1234 | Role: Admin');
  console.log('\n✅ Database seeded successfully! 🎉\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
