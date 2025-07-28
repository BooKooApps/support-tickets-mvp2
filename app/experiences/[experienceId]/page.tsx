import { redirect } from 'next/navigation';

export default async function HomePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;

  // Redirect to customer page by default
  redirect(`/experiences/${experienceId}/customer`);
}
