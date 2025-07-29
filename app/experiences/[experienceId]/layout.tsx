import { WhopWebsocketProvider } from '@whop/react';

export default async function ExperienceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;

  return (
    <>
      {children}
    </>
  );
}
