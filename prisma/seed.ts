import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System Administrator with full access',
      isSystemRole: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard Application User',
      isSystemRole: true,
    },
  });

  await prisma.role.upsert({
    where: { name: 'GUEST' },
    update: {},
    create: {
      name: 'GUEST',
      description: 'Guest user with read-only limited access',
      isSystemRole: true,
    },
  });

  console.log('✅ Roles seeded');

  // 2. Seed Permissions
  const permissionsData = [
    { action: 'read', resource: 'users', description: 'Read user profiles' },
    { action: 'write', resource: 'users', description: 'Update user profiles' },
    { action: 'delete', resource: 'users', description: 'Delete users' },
    { action: 'read', resource: 'settings', description: 'Read system settings' },
    { action: 'write', resource: 'settings', description: 'Update system settings' },
    { action: 'read', resource: 'audit_logs', description: 'View security audit logs' },
  ];

  const createdPermissions = [];
  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { action_resource: { action: perm.action, resource: perm.resource } },
      update: {},
      create: perm,
    });
    createdPermissions.push(p);
  }

  console.log('✅ Permissions seeded');

  // 3. Map Permissions to Admin Role
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // 4. Map User Permissions
  const userPerms = createdPermissions.filter((p) => p.resource === 'users' && (p.action === 'read' || p.action === 'write'));
  for (const perm of userPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: userRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: userRole.id, permissionId: perm.id },
    });
  }

  console.log('✅ RolePermissions mapped');

  // 5. Seed Initial Admin User
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      isEmailVerified: true,
      isActive: true,
      roleId: adminRole.id,
      userPreferences: {
        create: {
          theme: 'SYSTEM',
          emailNotifications: true,
          twoFactorEnabled: false,
        },
      },
    },
  });

  console.log(`✅ Default Admin user created: ${adminUser.email}`);

  // 6. Seed System Settings
  const settingsData = [
    { key: 'APP_NAME', value: 'AI Assistant Platform', description: 'Application display name' },
    { key: 'MAINTENANCE_MODE', value: 'false', description: 'Toggle maintenance mode' },
    { key: 'ALLOW_REGISTRATION', value: 'true', description: 'Enable user registration' },
  ];

  for (const setting of settingsData) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ System Settings seeded');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
