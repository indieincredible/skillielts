'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export type ActionState = {
  error?: string;
  success?: string;
};

export async function updateAccount(state: ActionState, formData: FormData): Promise<ActionState> {
  const name = formData.get('name') as string;

  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    if (!name) {
      return { error: 'Name is required' };
    }

    await db.user.update({
      where: { id: user.id },
      data: { name },
    });

    revalidatePath('/dashboard/general');
    return { success: 'Profile updated!' };
  } catch (error) {
    console.error('Error updating account:', error);
    return { error: 'Something went wrong!' };
  }
}

export async function deleteAccount(): Promise<ActionState> {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    await db.user.delete({
      where: { id: user.id },
    });

    return { success: 'Account deleted successfully' };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { error: 'Failed to delete account' };
  }
}


