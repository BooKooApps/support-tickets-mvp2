import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { verifyUser } from '@/lib/authentication';
import PermissionWall from '@/components/permission-wall';

export default async function HomePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;

  const { userId, username, accessLevel } = await verifyUser(experienceId);

  return (
    <PermissionWall experienceId={experienceId}>
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='max-w-4xl w-full'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold  mb-4'>Support Tickets MVP</h1>
            <p className='text-xl text-muted-foreground mb-8'>
              Comprehensive ticket management system for creators and customers
            </p>
            <div className='inline-flex items-center gap-4 justify-center mb-4'>
              <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-muted'>
                <span className='font-semibold text-primary'>{username}</span>
                <span className='text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide'>
                  {accessLevel}
                </span>
              </div>
              <div className='flex items-center gap-1 px-3 py-1 rounded bg-muted text-xs text-muted-foreground border border-muted-foreground/10'>
                <span className='font-mono'>User ID:</span>
                <span className='font-mono text-[13px] break-all'>
                  {userId}
                </span>
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-2 gap-8'>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-primary rounded-full'></div>
                  Creator Dashboard
                </CardTitle>
                <CardDescription>
                  Manage tickets, view analytics, and configure settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm text-muted-foreground mb-6'>
                  <li>• View and manage open tickets</li>
                  <li>• Comprehensive analytics dashboard</li>
                  <li>• Customize categories and messages</li>
                  <li>• Review customer feedback</li>
                </ul>
                <Link href={`/experiences/${experienceId}/creator`}>
                  <Button className='w-full'>Access Creator Dashboard</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  Customer Portal
                </CardTitle>
                <CardDescription>
                  Submit tickets and track support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm text-muted-foreground mb-6'>
                  <li>• Create and manage support tickets</li>
                  <li>• Real-time chat with support</li>
                  <li>• Track ticket status</li>
                  <li>• Leave reviews and feedback</li>
                </ul>
                <Link href={`/experiences/${experienceId}/customer`}>
                  <Button variant='outline' className='w-full bg-transparent'>
                    Access Customer Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionWall>
  );
}
