'use server';

import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { ActionState } from './account';

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionState> {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { currentPassword, newPassword, confirmPassword } = data;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: 'All fields are required' };
    }

    if (newPassword !== confirmPassword) {
      return { error: 'New passwords do not match' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });
    return { success: 'Password updated successfully' };
  } catch (error) {
    console.error('Error updating password:', error);
    return { error: 'Failed to update password' };
  }
}


