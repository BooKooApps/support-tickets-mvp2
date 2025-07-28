import { verifyUser } from '../authentication';

export async function createTicket(formData: FormData) {
  const experienceId = assertString(formData.get('experienceId'));
  const username = assertString(formData.get('username'));

  const { userId: currentUserId, username: currentUsername } =
    await verifyUser(experienceId);
}

function assertString(value: unknown): string {
  if (!value) {
    throw new Error('Value is required');
  }

  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }

  return value;
}
